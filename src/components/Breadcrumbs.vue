<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <template v-for="(item,index) in breadcrumbs" :key="index">
        <li>
            <svg v-if="item._path == '/'" class="me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            <svg v-if="item._path != '/'" class="rtl:rotate-180 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
            </svg>
            <a :href="item._path">
              {{ item.title }}
            </a>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">

  // finding breadcrumbs from navigation tree
  function resolvePath(path, nav, bc) {
    for (const navItem of nav) {
      if (path.startsWith(navItem._path)) {
        bc.push(navItem);
        if (navItem.children) {
          resolvePath(path, navItem.children, bc)
        }
      }
    }
  }

  const { page, navigation } = useContent()
  const breadcrumbs = []

  resolvePath(page.value._path, navigation.value, breadcrumbs)
  breadcrumbs.sort((a, b) => a.title.length - b.title.length);
</script>
