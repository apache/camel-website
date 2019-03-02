workflow "Build and publish the website" {
  on = "push"
  resolves = ["Publish"]
}

action "Build theme" {
  uses = "./.github/action-website"
  runs = "yarn"
  args = "--non-interactive --frozen-lockfile --cwd antora-ui-camel"
}

action "Build website" {
  uses = "./.github/action-website"
  needs = ["Build theme"]
  runs = "yarn"
  args = "--non-interactive --frozen-lockfile"
}

action "Publish" {
  uses = "./.github/action-website"
  needs = ["Build website"]
  runs = "publish"
  secrets = ["GITHUB_TOKEN"]
}

