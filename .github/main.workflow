workflow "Build and publish the website" {
  on = "push"
  resolves = ["Publish to staging"]
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
  secrets = ["GITHUB_TOKEN"]
}
