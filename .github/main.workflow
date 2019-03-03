workflow "Build and publish the website" {
  on = "push"
  resolves = ["Publish"]
}

action "Build theme" {
  uses = "./.github/action-website"
  runs = ["sh", "-c", "yarn --non-interactive --frozen-lockfile --cwd antora-ui-camel install && yarn --non-interactive --frozen-lockfile --cwd antora-ui-camel build"]
}

action "Build website" {
  uses = "./.github/action-website"
  needs = ["Build theme"]
  runs = ["sh", "-c", "yarn --non-interactive --frozen-lockfile install && yarn --non-interactive --frozen-lockfile build"]
}

action "Publish" {
  uses = "./.github/action-website"
  needs = ["Build website"]
  runs = "publish"
  secrets = ["GITHUB_TOKEN"]
}

