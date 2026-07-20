#!/bin/sh
#
# update-camel-cli-manifest.sh - publish Camel CLI Launcher installers + manifests.
#
# Usage: ./update-camel-cli-manifest.sh <version> [--latest]
#
# 1. Fetches install.sh and install.ps1 from apache/camel main and writes them
#    byte-identical to static/install.sh and static/install.ps1.
# 2. Downloads camel-launcher-<version>-bin.{tar.gz,zip} from Maven Central,
#    computes SHA-256, and writes static/camel-cli/releases/<version>.properties.
# 3. With --latest, updates latest.properties, but only if <version> is newer.
#
# The manifest format (format=1, version, tar_sha256, zip_sha256) mirrors
# WebsiteManifestGenerator.java in apache/camel and is parsed by the installers.
set -eu

MAIN_RAW="https://raw.githubusercontent.com/apache/camel/main/dsl/camel-jbang/camel-launcher/src/install"
MAVEN_BASE="https://repo1.maven.org/maven2/org/apache/camel/camel-launcher"

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
static_dir="$repo_root/static"
releases_dir="$static_dir/camel-cli/releases"

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

sha256() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | awk '{print $1}'
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | awk '{print $1}'
    else
        die "need sha256sum or shasum"
    fi
}

# 0 (true) if $1 is strictly newer than $2 (both X.Y.Z numeric).
version_gt() {
    i=1
    while [ "$i" -le 3 ]; do
        fa=$(echo "$1" | cut -d. -f"$i")
        fb=$(echo "$2" | cut -d. -f"$i")
        [ "$fa" -gt "$fb" ] && return 0
        [ "$fa" -lt "$fb" ] && return 1
        i=$((i + 1))
    done
    return 1
}

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

# --- 2. Compute checksums from the Maven Central -bin archives ---------------
tar_url="$MAVEN_BASE/$version/camel-launcher-$version-bin.tar.gz"
zip_url="$MAVEN_BASE/$version/camel-launcher-$version-bin.zip"
echo "Downloading $tar_url"
curl -fsSL "$tar_url" -o "$tmp/archive.tar.gz" || die "could not download $tar_url"
echo "Downloading $zip_url"
curl -fsSL "$zip_url" -o "$tmp/archive.zip" || die "could not download $zip_url"
tar_sha256=$(sha256 "$tmp/archive.tar.gz")
zip_sha256=$(sha256 "$tmp/archive.zip")

manifest_body() {
    printf 'format=1\nversion=%s\ntar_sha256=%s\nzip_sha256=%s\n' \
        "$version" "$tar_sha256" "$zip_sha256"
}

write_manifest() {
    dest=$1
    tmpf=$(mktemp "$tmp/manifest.XXXXXX")
    manifest_body >"$tmpf"
    mv "$tmpf" "$dest"
    echo "  wrote ${dest#"$repo_root"/}"
}

mkdir -p "$releases_dir"
version_file="$releases_dir/$version.properties"

# --- 3. Per-version manifest (immutable) ------------------------------------
if [ -f "$version_file" ]; then
    if manifest_body | cmp -s - "$version_file"; then
        echo "$version.properties already up to date"
    else
        die "$version.properties exists with different checksums; per-version manifests are immutable"
    fi
else
    write_manifest "$version_file"
fi

# --- 4. latest.properties (forward-only) ------------------------------------
if [ "$update_latest" -eq 1 ]; then
    latest_file="$releases_dir/latest.properties"
    if [ -f "$latest_file" ]; then
        current=$(sed -n 's/^version=//p' "$latest_file")
        if [ "$current" = "$version" ]; then
            echo "latest.properties already at $version"
        elif version_gt "$version" "$current"; then
            write_manifest "$latest_file"
        else
            die "latest.properties already at $current (newer than $version); refusing to move backward"
        fi
    else
        write_manifest "$latest_file"
    fi
fi

echo "Done."
