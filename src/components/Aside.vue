<template>
  <aside aria-label="Aside">
    <ul v-if="inSection?.length > 0" class="listbox">
      <li class="heading">In this section</li>
        <template v-for="link in inSection" :key="link._path" >
          <li v-if="link._path != '/' && link.type != 'section'" :class="{selected: link._path == page._path}">
            <a :href="link._path">{{ link.title }}</a>
          </li>
        </template>
    </ul>

    <ul v-if="inSection?.length > 0" class="listbox">
      <li class="heading">Subsections</li>
      <template v-for="link in inSection" :key="link._path">
        <li v-if="link._path != '/' && link.type == 'section'" :class="{selected: link._path == page._path}">
          <a :href="link._path">{{ link.title }}</a>
        </li>
      </template>
    </ul>

  </aside>
</template>

<script lang="ts" setup>
  const { page, navigation } = useContent();
  const { navDirFromPath } = useContentHelpers();

  let path = page.value._path;

  if (page.value.type == 'article' || page.value.type == 'product' && path.lastIndexOf("/") > 0) {
    path = path.substring(0, path.lastIndexOf("/"));
  }

  let inSection = navDirFromPath(path, navigation.value);
  if (!inSection) {
    inSection = navigation;
  }
</script>
