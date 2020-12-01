---
url: "/releases/k-{{ replace (replaceRE ".*/k-(.*)/index.md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/k-(.*)/index.md" "$1" .File.Path) "_" "." }}"
title: "Camel-K release {{ replace (replaceRE ".*/k-(.*)/index.md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-k"
milestone:
---
