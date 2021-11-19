---
url: "/releases/ckc-{{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}"
title: "Camel Kafka Connector release {{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-kafka-connector"
jdk: [8,11]
---
