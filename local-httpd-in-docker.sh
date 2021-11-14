#!/bin/sh

# Run httpd in docker

#docker build -t camel-website .
docker run --rm -p 80:80 -p 443:443 \
  -v "$PWD/public":/usr/local/apache2/htdocs/:Z \
  -v "$PWD/support/http":/support:Z \
  httpd:2.4 /bin/bash -c "cp /support/* /usr/local/apache2/conf/ && httpd-foreground"