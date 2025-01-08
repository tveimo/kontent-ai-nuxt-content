<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <Breadcrumbs />
      <div class="flex">
        <div class="flex-grow mr-2">

          <h3>{{ doc.elements?.title?.value }}</h3>

          <div v-if="!doc.elements?.body" v-html="doc.elements?.description?.value"></div>

          <div v-if="doc.elements?.body" v-html="doc.elements?.body?.value"></div>

          <img v-if="doc.elements?.images && doc.elements.images.value.length > 0"
               :class="[{'max-h-64': doc.type == 'section'}, 'py-2 w-full object-cover']" :src="doc.elements.images.value[0].url" />

          <!-- for sections / homepage, we render article excerpts with title and description -->
          <template v-if="page.type == 'section' || page.type == 'homepage'">
            <h4><span v-if="articles.length == 0">No </span>Articles in this Section</h4>
            <section class="grid grid-cols-2">
              <template v-for="art of articles" :key="art._path">
                <article class="mr-2 mt-4">
                  <img v-if="art.elements.images && art.elements.images.value.length > 0"
                       :src="art.elements.images.value[0].url" class="max-h-48 w-full object-cover" />
                  <h4><a :href="art._path">{{ art.title }}</a></h4>
                  <p>{{ art.description }}</p>
                </article>
              </template>
            </section>
          </template>
        </div>
        <Aside />
      </div>
    </ContentDoc>
  </main>
</template>
<script lang="ts" setup>
  const { page } = useContent();
  // select articles / products to show excerpts for, based on parentPath
  const {data: articles} = await useAsyncData(() => queryContent(
    {
      where: {
        $and: [
          { parentPath: { $eq: page.value._path }},
          { type: { $in: ['article', 'product'] }}
        ]
      }
    }).find()
  )
</script>
