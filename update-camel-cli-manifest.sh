#!/bin/sh
#
# update-camel-cli-manifest.sh - publish Camel CLI Launcher installers + manifests.
#
# Usage: ./update-camel-cli-manifest.sh <version> [--latest]
#
# 1. Fetches install.sh and install.ps1 from apache/camel main and writes them
#    byte-identical to static/install.sh and static/install.ps1. Also refreshes the
#    vendored scripts/WebsiteManifestGenerator.java from the same apache/camel source,
#    reapplying the "VENDORED COPY" banner on top of the byte-identical upstream body.
# 2. Downloads camel-launcher-<version>-bin.{tar.gz,zip} from Maven Central and
#    delegates to scripts/WebsiteManifestGenerator.java (a vendored copy of the
#    apache/camel tool) to compute SHA-256 and write the release manifests.
# 3. With --latest, updates latest.properties, but only if <version> is newer.
#    Always advances <X.Y>.properties (the newest patch of the release line) and,
#    when content/releases/release-<version>.md has `kind: lts`, lts.properties.
#    Both only move forward: a patch on an older LTS line leaves lts.properties
#    alone. The release page must exist and must not be a draft.
# 4. Checks that every alias matches the exact-version manifests
#    (scripts/camel-cli-aliases.sh check, also run in CI).
#
# For local work, take the sources from a local apache/camel checkout instead of
# apache/camel main:
#   CAMEL_GENERATOR_SRC=/path/to/WebsiteManifestGenerator.java
#   CAMEL_INSTALL_SRC_DIR=/path/to/dir/with/install.sh+install.ps1
#     (e.g. dsl/camel-jbang/camel-launcher/src/install)
#
# The manifest format (format=1, version, tar_sha256, zip_sha256) and all
# immutability / forward-only rules live in the single Java implementation;
# this script no longer reimplements them. The generator also writes
# static/install.sha256 (checksums of install.sh/install.ps1), which
# `camel self-update` uses to verify the installer before running it.
set -eu

MAIN_RAW="https://raw.githubusercontent.com/apache/camel/main/dsl/camel-jbang/camel-launcher/src/install"
GENERATOR_RAW_URL="https://raw.githubusercontent.com/apache/camel/main/dsl/camel-jbang/camel-launcher/src/jreleaser/java/WebsiteManifestGenerator.java"
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
if [ -n "${CAMEL_GENERATOR_SRC:-}" ]; then
    [ -f "$CAMEL_GENERATOR_SRC" ] || die "CAMEL_GENERATOR_SRC not found: $CAMEL_GENERATOR_SRC"
fi
if [ -n "${CAMEL_INSTALL_SRC_DIR:-}" ]; then
    [ -d "$CAMEL_INSTALL_SRC_DIR" ] || die "CAMEL_INSTALL_SRC_DIR not found: $CAMEL_INSTALL_SRC_DIR"
fi

# Fails if the release page is missing, a draft, or not a Camel release.
kind=$("$repo_root/scripts/camel-cli-aliases.sh" kind "$version") || exit 1
if [ "$kind" = "lts" ]; then lts=true; else lts=false; fi
echo "Release $version is $kind (content/releases/release-$version.md)"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT INT TERM

# --- 1. Vendor the installer scripts and manifest generator from apache/camel main ------
mkdir -p "$static_dir"
for script in install.sh install.ps1; do
    if [ -n "${CAMEL_INSTALL_SRC_DIR:-}" ]; then
        echo "Copying $script from $CAMEL_INSTALL_SRC_DIR"
        cp "$CAMEL_INSTALL_SRC_DIR/$script" "$tmp/$script" \
            || die "could not copy $script from $CAMEL_INSTALL_SRC_DIR"
    else
        echo "Fetching $script from apache/camel main"
        curl -fsSL "$MAIN_RAW/$script" -o "$tmp/$script" \
            || die "could not download $script from $MAIN_RAW/$script"
    fi
    mv "$tmp/$script" "$static_dir/$script"
    echo "  wrote static/$script"
done

if [ -n "${CAMEL_GENERATOR_SRC:-}" ]; then
    echo "Copying WebsiteManifestGenerator.java from $CAMEL_GENERATOR_SRC"
    cp "$CAMEL_GENERATOR_SRC" "$tmp/WebsiteManifestGenerator.java" \
        || die "could not copy $CAMEL_GENERATOR_SRC"
else
    echo "Fetching WebsiteManifestGenerator.java from apache/camel main"
    curl -fsSL "$GENERATOR_RAW_URL" -o "$tmp/WebsiteManifestGenerator.java" \
        || die "could not download WebsiteManifestGenerator.java from $GENERATOR_RAW_URL"
fi
{
    printf '// VENDORED COPY - do not edit here.\n'
    printf '// Source of truth: apache/camel\n'
    printf '//   dsl/camel-jbang/camel-launcher/src/jreleaser/java/WebsiteManifestGenerator.java\n'
    printf '// To update: re-copy that file over this one, then re-apply this banner. The body below is\n'
    printf '// kept byte-identical to the upstream source so the sync stays a mechanical copy.\n'
    printf '\n'
    cat "$tmp/WebsiteManifestGenerator.java"
} > "$tmp/WebsiteManifestGenerator.java.bannered"
mv "$tmp/WebsiteManifestGenerator.java.bannered" "$generator"
echo "  wrote scripts/WebsiteManifestGenerator.java"

# --- 2. Download the Maven Central -bin archives ----------------------------
tar_url="$MAVEN_BASE/$version/camel-launcher-$version-bin.tar.gz"
zip_url="$MAVEN_BASE/$version/camel-launcher-$version-bin.zip"
echo "Downloading $tar_url"
curl -fsSL "$tar_url" -o "$tmp/archive.tar.gz" || die "could not download $tar_url"
echo "Downloading $zip_url"
curl -fsSL "$zip_url" -o "$tmp/archive.zip" || die "could not download $zip_url"

# --- 3. Write the manifests via the vendored Java generator ------------------
# The generator computes checksums, writes static/camel-cli/releases/<version>.properties
# (immutable), advances <X.Y>.properties forward-only, with --lts true advances
# lts.properties forward-only and, when --latest is given, advances latest.properties
# forward-only.
if [ "$update_latest" -eq 1 ]; then latest=true; else latest=false; fi
echo "Generating manifests via scripts/WebsiteManifestGenerator.java"
java "$generator" \
    --version "$version" \
    --tar "$tmp/archive.tar.gz" \
    --zip "$tmp/archive.zip" \
    --output "$static_dir/camel-cli" \
    --latest "$latest" \
    --lts "$lts" \
    --install-sh "$static_dir/install.sh" \
    --install-ps1 "$static_dir/install.ps1" \
    || die "WebsiteManifestGenerator failed"

# --- 4. Check every alias against the exact-version manifests ---------------
"$repo_root/scripts/camel-cli-aliases.sh" check || die "alias manifests are inconsistent"

echo "Done."
