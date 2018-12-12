FROM antora/antora

ADD . /camel-website

WORKDIR /camel-website

RUN antora site.yml

