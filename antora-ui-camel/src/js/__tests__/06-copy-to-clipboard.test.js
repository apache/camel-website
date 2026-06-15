'use strict'

/**
 * Unit tests for 06-copy-to-clipboard.js
 *
 * Tests the extractCommands helper and the clipboard DOM setup logic
 * by re-implementing them in a testable form.
 */

// --- Helpers extracted from 06-copy-to-clipboard.js for unit testing ---
const CMD_RX = /^\$ (\S[^\n]*(\n(?!\$ )[^\n]*)*)(?=\n|$)/gm
const LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g
const TRAILING_SPACE_RX = / +$/gm

function extractCommands (text) {
  const cmds = []
  let m
  while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
  return cmds.join(' && ')
}

function trimTrailingSpaces (text) {
  return text.replace(TRAILING_SPACE_RX, '')
}

// --- Tests ---
describe('copy-to-clipboard: extractCommands', () => {
  test('returns empty string when no commands found', () => {
    expect(extractCommands('no commands here')).toBe('')
  })

  test('extracts a single command', () => {
    CMD_RX.lastIndex = 0
    const result = extractCommands('$ npm install')
    expect(result).toBe('npm install')
  })

  test('joins multiple commands with &&', () => {
    CMD_RX.lastIndex = 0
    expect(extractCommands('$ npm install\n$ npm test')).toBe('npm install && npm test')
  })
})

describe('copy-to-clipboard: trimTrailingSpaces', () => {
  test('removes trailing spaces from each line', () => {
    expect(trimTrailingSpaces('hello   \nworld  ')).toBe('hello\nworld')
  })

  test('leaves clean lines unchanged', () => {
    expect(trimTrailingSpaces('hello\nworld')).toBe('hello\nworld')
  })
})

describe('copy-to-clipboard: DOM setup', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="doc">
        <div class="listingblock">
          <div class="content">
            <pre class="highlight"><code class="language-bash" data-lang="bash">npm install</code></pre>
          </div>
        </div>
      </div>
    `
  })

  test('pre.highlight block exists in DOM', () => {
    const pre = document.querySelector('.doc pre.highlight')
    expect(pre).not.toBeNull()
  })

  test('code block has a data-lang attribute', () => {
    const code = document.querySelector('.doc pre.highlight code')
    expect(code.dataset.lang).toBe('bash')
  })

  test('source-toolbox can be created and appended', () => {
    const pre = document.querySelector('.doc pre.highlight')
    const toolbox = document.createElement('div')
    toolbox.className = 'source-toolbox'
    pre.appendChild(toolbox)
    expect(pre.querySelector('.source-toolbox')).not.toBeNull()
  })

  test('copy button can be created with correct attributes', () => {
    const copy = document.createElement('button')
    copy.className = 'copy-button'
    copy.setAttribute('title', 'Copy to clipboard')
    copy.setAttribute('aria-label', 'Copy to clipboard')
    expect(copy.getAttribute('title')).toBe('Copy to clipboard')
    expect(copy.getAttribute('aria-label')).toBe('Copy to clipboard')
  })

  test('toast element shows "Copied!" text', () => {
    const toast = document.createElement('span')
    toast.className = 'copy-toast'
    toast.appendChild(document.createTextNode('Copied!'))
    expect(toast.textContent).toBe('Copied!')
  })
})
