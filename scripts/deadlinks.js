const { spawn } = require('child_process');

// github-release-binary.js names each bin after the release asset it downloads,
// so there is one bin per platform rather than a single `deadlinks`. Templating
// the asset into the dependency reference is not an option: a platform
// dependent reference changes the package hash and breaks the lockfile, as the
// plugin itself warns.
const BINARIES = {
  darwin: 'deadlinks-macos',
  linux: 'deadlinks-linux',
  win32: 'deadlinks-windows'
};

const binary = BINARIES[process.platform];

if (!binary) {
  console.error(`check:links: cargo-deadlinks publishes no build for ${process.platform}`);
  process.exit(1);
}

// Yarn puts node_modules/.bin on PATH for the scripts it runs, which is how the
// bin resolves. On Windows it is a .cmd shim, and those need a shell.
const child = spawn(binary, process.argv.slice(2), {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('error', (err) => {
  console.error(`check:links: could not run ${binary}: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => process.exit(signal ? 1 : code));
