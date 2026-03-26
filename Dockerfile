FROM node:lts@sha256:3a09aa6354567619221ef6c45a5051b671f953f0a1924d1f819ffb236e520e6b

RUN set -ex \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
    jq \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxss1 \
    libxtst6 \
  && rm -rf /var/lib/apt/lists/*
