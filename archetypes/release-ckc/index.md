---
url: "/releases/ckc-{{ replace (replaceRE ".*/ckc-(.*)/index.md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/ckc-(.*)/index.md" "$1" .File.Path) "_" "." }}"
title: "Camel Kafka Connector release {{ replace (replaceRE ".*/ckc-(.*)/index.md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-kafka-connector"
---
