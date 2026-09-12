// Yarn plugin to download binary artifact releases from GitHub and make
// them available on the Yarn CLI.
//
// The plugin implements a Resolver and a Locator that take in dependency
// with reference specification like:
//
// github-release:org/repo:version/binary
//
// e.g. in package.json:
//
// {
//   dependencies: {
//     'example-binary': 'github-release:example/binary:1.0/exe'
//   }
// }
//
// With that example the `exe` binary can be invoked via `yarn run exe`
// (or shorter `yarn exe`.
//
// The plugin does this by creating a faux package containing the wrapper
// JavaScript file and the binary. So the resulting package can be cached
// in Yarn cache.
//
// There is limited support for template literals, so when needed the
// reference specification can contain an expression within `${...}`.
//
// For example it is possible to specify this dependency:
//
// {
//   dependencies: {
//     'example-binary': 'github-release:example/binary:1.0/exe-${process.arch}'
//   }
// }
//
// Even though that is possible, it might not be desired in some cases.
// Notably when the expression is platform dependent (such as in the example
// above) the package will be different (e.g. containing binaries for
// different platforms) and the hash of the package will be different from
// the value persisted in Yarn lockfile, and would cause an error.
//
const YARN_FS_VERSION = '3.0.1';

const reference_pattern = /^github-release:(?<organization>[^\/]+)\/(?<repository>[^:]+)(?::(?<version>[^\/]+))?\/(?<binary>[^:]+)$/g;

const supports = (ref) => {
  reference_pattern.lastIndex = 0;
  return reference_pattern.test(ref);
}

const parse = (ref) => {
  const reference = new Function(`return \`${ref}\`;`).call();

  reference_pattern.lastIndex = 0;
  const parts = [...reference.matchAll(reference_pattern)][0];

  return {
    organization: parts[1],
    repository: parts[2],
    version: parts[3] || 'latest',
    binary: parts[4]
  }
}

module.exports = {
  name: `github-release-binary`,
  factory: require => {
    const util = require('util');
    const { httpUtils, structUtils, LinkType } = require('@yarnpkg/core');
    const { ppath, xfs } = require('@yarnpkg/fslib');
    const { ZipFS, getLibzipPromise } = require('@yarnpkg/libzip');

    class GitHubReleaseFetcher {

      supports(locator, opts) {
        return supports(locator.reference);
      }

      getLocalPath(locator, opts) {
        return null;
      }

      async fetch(locator, opts) {
        const expectedChecksum = opts.checksums.get(locator.locatorHash) || null;

        const [packageFs, releaseFs, checksum] = await opts.cache.fetchPackageFromCache(locator, expectedChecksum, {
          onHit: () => opts.report.reportCacheHit(locator),
          onMiss: () => opts.report.reportCacheMiss(locator, `${structUtils.prettyLocator(opts.project.configuration, locator)} can't be found in the cache and will be fetched from the remote server`),
          loader: () => this.fetchFromNetwork(locator, opts),
          skipIntegrityCheck: opts.skipIntegrityCheck,
        });

        return {
          packageFs,
          releaseFs,
          prefixPath: structUtils.getIdentVendorPath(locator),
          checksum,
        };
      }

      async fetchFromNetwork(locator, opts) {
        // 1980-01-01, like Fedora
        const defaultTime = 315532800;

        const parts = parse(locator.reference);

        const releaseBuffer = await httpUtils.get(`https://github.com/${parts.organization}/${parts.repository}/releases/download/${parts.version}/${parts.binary}`, {
          configuration: opts.project.configuration,
        });

        const packageName = ppath.join(locator.scope !== null ? '@' + locator.scope : '', locator.name);

        const tmpDir = xfs.mktempSync();

        const zipFS = new ZipFS(ppath.join(tmpDir, 'release.zip'), { create: true, libzip: await getLibzipPromise() });

        zipFS.writeFileSync('package.json', `{ "name": "${packageName}", "dependencies": { "@yarnpkg/fslib": "${YARN_FS_VERSION}" } }`);
        zipFS.utimesSync('package.json', defaultTime, defaultTime);

        const dir = ppath.join('node_modules', packageName);
        zipFS.mkdirSync(dir, { recursive: true });

        const stubFile = ppath.join(dir, 'exec.js');
        zipFS.writeFileSync(stubFile, `const { xfs } = require('@yarnpkg/fslib');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const execute = (path, args) => {
  const child = spawn(path, args);

  process.stdin.pipe(child.stdin);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('error', err => { process.stderr.write(err + '\\n'); process.exit(1) } );
  child.on('exit', status => process.exit(status));
}

(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'github-release-binary'));
  process.on('exit', () => {
    fs.rmdirSync(tmpDir, { recursive: true });
  })

  const binary = process.argv[1].replace('exec.js', '${parts.binary}');
  const binaryPath = path.join(tmpDir, '${parts.binary}');
  await xfs.copyFilePromise(binary, binaryPath);
  await xfs.chmodPromise(binaryPath, 0o755);
  execute(binaryPath, process.argv.slice(2));
})();`);
        zipFS.chmodSync(stubFile, 0o755);
        zipFS.utimesSync(stubFile, defaultTime, defaultTime);

        const binaryPath = ppath.join(dir, parts.binary);
        zipFS.writeFileSync(binaryPath, releaseBuffer);
        zipFS.chmodSync(binaryPath, 0o755);
        zipFS.utimesSync(binaryPath, defaultTime, defaultTime);

        xfs.detachTemp(tmpDir);

        return zipFS;
      }

    }

    class GitHubReleaseResolver {

      supportsDescriptor(descriptor, opts) {
        return supports(descriptor.range);
      }

      supportsLocator(locator, opts) {
        return supports(locator.reference);
      }

      shouldPersistResolution(locator, opts) {
        return true;
      }

      bindDescriptor(descriptor, fromLocator, opts) {
        return descriptor;
      }

      getResolutionDependencies(descriptor, opts) {
        return [];
      }

      async getCandidates(descriptor, dependencies, opts) {
        return [structUtils.convertDescriptorToLocator(descriptor)];
      }

      async getSatisfying(descriptor, dependencies, locators, opts) {
        return {
          locators
        };
      }

      async resolve(locator, opts) {
        const parts = parse(locator.reference);

        const fsLibDep = structUtils.makeDescriptor(structUtils.makeIdent('yarnpkg', 'fslib'), YARN_FS_VERSION)

        const dependencies = new Map();
        dependencies.set(fsLibDep.identHash, fsLibDep);

        return {
          ...locator,
          version: parts.version,
          languageName: opts.project.configuration.get(`defaultLanguageName`),
          linkType: LinkType.HARD,
          dependencies: opts.project.configuration.normalizeDependencyMap(dependencies),
          bin: [
            [ parts.binary, 'exec.js' ]
          ]
        };
      }

    }

    return {
      fetchers: [ GitHubReleaseFetcher ],
      resolvers: [ GitHubReleaseResolver ],
    }
  }
};
