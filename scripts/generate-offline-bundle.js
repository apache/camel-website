const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PUBLIC_DIR = 'public';
const CAMEL_REPO = 'apache/camel';
const CATALOG_BASE = 'catalog/camel-catalog/src/generated/resources/org/apache/camel/catalog';
const YAML_SCHEMA_PATH = 'dsl/camel-yaml-dsl/camel-yaml-dsl/src/generated/resources/schema/camelYamlDsl-canonical.json';

const CATALOG_DIRS = ['components', 'dataformats', 'languages', 'models', 'others'];

const VERSION_DIRS = [
  'components'
];

const SHARED_DIRS = [
  'manual'
];

function fetchCatalogAndSchema(version) {
  const branch = `camel-${version}.x`;
  const catalogDir = path.join(PUBLIC_DIR, 'catalog');

  console.log(`\nFetching catalog and YAML DSL schema from ${CAMEL_REPO}@${branch}...`);

  // fetch YAML DSL canonical schema
  const schemaDir = path.join(catalogDir, 'schema');
  fs.mkdirSync(schemaDir, { recursive: true });
  try {
    const schema = execFileSync('gh', [
      'api', `repos/${CAMEL_REPO}/contents/${YAML_SCHEMA_PATH}?ref=${branch}`,
      '--jq', '.content'
    ], { encoding: 'utf8' });
    fs.writeFileSync(
      path.join(schemaDir, 'camelYamlDsl-canonical.json'),
      Buffer.from(schema.trim(), 'base64').toString('utf8')
    );
    console.log('  Fetched schema/camelYamlDsl-canonical.json');
  } catch (error) {
    console.warn(`  Could not fetch YAML DSL schema: ${error.message}`);
  }

  // fetch catalog JSON files for each category
  for (const dir of CATALOG_DIRS) {
    const targetDir = path.join(catalogDir, dir);
    fs.mkdirSync(targetDir, { recursive: true });
    try {
      const files = execFileSync('gh', [
        'api', `repos/${CAMEL_REPO}/contents/${CATALOG_BASE}/${dir}?ref=${branch}`,
        '--jq', '.[].name'
      ], { encoding: 'utf8' }).trim().split('\n').filter(f => f.endsWith('.json'));

      console.log(`  Fetching catalog/${dir}/ (${files.length} files)...`);

      for (const file of files) {
        try {
          const content = execFileSync('gh', [
            'api', `repos/${CAMEL_REPO}/contents/${CATALOG_BASE}/${dir}/${file}?ref=${branch}`,
            '--jq', '.content'
          ], { encoding: 'utf8' });
          fs.writeFileSync(
            path.join(targetDir, file),
            Buffer.from(content.trim(), 'base64').toString('utf8')
          );
        } catch {
          // skip individual file failures silently
        }
      }
    } catch (error) {
      console.warn(`  Could not fetch catalog/${dir}: ${error.message}`);
    }
  }

  return fs.existsSync(catalogDir);
}

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

  // fetch catalog and YAML DSL schema from the camel repo
  if (fetchCatalogAndSchema(version)) {
    includePaths.push('catalog/*');
  }

  // remove stale bundle
  if (fs.existsSync(bundlePath)) {
    fs.unlinkSync(bundlePath);
  }

  // build zip: include .md files from doc dirs, plus .json from catalog, plus llms.txt
  const zipArgs = ['-r', '-q', bundleName, '.'];
  for (const p of includePaths) {
    if (p === 'llms.txt') {
      zipArgs.push('-i', 'llms.txt');
    } else if (p.startsWith('catalog/')) {
      zipArgs.push('-i', `${p}.json`);
    } else {
      zipArgs.push('-i', `${p}.md`);
    }
  }

  try {
    execFileSync('zip', zipArgs, { cwd: PUBLIC_DIR, stdio: 'inherit' });

    const sizeMb = (fs.statSync(bundlePath).size / (1024 * 1024)).toFixed(1);
    console.log(`\nGenerated ${bundleName} (${sizeMb} MB)`);
  } catch (error) {
    console.error(`Failed to generate ${bundleName}:`, error.message);
    process.exit(1);
  }
}

main();
