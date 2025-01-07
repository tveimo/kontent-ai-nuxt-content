<template>
  <aside aria-label="Aside">
    <ul class="listbox" v-if="inSection?.length > 0">
      <li class="heading">In this section</li>
        <template v-for="link in inSection" :key="link._path" >
          <li :class="{selected: link._path == page._path}" v-if="link._path != '/' && link.type != 'section'">
            <a :href="link._path">{{ link.title }}</a>
          </li>
        </template>
    </ul>

    <ul class="listbox" v-if="inSection?.length > 0">
      <li class="heading">Subsections</li>
      <template v-for="link in inSection" :key="link._path">
        <li :class="{selected: link._path == page._path}" v-if="link._path != '/' && link.type == 'section'">
          <a :href="link._path">{{ link.title }}</a>
        </li>
      </template>
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

const { data: navigation } = await useAsyncData(path + '_navigation', () => fetchContentNavigation())

const {
  navDirFromPath,
} = useContentHelpers()

let inSection = navDirFromPath(path, navigation.value)
if (!inSection) {
  inSection = navigation;
}

</script>
