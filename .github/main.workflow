workflow "Build and publish the website" {
  on = "push"
  resolves = ["Build website"]
}

action "Build theme" {
  uses = "borales/actions-yarn@1bf615491daf339f333dcbfe4aef4337c042abd4"
  args = "--non-interactive --frozen-lockfile --cwd antora-ui-camel"
}

action "Build website" {
  uses = "borales/actions-yarn@1bf615491daf339f333dcbfe4aef4337c042abd4"
  needs = ["Build theme"]
  args = "--non-interactive --frozen-lockfile"
}
