'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const { convertPage } = require('../gulp/helpers/convert-page')
const { createTurndownService } = require('../gulp/helpers/turndown-config')

function page (body) {
  return '<!DOCTYPE html><html><head><title>t</title></head><body><nav class="nav">menu</nav>' +
    `<main class="article"><article class="doc">\n${body}\n</article></main></body></html>`
}

const LATER_SECTION = `<div class="sect2">
<h3 id="_later"><a class="anchor" href="#_later"></a>Later section</h3>
<div class="paragraph">
<p>Still prose.</p>
</div>
</div>`

test('a well-formed page converts its article, dropping anchors and rewriting .html links', () => {
  const html = page(`<div class="doc-eyebrow">User manual</div>
<h2 id="_intro"><a class="anchor" href="#_intro"></a>Intro</h2>
<div class="paragraph">
<p>Use <code>camel run</code>, see <a href="other.html">Other</a>.</p>
</div>`)

  assert.deepEqual(convertPage(html, createTurndownService()), {
    markdown: '## Intro\n\nUse `camel run`, see [Other](other.md).',
    repaired: false,
  })
})

test('a page without main content yields no Markdown', () => {
  const html = '<!DOCTYPE html><html><head><title>t</title></head><body><p>verification</p></body></html>'

  assert.deepEqual(convertPage(html, createTurndownService()), { markdown: null, repaired: false })
})

// NOTE the fixtures below are what Asciidoctor emits for real Camel docs (security-model.adoc,
// camel-jbang-mcp.adoc). Browsers repair the mis-nesting, but node-html-parser drops the unmatched
// close tag and, at end of input, unwraps every unclosed ancestor including article.doc, so the
// page used to be skipped and its .md mirror 404ed. Asserting that the page merely converts is not
// enough: keeping the unclosed element open instead (parseNoneClosedTags) retains article.doc but
// nests everything after the glitch inside <code>, which Turndown flattens into one inline code
// span. The later heading and paragraph must survive as their own Markdown lines.
test('a wildcard read as bold inside backticks keeps the page and the sections after it', () => {
  const html = page(`<div class="paragraph">
<p>A candidate located in a <code>core/camel-<strong></code> module is judged against these
invariants first. If the engine upheld the invariant *and</strong> nothing else.</p>
</div>
${LATER_SECTION}`)

  const { markdown } = convertPage(html, createTurndownService())

  assert.notEqual(markdown, null)
  assert.match(markdown, /module is judged against these/)
  assert.match(markdown, /^### Later section$/m)
  assert.match(markdown, /^Still prose\.$/m)
})

test('an unterminated code span inside emphasis keeps the list items after it', () => {
  const html = page(`<div class="ulist">
<ul>
<li>
<p><em>"Validate this endpoint: <code>kafka:myTopic?brkers=localhost:9092\`"</em> - detects the typo and suggests \`brokers</code></p>
</li>
<li>
<p><em>"Validate this YAML route"</em> - checks against the YAML DSL JSON schema</p>
</li>
</ul>
</div>
${LATER_SECTION}`)

  const { markdown } = convertPage(html, createTurndownService())

  assert.notEqual(markdown, null)
  assert.match(markdown, /^-\s+_"Validate this YAML route"_ - checks against the YAML DSL JSON schema$/m)
  assert.match(markdown, /^### Later section$/m)
})

// NOTE the repair hides the defect from readers of the .md mirror, but the rendered HTML is still
// invalid and the fix belongs in the upstream .adoc source. Flagging the page is what lets the build
// log name it.
test('a page that needed repair is flagged so its source can be fixed upstream', () => {
  const html = page(`<div class="paragraph">
<p>A <code>core/camel-<strong></code> module</strong> x</p>
</div>`)

  assert.equal(convertPage(html, createTurndownService()).repaired, true)
})

// Hugo renders website pages as <page>/index.html with the content in article.doc (the "static"
// layouts), and list pages (home, download, community) with only a <main>. Only the former have a
// Markdown mirror, so their embedded table of contents must not leak into the Markdown either.
test('a Hugo content page converts its article without the embedded table of contents', () => {
  const html = `<!DOCTYPE html><html><head><title>t</title></head><body><main>
<article class="static doc community"><h1>Team</h1>
<aside class="toc embedded" aria-label="Table of contents"><div class="toc-menu"><h3 id="toc-heading">Contents</h3>
<nav id="TableOfContents"><ul><li><a href="#committers">Committers</a></li></ul></nav></div></aside>
<p>This page lists who we are.</p>
<h2 id="committers">Committers</h2></article>
<aside class="toc sidebar"><div class="toc-menu"></div></aside></main></body></html>`

  assert.deepEqual(convertPage(html, createTurndownService(), { articleOnly: true }), {
    markdown: '# Team\n\nThis page lists who we are.\n\n## Committers',
    repaired: false,
  })
})

test('a page with only a main is converted by default but skipped when an article is required', () => {
  const html = '<!DOCTYPE html><html><head><title>t</title></head><body><main><h1>Downloads</h1><p>Cards.</p></main></body></html>'

  assert.equal(convertPage(html, createTurndownService()).markdown, '# Downloads\n\nCards.')
  assert.deepEqual(convertPage(html, createTurndownService(), { articleOnly: true }), { markdown: null, repaired: false })
})
// Fixture after layouts/blog/post.html: the rail holds date, authors, share links, TOC and
// previous/next, the content starts with the featured image and ends with the related posts.
test('a blog post keeps its title, byline, lead and body and drops the page chrome', () => {
  const html = `<!DOCTYPE html><html><head><title>t</title></head><body><main role="main blog">
<article class="post blog doc" aria-labelledby="post-title">
<a class="post-back" href="/blog/">&larr; All posts</a>
<div class="post-hero"><div class="post-tags"><a class="tag-chip" href="/categories/ai/">AI</a><a class="tag-chip" href="/categories/tooling/">Tooling</a></div>
<h1 id="post-title" class="post-title">A post</h1><p class="detail-lead">The lead.</p></div>
<div class="post-layout"><aside class="post-rail" aria-label="Post details">
<div class="post-authors"><div class="post-author"><img class="post-avatar" src="a.png" alt=""><div class="post-author-name">Ada Lovelace</div></div>
<div class="post-author"><div class="post-author-name">Grace Hopper</div></div>
<time class="post-date" datetime="2026-09-15">September 15, 2026</time></div>
<div class="post-share"><a class="post-share-link" href="https://twitter.com/">X</a></div>
<div class="post-toc toc"><ul><li><a href="#setup">Setup</a></li></ul></div>
<div class="post-adjacent"><a href="/blog/2026/09/other/">&larr; Previous</a></div></aside>
<div class="post-content"><img class="featured" alt="Blog post featured image" src="featured.jpg">
<p>Body text.</p><h2 id="setup">Setup</h2><iframe src="https://www.youtube-nocookie.com/embed/x1" allowfullscreen title="YouTube Video"></iframe>
<section class="post-related"><h3>Related posts</h3><a class="card" href="/blog/2026/09/other/">Other</a></section></div></div>
</article></main></body></html>`

  assert.deepEqual(convertPage(html, createTurndownService()), {
    markdown: '# A post\n\nPublished 2026-09-15 by Ada Lovelace, Grace Hopper in AI, Tooling\n\nThe lead.\n\n' +
      'Body text.\n\n## Setup\n\n[YouTube Video](https://www.youtube-nocookie.com/embed/x1)',
    repaired: false,
  })
})

test('a blog post without the rail details still converts', () => {
  const html = '<!DOCTYPE html><html><head><title>t</title></head><body><main><article class="post blog doc">' +
    '<h1 class="post-title">Bare</h1><div class="post-content"><p>Body.</p></div></article></main></body></html>'

  assert.equal(convertPage(html, createTurndownService()).markdown, '# Bare\n\nBody.')
})
