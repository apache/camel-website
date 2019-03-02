workflow "Build and publish the website" {
  on = "push"
  resolves = [
    "Publish to staging",
    "Publish preview",
  ]
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

action "Filter on master branch" {
  uses = "actions/bin/filter@d820d56839906464fb7a57d1b4e1741cf5183efa"
  needs = ["Build website"]
  args = "branch master"
}

action "Publish to staging" {
  uses = "./.github/action-website"
  needs = ["Filter on master branch"]
  runs = "publish"
  args = "staging"
  secrets = ["GITHUB_TOKEN"]
}

action "Filter on pull request" {
  uses = "actions/bin/filter@d820d56839906464fb7a57d1b4e1741cf5183efa"
  needs = ["Build website"]
  args = "ref refs/pulls/*"
}

action "Publish preview" {
  uses = "./.github/action-website"
  needs = ["Filter on pull request"]
  runs = "publish"
  args = "preview"
  secrets = ["GITHUB_TOKEN"]
}

