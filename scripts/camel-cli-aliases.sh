#!/bin/sh
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# camel-cli-aliases.sh - maintain the Camel CLI alias manifests in
# static/camel-cli/releases (latest.properties, lts.properties, X.Y.properties).
#
# Usage:
#   scripts/camel-cli-aliases.sh check            verify the aliases, write nothing (CI)
#   scripts/camel-cli-aliases.sh rebuild          regenerate the aliases (backfill)
#   scripts/camel-cli-aliases.sh kind <X.Y.Z>     print "lts" or "regular" for a release
#
# The LTS versions come from the release pages: a release is LTS when
# content/releases/release-<version>.md has `kind: lts` in its front matter.
# Every exact-version manifest (X.Y.Z.properties) must have a published
# (`draft: false`, `category: camel`) release page. The alias rules themselves
# live in the vendored scripts/WebsiteManifestGenerator.java (--rebuild-aliases).
set -eu

repo_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
releases_dir="$repo_root/static/camel-cli/releases"
pages_dir="$repo_root/content/releases"
generator="$repo_root/scripts/WebsiteManifestGenerator.java"

die() { echo "error: $*" >&2; exit 1; }
usage() { echo "Usage: $0 check | rebuild | kind <X.Y.Z>" >&2; exit 2; }

# Prints the value of a top-level key from the YAML front matter of a page,
# without surrounding whitespace or quotes. Prints nothing if the key is absent.
front_matter_value() {
    awk -v key="$2" '
        NR == 1 { if ($0 != "---") exit; next }
        $0 == "---" { exit }
        index($0, key ":") == 1 {
            v = substr($0, length(key) + 2)
            gsub(/^[ \t]+|[ \t\r]+$/, "", v)
            gsub(/^["\047]|["\047]$/, "", v)
            print v
            exit
        }
    ' "$1"
}

# Prints "lts" or "regular" for a published Camel release; fails if its release
# page is missing, is a draft, or is not a Camel release.
release_kind() {
    page="$pages_dir/release-$1.md"
    [ -f "$page" ] || die "release page not found for $1: content/releases/release-$1.md"
    [ "$(front_matter_value "$page" draft)" != "true" ] \
        || die "release page for $1 is a draft: content/releases/release-$1.md"
    category=$(front_matter_value "$page" category)
    [ "$category" = "camel" ] \
        || die "release page for $1 has category '$category', expected 'camel': content/releases/release-$1.md"
    if [ "$(front_matter_value "$page" kind)" = "lts" ]; then echo lts; else echo regular; fi
}

# Comma-separated LTS versions among the exact-version manifests.
lts_versions() {
    list=""
    for manifest in "$releases_dir"/*.properties; do
        v=$(basename "$manifest" .properties)
        echo "$v" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || continue
        kind=$(release_kind "$v") || exit 1
        [ "$kind" = "lts" ] && list="$list${list:+,}$v"
    done
    echo "$list"
}

rebuild_aliases() {
    command -v java >/dev/null 2>&1 || die "java (JDK 17+) is required to run $generator"
    [ -f "$generator" ] || die "generator not found: $generator"
    lts=$(lts_versions) || exit 1
    java "$generator" --rebuild-aliases "$@" \
        --output "$repo_root/static/camel-cli" \
        --lts-versions "$lts"
}

[ $# -ge 1 ] || usage
case $1 in
    check) [ $# -eq 1 ] || usage; rebuild_aliases --check ;;
    rebuild) [ $# -eq 1 ] || usage; rebuild_aliases ;;
    kind)
        [ $# -eq 2 ] || usage
        echo "$2" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || die "version must be X.Y.Z: $2"
        release_kind "$2"
        ;;
    *) usage ;;
esac
