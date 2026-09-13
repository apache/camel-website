'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const { convertPage } = require('../gulp/tasks/generate-markdown')
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
  const html = page(`<h2 id="_intro"><a class="anchor" href="#_intro"></a>Intro</h2>
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
