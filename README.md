![Build Status](https://github.com/cardinalby/git-get-release-action/workflows/build-test/badge.svg)

# Get GitHub release information 

Allows you to get release information by: release id, tag, commit SHA (current commit or specified).

If release not found finishes with error.

## Inputs

Specify 1 input from the list to search release by:

* `releaseId` Release Id (number)
* `tag` Tag name
* `commitSha` SHA of commit
* `releaseName` Release name (returns most recent found)
* `latest` Set `1` or `true` to get the latest release

If no inputs specified, the action will try to get release for the current commit SHA. 

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
