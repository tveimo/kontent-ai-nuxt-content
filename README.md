# kontent-ai-nuxt-content
Publishing kontent.ai Headless CMS Content with Nuxt Content

There are a number of ways on adding back the head in a headless cms deployment. If you are comfortable with Vue.js and Nuxt.js, it would be preferable to reuse that knowledge and the immense power of these two frameworks.

Nuxt Content is an incredible content module for Nuxt which allows using markdown files in a content structure to easily publish content, with all the tooling and convenience that Nuxt and Nuxt Content provides. I also allows non-markdown and non-local content. 

This project defines a Nuxt Content driver that works with kontent.ai. It allows publishing content within a nuxt content application.

This driver is not complete; there's further things required for full-fledged publishing such as modular content resolution and embedding, link resolution, and other things. Additionally, we'd want automatic reload if used for a preview site, or when new or updated items are published in kontent.ai. I might add these features to this project as time permits.

When debugging your content, it might help looking at the content of `.nuxt/content-cache/content-index.json` which will show the mapping from paths to content items.

## How to test

do a 

```yarn install```

followed by a

```yarn dev``` 

and open up http://localhost:3000 in your browser. 

The current project uses a test project I'm currently hosting. I'll publish an export of the project shortly, so that you can import it into your own environment with kontent.ai, and start exploring with your own modifications.


Icons from the google material icons fontset. Lorem Ipsum from https://loremipsum.io/. Photos by Tranmautritam: https://www.pexels.com https://www.instagram.com/tranmautritam 
