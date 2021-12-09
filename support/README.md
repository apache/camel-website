# Support files

This directory contains support files that are used when working on the
website. Files here are not published on the website.

## Running Apache HTTP

We have configuration in `static/.htaccess` that occasionally we need to
update. Our preview environment is hosted on the build server (Jenkins)
and for the local preview Hugo is acting as a web server. So with that
there is no way to test changes to `static/.htaccess` file before it is
applied to the production website. For this we have a `httpd.conf` file
here that mimics the production environment locally. In conjunction with
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

# Docker/Podman pipe

When running the build within a container for some checks we might need
to run more containers. For example the `tests/redirect.sh` script when
run with `-s` will start Apache HTTP in a container. A common solution
to that is a "Docker in Docker", i.e. mounting `/var/run/docker.socket`
and `/usr/bin/docker` in the container. This has two drawbacks, one is
that the libc version of the build container might not be compatible
with the libc version of the `docker` CLI installed on host, now mounted
within the build container; and another is that when running with
additional restrictions, e.g. user-mapping or SELinux, accessing
`/var/run/docker.socket` from the build container's namespace could lead
to permission errors.

To circumvent that the `docker-pipe.sh` script creates several named
FIFO special files (see mkfifo(1)) that can be mounted to the build
container, along with the `docker` stub script that uses those named
pipes to communicate with the `docker-pipe.sh` running on the host.

Typical usage scenario is something like:

```shell
$ support/docker-pipe.sh tmp &
$ docker run -v "$PWD/tmp":"$PWD/tmp" \
  -v "$PWD/tmp/docker":/usr/bin/docker" \
  ...
root@62ace315af17:...# docker run ...
root@62ace315af17:...# exit
$ tmp/teardown.sh
```

Some notes on the usage: the argument provided to `docker-pipe.sh` is a
directory where named pipes `docker` stub script and `teardown.sh`
scripts will be placed. This directory must be mounted to the same path
within the container, as in the above example. One can use `docker` stub
script from that directory or, as in the above example, mount it to
`/usr/bin/docker` so it's immediately available on `$PATH`.
`docker-pipe.sh` should be run in the background, and to terminate it
use `teardown.sh`, one could use job control commands as well, but that
might be a bit more involved in CI environments (hence `teardown.sh`).
Upon exiting `docker-pipe.sh` will delete the files it created from the
provided directory.
