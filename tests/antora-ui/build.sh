#!/usr/bin/env bash
# Render the Antora UI against a small local fixture, with no network access.
#
# The production playbook is not usable for UI work: it clones ten upstream
# repositories and fails on broken xrefs. This renders real pages in seconds.
#
# The fixture is copied out of the repository before Antora reads it. Antora's
# git layer cannot read a git worktree, whose .git is a file rather than a
# directory, and this redesign is developed in a worktree.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"
OUT="$REPO/tests/antora-ui/out"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp -R "$REPO/tests/antora-ui/fixture" "$STAGE/fixture"
git -C "$STAGE" init -q
git -C "$STAGE" add -A
git -C "$STAGE" -c user.email=fixture@example.invalid -c user.name=fixture \
  -c commit.gpgsign=false commit -q -m fixture --no-verify

# A second version so the page version switcher and the nav version list have
# something to render.
git -C "$STAGE" checkout -q -b v4.17
sed -i.bak "s/version: '4.18'/version: '4.17'/" "$STAGE/fixture/antora.yml"
if cmp -s "$STAGE/fixture/antora.yml" "$STAGE/fixture/antora.yml.bak"; then
  echo "error: sed did not change antora.yml -- fixture version is no longer '4.18'; update this script" >&2
  exit 1
fi
rm -f "$STAGE/fixture/antora.yml.bak"
git -C "$STAGE" add -A
git -C "$STAGE" -c user.email=fixture@example.invalid -c user.name=fixture \
  -c commit.gpgsign=false commit -q -m v4.17 --no-verify
git -C "$STAGE" checkout -q -

cat > "$STAGE/playbook.yml" <<EOF
site:
  title: Apache Camel
  url: https://camel.apache.org
content:
  sources:
    - url: $STAGE
      branches: [HEAD, v4.17]
      start_path: fixture
ui:
  # Points at the committed bundle in public/_, not src/. Rebuild the bundle
  # (yarn build in antora-ui-camel) before running this script, or you will
  # measure stale CSS/JS against fresh source changes.
  bundle:
    url: $REPO/antora-ui-camel/public/_
asciidoc:
  extensions:
    - $REPO/extensions/table.js
    - $REPO/extensions/inline-styles.js
    - $REPO/node_modules/@asciidoctor/tabs
output:
  dir: $OUT
runtime:
  fetch: false
EOF

rm -rf "$OUT"
# Antora 3.1.15 evaluates UI helpers as if they lived under the playbook's
# directory, so a helper's require() (js-yaml in withChromeData.js) would
# resolve from the staging dir instead of the repository. NODE_PATH points it
# back at the repository's modules.
NODE_PATH="$REPO/node_modules" "$REPO/node_modules/.bin/antora" "$STAGE/playbook.yml"

echo "Rendered: $OUT/fixture/4.18/getting-started.html"
