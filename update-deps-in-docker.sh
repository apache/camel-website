#!/bin/sh

# Run yarn update:dependencies in docker to produce linux-compatible .yarn/unplugged entries.
# On another system (e.g. mac) you need to run yarn to get platform appropriate entries.

docker build -t camel-website .
docker run --rm -it -v $(pwd):/work:Z --entrypoint ./update-deps.sh --workdir /work camel-website
