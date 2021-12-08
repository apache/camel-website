#!/bin/bash
# When running on ASF Jenkins at ci-builds.a.o we're running in a container
# so when trying to run docker from within a container even with the mounted
# Docker socket and binary we run into permission issues. This circumvents
# that problem by creating a pair of in-out pipes outside of the container
# to which a process within a container can write/read from to access the
# docker CLI on the host.
# The script creates the `teardown.sh` and `docker-wrapper` scripts in
# addition to the in-out pipes. The `docker-wrapper` is meant to be mounted
# within the container at `/usr/bin/docker` and `teardown.sh` is meant to
# be called when the wrapper is no longer needed, to terminate it (as it's
# meant to run in the background) and cleanup created files.
set -euo pipefail
WHERE=$(realpath "$1")

mkdir -p "$WHERE"

IN="$(mktemp -p "$WHERE" -u in.XXXXXXXXXXXXXXXXXXXX)"
OUT="$(mktemp -p "$WHERE" -u out.XXXXXXXXXXXXXXXXXXXX)"
ERR="$(mktemp -p "$WHERE" -u err.XXXXXXXXXXXXXXXXXXXX)"
STATUS="$(mktemp -p "$WHERE" -u status.XXXXXXXXXXXXXXXXXXXX)"

trap 'rm -f "$IN" "$OUT" "$ERR" "$STATUS" "$WHERE/teardown.sh" "${WHERE}/docker"; rmdir --ignore-fail-on-non-empty "$WHERE"' EXIT

cat <<EOF > "$WHERE/teardown.sh"
#!/bin/bash
kill $$
EOF
chmod +x "$WHERE/teardown.sh"

cat <<EOF > "${WHERE}/docker"
#!/bin/bash
CMD=''
CNT=0
for arg; do
  if [ \$CNT == 1 ]; then
    CMD+=' '
  else
    CNT=1
  fi
  if [[ "\$arg" == *' '* ]]; then
    CMD+="'"\$arg"'"
  else
    CMD+="\$arg"
  fi
done
echo \$CMD > "$IN"
EXIT_CODE=\$(cat "$STATUS")
cat "$OUT"
cat "$ERR" >&2
exit \$EXIT_CODE
EOF
chmod +x "${WHERE}/docker"

mkfifo "$IN"
mkfifo "$OUT"
mkfifo "$ERR"
mkfifo "$STATUS"

while true; do
  CMD_OUT=$(mktemp -u stdout.XXXXXXXXXXXXXXXXXXX)
  CMD_ERR=$(mktemp -u stdout.XXXXXXXXXXXXXXXXXXX)
  CMD=$(mktemp -u cmd.XXXXXXXXXXXXXXXXXXX)
  echo "docker $(cat "$IN")" > "$CMD"
  chmod +x "$CMD"
  set +e
  "./$CMD" 2> "$CMD_ERR" > "$CMD_OUT"
  echo $? > "$STATUS"
  rm -f "$CMD"
  set -e
  cat "$CMD_OUT" > "$OUT"
  cat "$CMD_ERR" > "$ERR"
  rm -f "$CMD_OUT" "$CMD_ERR"
done
