'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { JSDOM } = require('jsdom')

const SOURCE = path.join(__dirname, '..', 'src', 'js', '11-table-breaks.js')

// NOTE the source is a browser IIFE with no exports, so run the shipped file against a real
// option-table row and read back where it put the soft breaks. A column can never be narrower
// than its longest unbreakable token, and in the generated option tables that token is as often
// a Default or Type value (AUTO_ACKNOWLEDGE, MessageListenerContainerFactory) as a property name.
// Once Name, Default and Type are all that wide, the table overflows the doc column and the
// browser takes the difference out of Description (measured on activemq6-component.html at a
// 1440px window: Description 116px).
function render (cells) {
  const row = cells.map((html) => `<td class="tableblock"><p class="tableblock">${html}</p></td>`).join('')
  const dom = new JSDOM(
    `<article class="doc"><table class="tableblock"><tbody><tr>${row}</tr></tbody></table></article>`,
    { runScripts: 'outside-only' }
  )
  dom.window.eval(fs.readFileSync(SOURCE, 'utf8'))
  return [...dom.window.document.querySelectorAll('td')]
}

// Where the soft breaks landed, written as | between the pieces.
function breaks (cell) {
  return cell.querySelector('p').innerHTML.replace(/<wbr>/g, '|').replace(/<\/?(code|strong|span)[^>]*>/g, '')
}

// The tokens the script marked as identifiers, which doc.css never hyphenates.
function identifiers (cell) {
  return [...cell.querySelectorAll('span.identifier')].map((span) => span.textContent)
}

test('breaks a class name in the Type column before each camel-case hump', () => {
  const [, , , type] = render(['<strong>consumerType</strong>', 'The consumer type.', '', 'MessageListenerContainerFactory'])
  assert.equal(breaks(type), 'Message|Listener|Container|Factory')
})

test('breaks an enum constant in the Default column after the underscore', () => {
  const [, , value] = render(['<strong>acknowledgementModeName</strong>', 'The JMS acknowledgement name.', '<code>AUTO_ACKNOWLEDGE</code>', 'String'])
  assert.equal(breaks(value), 'AUTO_|ACKNOWLEDGE')
})

test('still breaks a property name in the first column after dots and before humps', () => {
  const [name] = render(['<strong>camel.main.additionalSensitiveKeywords</strong>', '', '', 'String'])
  assert.equal(breaks(name), 'camel.|main.|additional|Sensitive|Keywords')
})

test('leaves short tokens and plain prose words alone', () => {
  // Short values never set a column's width, and a long word with no separator or hump (most
  // description prose) has nowhere sensible to break, so neither gets a <wbr>.
  const [, description, value, type] = render(['<strong>brokerURL</strong>', 'Sets the configuration of ActiveMQ.', '<code>false</code>', 'String'])
  assert.equal(breaks(description), 'Sets the configuration of ActiveMQ.')
  assert.equal(breaks(value), 'false')
  assert.equal(breaks(type), 'String')
})

test('breaks an identifier in prose at its humps rather than leaving it to hyphenation', () => {
  // Left without break points, an identifier in prose does not wrap whole: doc.css hyphenates the
  // docs, so the browser split it at a syllable instead (opentelemetry.html at a 1440px window:
  // "Use the ex-" / "cludePattern property"). A break at the hump carries no false hyphen.
  const prose = 'Setting this to true will create new OpenTelemetry Spans for each Camel Processors. Use the excludePattern property to filter out Processors'
  const [, , description] = render(['<strong>traceProcessors</strong>', '<code>false</code>', prose])
  assert.equal(breaks(description), prose.replace('OpenTelemetry', 'Open|Telemetry').replace('excludePattern', 'exclude|Pattern'))
  assert.deepEqual(identifiers(description), ['OpenTelemetry', 'excludePattern'])
})

test('marks identifiers, short ones included, so the browser never hyphenates them', () => {
  // activemq6-component.html at a 390px window rendered local-host:61616 and JmsTem-plate.
  const [, description] = render(['<strong>brokerURL</strong>', 'If none configured then localhost:61616 is used by the JmsTemplate bean.', '', 'String'])
  assert.deepEqual(identifiers(description), ['localhost:61616', 'JmsTemplate'])
  assert.equal(breaks(description), 'If none configured then localhost:|61616 is used by the JmsTemplate bean.')
})

test('leaves plain words, trailing punctuation included, free to hyphenate', () => {
  // A separator only marks an identifier between two characters: "configuration." is a word.
  const [, description] = render(['<strong>name</strong>', 'Sets the configuration. Defaults to the component configuration, if any.', '', 'String'])
  assert.deepEqual(identifiers(description), [])
})

test('still breaks a token in prose that is too long to wrap whole', () => {
  // Left unbroken, a token this long sets the Description column's minimum width and the table
  // overflows the doc column (main.html at a 1440px window: 884px of table in a 696px column,
  // when prose only got break points from 24 characters).
  const prose = 'Directories to scan, by default classpath:camel/,classpath:camel-template/,classpath:camel-rest/* in that order.'
  const [, description] = render(['<strong>routesIncludePattern</strong>', prose, '', 'String'])
  // No break after the hyphens: the browser already breaks there.
  assert.equal(breaks(description), 'Directories to scan, by default classpath:|camel/|,|classpath:|camel-template/|,|classpath:|camel-rest/|* in that order.')
})

test('still breaks a long value a description quotes as code', () => {
  const [, description] = render(['<strong>headerFilterStrategy</strong>', 'Defaults to <code>org.apache.camel.spi.HeaderFilterStrategy</code>.', '', 'String'])
  assert.equal(breaks(description), 'Defaults to org.|apache.|camel.|spi.|Header|Filter|Strategy.')
})

test('never changes the text a reader sees or copies', () => {
  const cells = ['<strong>camel.main.streamCachingRemoveSpoolDirectoryWhenStopping</strong>', 'Uses classpath:camel/,classpath:camel-rest/* by default.', '<code>DUPS_OK_ACKNOWLEDGE</code>', 'org.apache.camel.spi.HeaderFilterStrategy']
  const before = new JSDOM(`<table><tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr></table>`)
  const expected = [...before.window.document.querySelectorAll('td')].map((td) => td.textContent)
  assert.deepEqual(render(cells).map((td) => td.textContent), expected)
})

test('does not touch code blocks inside a cell', () => {
  const [, description] = render(['<strong>name</strong>', '<pre>MessageListenerContainerFactory</pre>', '', 'String'])
  assert.equal(description.querySelector('pre').innerHTML, 'MessageListenerContainerFactory')
})
