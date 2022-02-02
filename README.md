[![integration-test](https://github.com/cardinalby/git-get-release-action/actions/workflows/integration-test.yml/badge.svg)](https://github.com/cardinalby/git-get-release-action/actions/workflows/integration-test.yml)
[![functional-test](https://github.com/cardinalby/git-get-release-action/actions/workflows/functional-test.yml/badge.svg)](https://github.com/cardinalby/git-get-release-action/actions/workflows/functional-test.yml)
[![build-pack](https://github.com/cardinalby/git-get-release-action/actions/workflows/build-pack.yml/badge.svg)](https://github.com/cardinalby/git-get-release-action/actions/workflows/build-pack.yml)

# Get GitHub release information 

Allows you to get a release information by release id, tag, commit SHA or get the last release.

If release not found, it finishes with an error.

## Inputs

### Search by:

Set **exactly 1 input** from the list to search release by:

#### 🔸 `releaseId` 
Release id (number).

#### 🔸 `tag` 
Tag name.

#### 🔸 `commitSha`
SHA of commit. Can be used to find a draft release.

#### 🔸 `releaseName`
Exact release name. Returns most recent found. Can be used to find a draft release.

#### 🔸 `releaseNameRegEx` 
Regexp to test release name

#### 🔸 `latest` 
Set `1` or `true` to get the latest non-draft release.

_If no inputs specified, the action will try to get release for the current commit SHA._

### Additional filters

With any of inputs above you can also use 2 additional filter inputs:

#### 🔹 `draft`
Set `true` to search only for draft releases. <br>
Set `false` to search only releases that are not draft.
Leave empty to not check if a release is a draft.

#### 🔹 `prerelease`
Set `true` to search only for prerelease releases.<br>
Set `false` to search only releases that are not prerelease.
Leave empty to not check if a release is a prerelease.

### Options

#### 🔻 `doNotFailIfNotFound` _Optional, default: `false`_

Set `true` to force the action to finish with success even if release was not found. 
Can be useful in composite actions, where `continue-on-error` is not available.
If set, you can examine `id` output to know if release was found.

#### 🔻 `searchLimit` _Optional, default: `90`_
If you use one of `commitSha`, `releaseName`, 
`releaseNameRegEx` inputs you can also specify how many releases action should retrieve to perform 
a search. Specify more than 90 if
you age going to search for old releases and less if you want to speed up the search.

#### 🔻 `repo` _Optional, default: current repository_

Repository name in form of "owner/name". If not set, `GITHUB_REPOSITORY` env variable is used that by 
default points to a current repository.

## Env variables

You should set `GITHUB_TOKEN` env variable to enable action to access GitHub API. See example.

## Outputs
Values from [API](https://docs.github.com/en/rest/reference/repos#releases) response object:

* `html_url`
* `upload_url` can be used to upload assets
* `tarball_url`
* `zipball_url`
* `id`
* `tag_name`
* `target_commitish`
* `name`
* `body`
* `draft` contains `true` or `false` string value
* `prerelease` contains `true` or `false` string value
* `created_at`
* `published_at`
* `url`
* `assets_url`
* `node_id`
* `author` (JSON with author object)
* `assets` (JSON with assets object)
* `body_html`
* `body_text`

## Usage example

```yaml
- uses: cardinalby/git-get-release-action@v1
  env:
    GITHUB_TOKEN: ${{ github.token }}
  with:
    tag: '1.2.3'    
```

```yaml
- uses: cardinalby/git-get-release-action@v1
  env:
    GITHUB_TOKEN: ${{ github.token }}
  with:
    commitSha: e92acb19de8845ad1f3cb6cfab421ac26002d6b6
    prerelease: false
```

For more examples check out [functional self-test](./.github/workflows/functional-test.yml).