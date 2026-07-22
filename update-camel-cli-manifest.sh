#!/bin/sh
#
# update-camel-cli-manifest.sh - publish Camel CLI Launcher installers + manifests.
#
# Usage: ./update-camel-cli-manifest.sh <version> [--latest]
#
# 1. Fetches install.sh and install.ps1 from apache/camel main and writes them
#    byte-identical to static/install.sh and static/install.ps1.
# 2. Downloads camel-launcher-<version>-bin.{tar.gz,zip} from Maven Central and
#    delegates to scripts/WebsiteManifestGenerator.java (a vendored copy of the
#    apache/camel tool) to compute SHA-256 and write the release manifests.
# 3. With --latest, updates latest.properties, but only if <version> is newer.
#
# The manifest format (format=1, version, tar_sha256, zip_sha256, with an ASF
# license header) and all immutability / forward-only rules live in the single
# Java implementation; this script no longer reimplements them.
set -eu

MAIN_RAW="https://raw.githubusercontent.com/apache/camel/main/dsl/camel-jbang/camel-launcher/src/install"
MAVEN_BASE="https://repo1.maven.org/maven2/org/apache/camel/camel-launcher"

repo_root=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
static_dir="$repo_root/static"
generator="$repo_root/scripts/WebsiteManifestGenerator.java"

die() { echo "error: $*" >&2; exit 1; }
usage() { echo "Usage: $0 <version> [--latest]" >&2; exit 2; }

[ $# -ge 1 ] || usage
version=$1
shift
update_latest=0
while [ $# -gt 0 ]; do
    case $1 in
        --latest) update_latest=1 ;;
        *) usage ;;
    esac
    shift
done

echo "$version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || die "version must be X.Y.Z: $version"

command -v java >/dev/null 2>&1 || die "java (JDK 17+) is required to run $generator"
[ -f "$generator" ] || die "generator not found: $generator"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT INT TERM

# --- 1. Vendor the installer scripts from apache/camel main ------------------
mkdir -p "$static_dir"
for script in install.sh install.ps1; do
    echo "Fetching $script from apache/camel main"
    curl -fsSL "$MAIN_RAW/$script" -o "$tmp/$script" \
        || die "could not download $script from $MAIN_RAW/$script"
    mv "$tmp/$script" "$static_dir/$script"
    echo "  wrote static/$script"
done

# --- 2. Download the Maven Central -bin archives ----------------------------
tar_url="$MAVEN_BASE/$version/camel-launcher-$version-bin.tar.gz"
zip_url="$MAVEN_BASE/$version/camel-launcher-$version-bin.zip"
echo "Downloading $tar_url"
curl -fsSL "$tar_url" -o "$tmp/archive.tar.gz" || die "could not download $tar_url"
echo "Downloading $zip_url"
curl -fsSL "$zip_url" -o "$tmp/archive.zip" || die "could not download $zip_url"

# --- 3. Write the manifests via the vendored Java generator ------------------
# The generator computes checksums, writes static/camel-cli/releases/<version>.properties
# (immutable) and, when --latest is given, advances latest.properties forward-only.
if [ "$update_latest" -eq 1 ]; then latest=true; else latest=false; fi
echo "Generating manifests via scripts/WebsiteManifestGenerator.java"
java "$generator" \
    --version "$version" \
    --tar "$tmp/archive.tar.gz" \
    --zip "$tmp/archive.zip" \
    --output "$static_dir/camel-cli" \
    --latest "$latest" \
    || die "WebsiteManifestGenerator failed"

echo "Done."
