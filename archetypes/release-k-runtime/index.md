---
url: "/releases/k-runtime-{{ replace (replaceRE ".*/k-runtime-(.*)/index.md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/k-runtime-(.*)/index.md" "$1" .File.Path) "_" "." }}"
title: "Camel-K Runtime release {{ replace (replaceRE ".*/k-runtime-(.*)/index.md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-k-runtime"
milestone:
---
