'use strict'

const manifest = {
  "css/site.css": "css/site-e9fd817c2e.css",
  "css/vendor/docsearch.css": "css/vendor/docsearch-7619faa207.css",
  "img/algolia.svg": "img/algolia-f4ab98e0de.svg",
  "img/apache-kafka.svg": "img/apache-kafka-88809b7472.svg",
  "img/apache-karaf.svg": "img/apache-karaf-7bdb5ce2e3.svg",
  "img/back.svg": "img/back-e8d811f74c.svg",
  "img/books.svg": "img/books-77a59b07e1.svg",
  "img/brand-logos.svg": "img/brand-logos-a2b35bbdec.svg",
  "img/bugfix.svg": "img/bugfix-4280bf9490.svg",
  "img/calendar.svg": "img/calendar-b4b3ab1bf7.svg",
  "img/caret.svg": "img/caret-8823676a4b.svg",
  "img/chevron.svg": "img/chevron-63cb534773.svg",
  "img/cli.svg": "img/cli-9cede0128a.svg",
  "img/close.svg": "img/close-af0b99e31b.svg",
  "img/community.svg": "img/community-2ec8a3dc8b.svg",
  "img/copy-checkmark.svg": "img/copy-checkmark-9a4caf1664.svg",
  "img/copy.svg": "img/copy-d7c1e3194d.svg",
  "img/docs.svg": "img/docs-7d0adf1156.svg",
  "img/examples.svg": "img/examples-07d01f2bc0.svg",
  "img/github.svg": "img/github-0cae1e39c4.svg",
  "img/jbang.svg": "img/jbang-e88e00f7fa.svg",
  "img/karavan.svg": "img/karavan-8621354711.svg",
  "img/knative.svg": "img/knative-5010ee4773.svg",
  "img/kubernetes.svg": "img/kubernetes-07ba46aaa2.svg",
  "img/logo-d.svg": "img/logo-d-a567cee6fa.svg",
  "img/menu.svg": "img/menu-8775cec4be.svg",
  "img/quarkus.svg": "img/quarkus-446ffca541.svg",
  "img/read.svg": "img/read-d475016106.svg",
  "img/search.svg": "img/search-a73cfec790.svg",
  "img/security.svg": "img/security-06abe157b3.svg",
  "img/sparkle.svg": "img/sparkle-da54b1f43c.svg",
  "img/spring-boot.svg": "img/spring-boot-0a7cb95564.svg",
  "img/tooling.svg": "img/tooling-f5e235c238.svg",
  "img/user-stories.svg": "img/user-stories-cccc5f7c8f.svg",
  "js/site.js": "js/site-21aaacf9b8.js",
  "js/vendor/docsearch.js": "js/vendor/docsearch-f8ce9408ec.js",
  "js/vendor/highlight.js": "js/vendor/highlight-de2def4bea.js",
  "js/vendor/svg4everybody.js": "js/vendor/svg4everybody-a0c573f2b9.js",
  "js/vendor/tabs.js": "js/vendor/tabs-5aea11bcf5.js"
}

module.exports = (resource) => {
  return '/' +  manifest[resource]
}

