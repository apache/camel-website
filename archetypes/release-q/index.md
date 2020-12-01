---
url: "/releases/q-{{ replace (replaceRE ".*/q-(.*)/index.md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/q-(.*)/index.md" "$1" .File.Path) "_" "." }}"
title: "Camel Quarkus release {{ replace (replaceRE ".*/q-(.*)/index.md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-quarkus"
milestone:
---
