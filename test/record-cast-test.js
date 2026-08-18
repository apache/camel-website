'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const ospath = require('node:path')
const { spawnSync } = require('node:child_process')
const test = require('node:test')

test('the recorder answers a terminal probe split across PTY reads', (t) => {
  const directory = fs.mkdtempSync(ospath.join(os.tmpdir(), 'record-cast-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const tapePath = ospath.join(directory, 'empty.tape')
  const castPath = ospath.join(directory, 'output.cast')
  fs.writeFileSync(tapePath, '')

  const child = [
    'import os, time, tty',
    'tty.setraw(0)',
    "os.write(1, b'\\x1b')",
    'time.sleep(0.1)',
    "os.write(1, b'[c')",
    'reply = os.read(0, 64)',
    "marker = b'PROBE_REPLY_OK' if b'\\x1b[?62;1;2;6;9;15;22c' in reply else b'PROBE_REPLY_MISSING'",
    "os.write(1, b'\\r\\n' + marker + b'\\r\\n')",
  ].join('; ')
  const result = spawnSync(
    'python3',
    ['tools/asciinema/record_cast.py', tapePath, castPath, '0', 'python3', '-c', child],
    { cwd: ospath.resolve(__dirname, '..'), encoding: 'utf8', timeout: 10000 }
  )

  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.match(fs.readFileSync(castPath, 'utf8'), /PROBE_REPLY_OK/)
})
