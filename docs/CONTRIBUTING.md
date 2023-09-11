# Contributing Guide

- Contributing to this project is fairly easy. This document shows you how to get started!

## General

- The [Codebase Structure](./CODEBASE_STRUCTURE.md) has detailed information about how the various files in this project are structured.
- Please ensure that any changes you make are in accordance with the [Code Guidelines](./CODE_GUIDELINES.md) of this repository.

## Start working

- Fork the repository
- Clone your forked repository
- Create a new branch for your work based on the develop branch
- Use one branch per fix/feature
- Possible branch types are:
  - bugfix
  - feature
  - hotfix
  - release
  - other
- Create a pull request to the develop branch

Example:

```bash
git checkout -b bugfix/change-something
```

If you get an error, you may need to fetch the repository first by using

```bash
git remote update && git fetch
```

## Update branch with development

It's strongly recommended pull development code to your branch to stay updated. Use the command below to perform this task.

```bash
git pull origin development
```

You may need to fix some conflicts before continue your code.

## Submitting changes

- Install the dependencies using:

  ```bash
  yarn
  ```

- Use this command to start commitizen and follow the instructions on console to build a great commit message for you

  ```bash
  git commit
  ````

  WARNING: Please mention the issue ID on your commit.

- Make a pull request
- Make sure you send the PR to the <code>develop</code> branch

If you follow these instructions, your PR will be set up for success through the project pipeline.
