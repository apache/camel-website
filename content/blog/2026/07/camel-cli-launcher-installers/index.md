---
title: "Installing the Apache Camel CLI Launcher"
date: 2026-07-20
draft: false
authors: [ ammachado ]
categories: [ "Tooling" ]
preview: "Install the Camel CLI Launcher with a single, checksum-verified command on macOS, Linux, and Windows."
---

You can now install the Apache Camel CLI Launcher on a single machine with one
command, without a package manager.

## One-line install

On macOS and Linux:

```bash
curl -fsSL https://camel.apache.org/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://camel.apache.org/install.ps1 | iex
```

Both installers resolve and install the latest published release by default, or
a specific version if you ask for one. Installation is always per-user and never
requires `sudo` or elevation.

## Verify before execute

The installers are built around a simple security property: the launcher archive
is downloaded from [Maven Central](https://repo1.maven.org/maven2/org/apache/camel/camel-launcher/),
but it is verified against a SHA-256 checksum published on `camel.apache.org`
before anything is extracted or run. The archive and the checksum come from two
independent hosts, so tampering would require compromising both at the same time.
The installer also rejects unsafe archive contents and confirms a Java 17+
runtime before activating the new version.

## Learn more

See the [installation guide](/download/camel-cli-launcher/) for pinned versions
and the inspect-before-run workflow. The installers are maintained in the Apache
Camel repository ([apache/camel#24682](https://github.com/apache/camel/pull/24682)).
