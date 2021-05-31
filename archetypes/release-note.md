---
date: {{ dateFormat "2006-01-02" .Date }}
# EOL date, default 1 year from release date
eol: {{ ((time .Date).AddDate 1 0 0).Format "2006-01-02" }}
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
