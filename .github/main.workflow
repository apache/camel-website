workflow "Build and publish the website" {
  on = "push"
  resolves = ["Build website"]
}

action "Build theme" {
  uses = "./action-website/"
  runs = "yarn"
  args = "--non-interactive --frozen-lockfile --cwd antora-ui-camel"
}

action "Build website" {
  uses = "./action-website/"
  needs = ["Build theme"]
  runs = "yarn"
  args = "--non-interactive --frozen-lockfile"
}
