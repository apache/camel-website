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
#
# Env: HUGO_OUT, HUGO_PORT (default 8899), SHOT_WIDTHS, SHOT_HEIGHT (default 2400)
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

OUT="${HUGO_OUT:-$(mktemp -d)}"
SITE="$OUT/site"
LOG="$OUT/hugo-build.log"
SHOTS="$OUT/shots"
PORT="${HUGO_PORT:-8899}"
SHOT_HEIGHT="${SHOT_HEIGHT:-2400}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

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

if ! node_modules/.bin/hugo --cacheDir "$REPO/.hugo_data" -d "$SITE" >"$LOG" 2>&1; then
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

start_server() {
  python3 -m http.server "$PORT" --directory "$SITE" >/dev/null 2>&1 &
  SERVER_PID=$!
  trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
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
    cp tests/hugo/_measure.html "$SITE/_measure.html"
    start_server
    "$CHROME" --headless --disable-gpu --virtual-time-budget=5000 --dump-dom \
      "http://localhost:$PORT/_measure.html#$(printf '%s|%s' "$path" "$query")" \
      2>/dev/null | sed -n '/<pre id="out">/,/<\/pre>/p' | sed 's/<[^>]*>//g'
    ;;
esac
