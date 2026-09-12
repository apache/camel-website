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
  return cell.querySelector('p').innerHTML.replace(/<wbr>/g, '|').replace(/<\/?(code|strong)>/g, '')
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
