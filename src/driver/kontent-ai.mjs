import { defineDriver } from "unstorage";
import fs from "fs";
import {$fetch } from "ofetch";

const cachePath = ".cache/kontent-ai-cache.json";

const fetchContent = async (opts) => {
  let cachedItems = {};
  let items = {};

  const refresh  = opts.driverOptions.refresh ? parseInt(opts.driverOptions.refresh) : 30;

  let lastModified = "";
  let cache = { updated: "", items: {} };
  try {
    if (fs.existsSync(cachePath)) {
      const cachedData = await fs.readFileSync(cachePath);
      cache = JSON.parse(cachedData.toString());
    } else {
      console.log("kontent.ai: no previous cache file, using; ", cachePath);
    }
  } catch (ex) {
    console.error("kontent.ai: unable to read content cache file; ", ex);
  }

  if (cache && cache.items) {
    cachedItems = cache.items;
    items = cache.items;
    lastModified = cache.updated;
  } else {
    console.log("kontent.ai: no previous file, fetching all from remote");
  }

  const updated = new Date();

  const timestamp = new Date(Date.now() - refresh*60000);
  if (!lastModified || refresh == -1 || timestamp.getTime() > new Date(lastModified).getTime()) {

    console.time("kontent.ai: fetching took");
    let count = 0;

    const results = await fetch(opts, lastModified)

    if (results) {

      Object.keys(results).forEach(key => {
        const ci = results[key];
        cachedItems[key] = ci
        items[key] = ci;
        count++;
      });
      console.log("kontent.ai count: " + count + " items");
    }

    console.timeEnd("kontent.ai: fetching took");

    if (!fs.existsSync(".cache")) {
      console.log("kontent.ai: creating .cache directory");
      fs.mkdirSync(".cache");
    }
    fs.writeFileSync(cachePath,
      JSON.stringify({ updated: updated.toISOString(), items: cachedItems }, null, 2)
    );
  }

  return items;
}

export default defineDriver(opts => {
  let lastCheck = 0
  let syncPromise;

  let kontentItems = {};

  const syncContent = async () => {
    if ((lastCheck + opts.ttl * 1000) > Date.now()) {
      return
    }

    if (!syncPromise) {
      syncPromise = fetchContent(opts);
    }

    kontentItems = await syncPromise;
    lastCheck = Date.now();
    syncPromise = undefined;
  }

  return {
    getItem: async (key) => {
      key = getKey(key);
      await syncContent();
      return kontentItems[key];
    },
    async hasItem(key) {
      key = getKey(key);
      await syncContent();
      return key in kontentItems;
    },
    async setItem(key, value) {},
    async removeItem(key) {},

    // To my knowledge, getMeta is only called to check if a __deleted attribute is set.
    // see https://github.com/nuxt/content/blob/d8792efbb41de4e0c56361e940a2f042b58c816b/src/runtime/server/storage.ts#L105
    async getMeta(key) {
      key = getKey(key);
      await syncContent();
      const job = kontentItems[key];
      return job ? job.meta : null;
    },
    async getKeys() {
      await syncContent();
      if (!kontentItems) { return [] }
      return Object.keys(kontentItems);
    },
  };
});

function getKey(key) {
  if (key == "") {
    return "index";
  }
  return key;
}

// kontent.ai specific code

async function fetch(opts, lastUpdate) {
  let items =  await buildItems(opts.driverOptions.projectId, opts.driverOptions.apiKey,
    opts.driverOptions.usePreviewMode, lastUpdate);

  let kontentItems = {}

  // This project has urls constructed from the structure of nesting index pages and articles
  // We traverse from the homepage down each index page until we find an article or a product page.
  //
  // The other options for building urls in kontent.ai is to either use a nested topography tree to define
  // the url structure, and attach articles and index pages to these, or to have a flat structure with no nesting,
  // eg with paths like /articles/title-slug, which often means there's less index pages.
  //
  // Some sites needs a combination of these types combined, eg news items under /news/title-slug plus a free form
  // nested structure either configured using nested topographies, or linked content items.

  const pathPrefix = opts.prefix + !opts.prefix || !opts.prefix.endsWith("/") ? "/" : "";

  if (!items || Object.keys(items).length == 0) {
    return kontentItems;
  }


  for (const key of Object.keys(items)) {

    let item = items[key];

    item.type = item.system.type;
    item.navigation = { type: item.system.type };

    // There's a range of options here, for preprocessing data or not processing at all
    // We can even convert the data to markdown format (the item key would then need the ".md" suffix).

    item.title = item.elements?.title?.value;
    item.description = item.elements?.description?.value;

    if (item.system.type === "homepage") {
      const subpages = item?.elements?.subpages?.value;

      // item.path = pathPrefix + 'index';
      kontentItems['index.json'] = item;

      if (subpages?.length > 0) {
        for (const subpage of subpages) {
          const codename = subpage.system.codename
          if (items[codename]) {
            traverseItem(pathPrefix, kontentItems, '', items[codename], items)
          }
        }
      }
    }
  }
  return kontentItems;
}

function traverseItem(pathPrefix, kontentItems, parentPath, item, items) {
  let path = parentPath + (parentPath.length > 0 ? '/' : '') + item.elements.slug.value;
  kontentItems[path.replaceAll("/", ":") + ".json"] = item;

  const subpages = item?.elements?.subpages?.value;
  if (subpages?.length > 0) {
    for (const subpage of subpages) {
      const codename = subpage.system.codename;
      if (items[codename]) {
        traverseItem(pathPrefix, kontentItems, path, items[codename], items)
      }
    }
  }
}

async function buildItems(projectId, apiKey, usePreviewMode, lastUpdate) {
  const ret = {}

  let xContinuation = null;

  const startTimer = Date.now();
  let itemsCount = 0;

  const baseUrl = usePreviewMode ? "https://preview-deliver.kontent.ai" : "https://deliver.kontent.ai";

  fetch = $fetch.create({
    baseURL: `${baseUrl}/${projectId}`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Types": "application/json",
      "X-KC-Wait-For-Loading-New-Content": "true",
    },
  });

  do {
    try {
      const response = await fetch.raw("/items-feed", {
        params: {
          "system.collection": "default",
          ...(lastUpdate ? { "system.last_modified[gt]": lastUpdate } : {}),
        },
        method: "GET",
        ...(xContinuation
          ? {
            headers: {
              "X-Continuation": xContinuation,
            },
          }
          : {}),
      });
      xContinuation = response.headers.get("x-continuation");

      const items = response._data.items;
      const modularContent = response._data.modular_content;

      itemsCount += items.length;

      for (const item of items) {
        if (item.system.workflow_step === "archived") {
          continue;
        }
        if (!item.elements.slug?.value) {
          continue;
        }
        for (const key in item.elements) {
          if (!item.elements[key].value) continue;
          if (item.elements[key].type === "modular_content") {
            item.elements[key].value = item.elements[key].value.map(
              (codename) =>
                modularContent[codename] || items.find(item => item.system.codename === codename) || codename
            );
          }
        }
        ret[item.system.codename] = item; // kontent.ai uses the codename for internal references (eg subpages), not the id
      }
    } catch (err) {
      console.error("error loading content from kontent.ai;", err);
    }
  } while (xContinuation);
  console.log(`Fetched ${itemsCount} kontent.ai items in ${(Date.now() - startTimer) / 1000} seconds`);
  return ret;
}
