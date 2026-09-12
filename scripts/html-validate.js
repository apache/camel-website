const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// html-validate is single threaded and spends its time in the lexer, so a full
// run over the built site is bound by one core. Measured on CI it was the whole
// of the ~14 minute "Run checks" step: 6229 files, 584 MB of HTML, while
// check:links and check:redirects finished inside the first ten seconds.
//
// Splitting the file list across processes is the only lever that pays. Trimming
// rules does not: parse-only config measured 24.96s against 25.56s for the full
// ruleset on the same input, so the rules are ~2% of the cost.
//
// Files excluded by .htmlvalidateignore stay excluded. html-validate applies the
// ignore file even to paths passed explicitly on the command line, so the shards
// do not need to filter anything themselves.

const FILES_PER_SHARD = 200;
const PROGRESS_INTERVAL_MS = 30000;

const target = process.argv[2] || 'public';

// Yarn puts node_modules/.bin on PATH for the scripts it runs, but resolving the
// binary directly means this also works when invoked as plain `node scripts/...`,
// which is how it gets run when debugging a single directory.
const localBin = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'html-validate.cmd' : 'html-validate'
);
const binary = fs.existsSync(localBin) ? localBin : 'html-validate';

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'check-html-'));
process.on('exit', () => fs.rmSync(scratch, { recursive: true, force: true }));

const collect = (dir, out) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
};

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

// Each shard writes to its own file rather than to a pipe. html-validate exits
// without flushing a piped stdout, so piping silently truncates its report: a
// 78 file run that writes 12577 lines to a file emits only 570 through `| cat`.
// The exit code survives, so failures are still failures, but most of the
// findings are lost. A file descriptor is written synchronously and keeps the
// whole report. Reading the shards back in order also avoids parallel writers
// interleaving mid-report.
const runShard = (files, index) =>
  new Promise((resolve) => {
    const outPath = path.join(scratch, `shard-${index}.txt`);
    const fd = fs.openSync(outPath, 'w');

    const finish = (code) => {
      try {
        fs.closeSync(fd);
      } catch {
        /* already closed */
      }
      let out = '';
      try {
        out = fs.readFileSync(outPath, 'utf8');
        fs.unlinkSync(outPath);
      } catch {
        /* nothing was written */
      }
      resolve({ code, out });
    };

    const child = spawn(binary, files, {
      shell: process.platform === 'win32',
      stdio: ['ignore', fd, fd]
    });

    child.on('error', (err) => {
      process.stderr.write(`check:html: could not run html-validate: ${err.message}\n`);
      finish(1);
    });

    child.on('close', (code) => finish(code == null ? 1 : code));
  });

(async () => {
  if (!fs.existsSync(target)) {
    process.stderr.write(`check:html: ${target} does not exist; build the site first\n`);
    process.exit(1);
  }

  const files = collect(target, []);
  if (!files.length) {
    process.stderr.write(`check:html: no HTML files under ${target}\n`);
    process.exit(1);
  }

  const shards = chunk(files, FILES_PER_SHARD);
  const workers = Math.max(1, Math.min(os.cpus().length, shards.length));
  const started = Date.now();

  process.stdout.write(
    `check:html: ${files.length} files in ${shards.length} shards across ${workers} workers\n`
  );

  let next = 0;
  let failed = 0;
  let done = 0;

  // A clean run prints nothing between the header and the summary, which on CI
  // is around six minutes of dead air and looks identical to a hung job. Report
  // progress periodically instead. A line per shard would be 32 lines of noise
  // on a green run; a tick is a handful. unref so it can never hold the process
  // open on its own.
  const ticker = setInterval(() => {
    const elapsed = ((Date.now() - started) / 1000).toFixed(0);
    const validated = shards.slice(0, done).reduce((n, s) => n + s.length, 0);
    process.stdout.write(
      `check:html: ${done}/${shards.length} shards, ${validated}/${files.length} files, ${elapsed}s\n`
    );
  }, PROGRESS_INTERVAL_MS);
  ticker.unref();

  const worker = async () => {
    while (next < shards.length) {
      const index = next++;
      const { code, out } = await runShard(shards[index], index);
      done++;
      if (out) process.stdout.write(out);
      if (code !== 0) failed++;
    }
  };

  await Promise.all(Array.from({ length: workers }, worker));
  clearInterval(ticker);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  process.stdout.write(`check:html: ${files.length} files in ${elapsed}s\n`);

  // Set exitCode rather than calling process.exit(): a failing run writes tens of
  // thousands of lines, and process.exit() truncates whatever is still queued on
  // stdout when it is a pipe. That would drop real findings on CI while still
  // reporting failure, which is worse than not sharding at all.
  process.exitCode = failed ? 1 : 0;
})();
