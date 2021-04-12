![Build Status](https://github.com/cardinalby/git-get-release-action/workflows/build-test/badge.svg)

# Get GitHub release information 

Allows you to get release information by: release id, tag, commit SHA (current commit or specified).

If release not found finishes with error.

## Inputs

Specify 1 input from the list to search release by:

* `releaseId` Release Id (number).
* `tag` Tag name.
* `commitSha` SHA of commit. Can be used to find a draft release.
* `releaseName` Release name. Returns most recent found. Can be used to find a draft release.
* `latest` Set `1` or `true` to get the latest non-draft release.

If no inputs specified, the action will try to get release for the current commit SHA.

* `searchLimit` Optional, default: `90`. If you use `commitSha` or `releaseName` inputs you can 
also specify how many releases action should retrieve to perform a search. Specify more than 90 if
you age going to search for old releases and less if you want to speed up the search.

## Env variable

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

## Example usage()
```yaml
- uses: cardinalby/git-get-release-action@v1.1
  env:
    GITHUB_TOKEN: ${{ github.token }}
  with:
    tag: '1.2.3'    
```
