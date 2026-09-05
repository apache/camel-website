#!/usr/bin/env bash
# Build the Hugo site, then optionally screenshot or measure pages from it.
#
# The release-note pages call getJSON against the GitHub API. Without a token
# those calls hit the unauthenticated rate limit and the build exits non-zero
# with about 32 errors, so this script resolves a token itself rather than
# making every caller do it. The token is exported to hugo only; it is never
# printed, logged, or passed as an argument.
#
# Usage:
#   tests/hugo/build.sh                            build only
#   tests/hugo/build.sh --shots / projects/        build, then screenshot each path
#   tests/hugo/build.sh --measure / 'sel@color'    build, then print computed styles
#   tests/hugo/build.sh --measure / 'sel@color' 'sel-to-click'
#                                                   ...after clicking an element first
#   tests/hugo/build.sh --measure / 'sel@color' '' 626
#                                                   ...at a given iframe width (default 1440)
#
# Env: HUGO_OUT, HUGO_PORT (default 8899), SHOT_WIDTHS, SHOT_HEIGHT (default 2400),
#      HUGO_OPTIONS and HUGO_CACHE_DIR (forwarded to hugo like package.json's
#      build:hugo; HUGO_OPTIONS='--buildFuture' reproduces the PR preview,
#      HUGO_OPTIONS='-D' the local preview)
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

OUT="${HUGO_OUT:-$(mktemp -d)}"
mkdir -p "$OUT"
SITE="$OUT/site"
LOG="$OUT/hugo-build.log"
SHOTS="$OUT/shots"
PORT="${HUGO_PORT:-8899}"
SHOT_HEIGHT="${SHOT_HEIGHT:-2400}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# The Hugo output carries a copy of staticDir (documentation/ alone is about
# 500 MB), so a temporary site is removed on exit; a caller-supplied HUGO_OUT
# is kept. The log and screenshots live next to it and survive either way.
cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  if [ -z "${HUGO_OUT:-}" ]; then rm -rf "$SITE"; fi
}
trap cleanup EXIT

if [ -z "${GITHUB_TOKEN:-}" ]; then
  if command -v gh >/dev/null 2>&1 && _tok="$(gh auth token 2>/dev/null)" && [ -n "$_tok" ]; then
    GITHUB_TOKEN="$_tok"
    export GITHUB_TOKEN
    unset _tok
  else
    echo "warning: no GITHUB_TOKEN and 'gh auth token' failed." >&2
    echo "         Expect ~32 getJSON rate-limit errors and a non-zero exit." >&2
  fi
fi

# config.toml serves the site's "_" assets from documentation/_ (staticDir and the
# "data" module mount both point there), but `yarn workspace antora-ui-camel run
# build` only writes to antora-ui-camel/public/_. Nothing else connects the two, so
# without this sync the site would silently serve a stale bundle and every --measure
# reading below would be a confident lie.
BUNDLE="$REPO/antora-ui-camel/public/_"
MANIFEST="$BUNDLE/data/rev-manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "missing $MANIFEST -- run 'yarn workspace antora-ui-camel run build' first" >&2
  exit 1
fi

# git does not restore mtimes, so comparing every source file against the
# manifest flags each fresh checkout as stale; only files git reports as
# modified or untracked can be newer than the committed bundle for a reason.
# Committed source without a committed bundle is not detected here.
stale="$(git -C "$REPO" status --porcelain --untracked-files=all -- antora-ui-camel/src | cut -c4- | while IFS= read -r f; do
  if [ "$REPO/$f" -nt "$MANIFEST" ]; then printf '%s\n' "$f"; fi
done)"
if [ -n "$stale" ]; then
  echo "antora-ui-camel bundle is stale (uncommitted source newer than rev-manifest.json) -- run 'yarn workspace antora-ui-camel run build'" >&2
  exit 1
fi

mkdir -p "$REPO/documentation/_"
for asset_dir in css js img font data; do
  if [ -d "$BUNDLE/$asset_dir" ]; then
    mkdir -p "$REPO/documentation/_/$asset_dir"
    cp -R "$BUNDLE/$asset_dir/." "$REPO/documentation/_/$asset_dir/"
  fi
done

if ! node_modules/.bin/hugo --cacheDir "${HUGO_CACHE_DIR:-$REPO/.hugo_data}" ${HUGO_OPTIONS:-} -d "$SITE" >"$LOG" 2>&1; then
  echo "hugo build FAILED. Last 20 lines of $LOG:" >&2
  tail -20 "$LOG" >&2
  exit 1
fi

errors="$(grep -c '^ERROR' "$LOG" || true)"
if [ "$errors" != "0" ]; then
  echo "hugo exited 0 but logged $errors error(s). See $LOG" >&2
  exit 1
fi
echo "hugo: 0 errors -> $SITE"
if [ -z "${HUGO_OUT:-}" ]; then echo "(temporary; removed on exit, set HUGO_OUT to keep it)" >&2; fi

start_server() {
  python3 -m http.server "$PORT" --directory "$SITE" >/dev/null 2>&1 &
  SERVER_PID=$!
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "server process for port $PORT exited before it became ready (port may already be in use)" >&2
      exit 1
    fi
    if curl -fsS -o /dev/null "http://localhost:$PORT/" \
       && lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null | grep -qx "$SERVER_PID"; then
      return 0
    fi
    sleep 0.5
  done
  echo "server did not come up on port $PORT" >&2
  exit 1
}

case "${1:-}" in
  --shots)
    shift
    cp tests/hugo/_measure.html "$SITE/_measure.html"
    mkdir -p "$SHOTS"
    start_server
    for path in "$@"; do
      slug="$(printf '%s' "${path:-index}" | tr '/' '_' | sed 's/^_*//; s/_*$//')"
      : "${slug:=index}"
      for width in ${SHOT_WIDTHS:-1440 1024 626}; do
        "$CHROME" --headless --disable-gpu --hide-scrollbars \
          --screenshot="$SHOTS/${slug}-${width}.png" \
          --window-size="${width},${SHOT_HEIGHT}" \
          --virtual-time-budget=5000 \
          "http://localhost:$PORT/$path" >/dev/null 2>&1
      done
    done
    echo "shots: $SHOTS"
    ;;
  --measure)
    shift
    path="${1:-/}"
    query="${2:-}"
    click="${3:-}"
    width="${4:-1440}"
    cp tests/hugo/_measure.html "$SITE/_measure.html"
    start_server
    "$CHROME" --headless --disable-gpu --virtual-time-budget=5000 --dump-dom \
      "http://localhost:$PORT/_measure.html#$(printf '%s|%s|%s|%s' "$path" "$query" "$click" "$width")" \
      2>/dev/null | sed -n '/<pre id="out">/,/<\/pre>/p' | sed 's/<[^>]*>//g'
    ;;
esac
