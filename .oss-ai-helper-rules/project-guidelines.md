# Project Guidelines

This rule file contains branching, commit, PR, and task-finding conventions for the project. Commands read this file to determine how to name branches, format commits, and search for tasks.

- **Fix branch:** `fix/<ISSUE_ID>`
- **Feature branch:** `feature/<ISSUE_ID>-<short-slug>`
- **Bugfix branch:** `bugfix/<ISSUE_ID>`
- **Quick-fix branch:** `quick-fix/<short-slug>`
- **Blog-post branch:** `blog/<short-slug>`
- **SonarCloud branch:** n/a
- **Commit format (fix):** `Fix #<ISSUE_ID>: <brief description of fix>`
- **Commit format (quick-fix):** `chore: <brief description>`
- **CI-issue branch:** `ci-issue/<short-slug>`
- **Commit format (ci-issue):** `ci: <brief description>`
- **Commit signing:** commits are not GPG-signed (`git commit --no-gpg-sign` if the local git config signs by default)
- **PR creation:** always
- **Merge policy:** squash merge, delete the branch; there is no required-review branch protection
- **Backport policy:** none — there are no maintenance or backport branches, every change goes to `main`, and Jenkins deploys `main` to `https://camel.apache.org`
- **Find-task source:** GitHub labels
- **Find-task beginner label:** `good first issue`
- **Find-task intermediate label:** _(none)_
- **Find-task experienced label:** `help wanted`
- **Scope-too-large redirect:** `/oss-create-issue`

## Version
e961a0b5742be5bda18e4fd8b31d36fd68a91ac7
