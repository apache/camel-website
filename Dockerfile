FROM node:18-buster

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
