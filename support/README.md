# Support files

This directory contains support files that are used when working on the
website. Files here are not published on the website.

## Running Apache HTTP

We have configuration in `static/.htaccess` that occasionally we need to
update. Our preview environment is hosted on the build server (Jenkins)
and for the local preview Hugo is acting as a web server. So with that
there is no way to test changes to `static/.htaccess` file before it is
applied to the production website. For this we have a `httpd.conf` file
here that mimicks the production environment locally. In conjuction with
running HTTP server in a Linux container it can be used to test changes
to `static/.htaccess`.

Use like this from the root of the git repository after building the
website (`yarn build`):

```shell
$ docker run --rm -p 80:80 -p 443:443 \
  -v "$PWD/public":/usr/local/apache2/htdocs/:Z \
  -v "$PWD/support/http":/support:Z \
  httpd:2.4 /bin/bash -c "cp /support/* /usr/local/apache2/conf/ && httpd-foreground" 
```

