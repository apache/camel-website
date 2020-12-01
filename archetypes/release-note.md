---
date: {{ .Date }}
draft: true
type: release-note
version: "{{ replace .File.BaseFileName "release-" "" }}"
title: "Release {{ replace .File.BaseFileName "release-" "" }}"
preview: ""
apiBreaking: ""
knownIssues: ""
jiraVersionId: ""
category: "camel"
# kind can be lts or legacy (for 2.x)
# kind:
---
