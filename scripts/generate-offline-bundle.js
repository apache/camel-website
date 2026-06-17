const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PUBLIC_DIR = 'public';

const VERSION_DIRS = [
  'components'
];

const SHARED_DIRS = [
  'manual'
];

function main() {
  const version = process.argv[2];
  if (!version) {
    console.error('Usage: node scripts/generate-offline-bundle.js <version>');
    console.error('Example: node scripts/generate-offline-bundle.js 4.18');
    process.exit(1);
  }

  const versionDir = `${version}.x`;
  const bundleName = `camel-docs-${version}.zip`;
  const bundlePath = path.join(PUBLIC_DIR, bundleName);

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`Cannot generate ${bundleName}: '${PUBLIC_DIR}' directory not found`);
    process.exit(1);
  }

  // collect paths to include (relative to public/)
  const includePaths = [];

  for (const dir of VERSION_DIRS) {
    const fullPath = path.join(PUBLIC_DIR, dir, versionDir);
    if (fs.existsSync(fullPath)) {
      includePaths.push(`${dir}/${versionDir}/*`);
      console.log(`  Including ${dir}/${versionDir}/`);
    } else {
      console.warn(`  Skipping ${dir}/${versionDir}/ (not found)`);
    }
  }

  for (const dir of SHARED_DIRS) {
    const fullPath = path.join(PUBLIC_DIR, dir);
    if (fs.existsSync(fullPath)) {
      includePaths.push(`${dir}/*`);
      console.log(`  Including ${dir}/`);
    }
  }

  if (includePaths.length === 0) {
    console.error(`No documentation directories found for version ${version}`);
    process.exit(1);
  }

  // always include llms.txt if present
  if (fs.existsSync(path.join(PUBLIC_DIR, 'llms.txt'))) {
    includePaths.push('llms.txt');
  }

  // remove stale bundle
  if (fs.existsSync(bundlePath)) {
    fs.unlinkSync(bundlePath);
  }

  // build zip: include only .md files from the selected directories, plus llms.txt
  const zipArgs = ['-r', '-q', bundleName, '.'];
  for (const p of includePaths) {
    if (p === 'llms.txt') {
      zipArgs.push('-i', 'llms.txt');
    } else {
      zipArgs.push('-i', `${p}.md`);
    }
  }

  try {
    execFileSync('zip', zipArgs, { cwd: PUBLIC_DIR, stdio: 'inherit' });

    const sizeMb = (fs.statSync(bundlePath).size / (1024 * 1024)).toFixed(1);
    console.log(`Generated ${bundleName} (${sizeMb} MB)`);
  } catch (error) {
    console.error(`Failed to generate ${bundleName}:`, error.message);
    process.exit(1);
  }
}

main();
