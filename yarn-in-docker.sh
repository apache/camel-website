#!/bin/sh

# Run yarn in docker.
# supply the yarn arga/script on the command line, e.g.
# $yarn-in-docker.sh workspace antora-ui-camel run build

docker build -t camel-website .
docker run --rm -it -v $(pwd):/work:Z --workdir /work camel-website yarn $*
