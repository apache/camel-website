---
title: "Install the Camel CLI Launcher"
---

The Camel CLI Launcher can be installed on a single machine without a package
manager. The installer scripts published on this site download the launcher
from Maven Central and verify it against a SHA-256 checksum published here
before running it. Installation is always per-user and never requires `sudo`
or elevation.

## Requirements

- A Java 17 or newer runtime discoverable on your system.
- `curl` (macOS and Linux) or PowerShell 5.1+ (Windows).

## Quick install

With no arguments the installer resolves and installs the latest published
release. The latest release is not always an LTS release: to install an LTS
release, pin its exact version (for example `4.22.2`) as shown below.

### macOS and Linux

```bash
curl -fsSL https://camel.apache.org/install.sh | sh
```

### Windows (PowerShell)

```powershell
irm https://camel.apache.org/install.ps1 | iex
```

## Install a specific version, or inspect before running

If you prefer not to pipe a script straight into a shell, download it, read it,
then run it. The same approach lets you pin an exact `X.Y.Z` version.

### macOS and Linux

```bash
curl -fsSL https://camel.apache.org/install.sh -o install.sh
less install.sh
sh install.sh --version 4.21.0
```

### Windows (PowerShell)

```powershell
irm https://camel.apache.org/install.ps1 -OutFile install.ps1
notepad install.ps1
./install.ps1 -Version 4.21.0
```

## How the security works

The installer downloads the release archive from
[Maven Central](https://repo1.maven.org/maven2/org/apache/camel/camel-launcher/),
but verifies it against a SHA-256 checksum recorded in a manifest served from
`camel.apache.org`. The archive and the checksum come from two independent
hosts, so tampering would require compromising both at once. The installer also
rejects archives containing absolute paths, `../` traversal, escaping symlinks,
or more than one top-level directory, and runs the staged launcher once to
confirm a Java 17+ runtime before activating it. If that check fails, any
previously installed version is left untouched.

The manifests live under `https://camel.apache.org/camel-cli/releases/`:

| Manifest | Selects |
| --- | --- |
| `X.Y.Z.properties` (e.g. `4.22.2.properties`) | That exact release. It never changes once published. |
| `latest.properties` | The newest release. This is what the installer uses by default. |
| `lts.properties` | The newest LTS release. |
| `X.Y.properties` (e.g. `4.22.properties`) | The newest patch release of the `X.Y` line. |

`latest.properties`, `lts.properties` and `X.Y.properties` are copies of the
exact-version manifest they select, and only move forward to a newer version:
a patch on an older LTS line does not move `lts.properties` back.

The installers are maintained in the Apache Camel repository
([apache/camel#24682](https://github.com/apache/camel/pull/24682)).
