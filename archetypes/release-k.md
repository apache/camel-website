---
url: "/releases/k-{{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}/"
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}"
title: "Camel-K release {{ replace (replaceRE ".*/release-(.*).md" "$1" .File.Path) "_" "." }}"
preview: ""
changelog: ""
category: "camel-k"
milestone:
jdk: [11]
---
