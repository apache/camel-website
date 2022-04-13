#!/bin/sh

# Run yarn in docker.
# supply the yarn arga/script on the command line, e.g.
# $yarn-in-docker.sh workspace antora-ui-camel run build

docker build -t camel-website .
docker run --rm -it -p 1313:1313 -e "GITHUB_TOKEN=${GITHUB_TOKEN}" -e "CAMEL_ENV=${CAMEL_ENV}" -v $(pwd):/work:Z --workdir /work camel-website yarn $*
