<template>
  <aside aria-label="Aside">
    <ul class="listbox" v-if="navigation2?.length > 0">
      <li class="heading">In this section</li>
        <div v-for="dir in navigation2" :key="dir._path" >
          <div v-for="link in dir.children" :key="link._path">
            <li :class="{selected: link._path == page._path}" v-if="link._path != '/'"><a :href="link._path">
              {{ link.title }}
            </a></li>
          </div>
        </div>
    </ul>
  </aside>
</template>

<script setup lang="ts">
const { page } = useContent()

let path = page.value._path;

// if this is a section, we want the navigation for the current path, if an article or product, the
// path to the parent section

let section = true;
if (page.value.type == 'article' || page.value.type == 'product' && path.lastIndexOf("/") > 0) {
  section = false;
  path = path.substring(0, path.lastIndexOf("/"));
}
let currentPathQuery = queryContent({where: {_path: { $contains: path }}})
if (path == "/") {
  currentPathQuery = queryContent()
}
const { data: navigation2 } = await useAsyncData(path + '_navigation', () => fetchContentNavigation(currentPathQuery))
</script>
