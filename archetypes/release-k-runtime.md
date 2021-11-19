---
url: "/releases/k-runtime-{{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}"
title: "Camel-K Runtime release {{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-k-runtime"
milestone:
jdk: [11]
---
