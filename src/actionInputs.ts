import { actionInputs as inputs } from 'github-actions-utils';

export const actionInputs = {
    releaseId: inputs.getInt('releaseId', false),
    tag: inputs.getString('tag', false),
    commitSha: inputs.getString('commitSha', false),
    releaseName: inputs.getString('releaseName', false),
    releaseNameRegEx: inputs.getString('releaseNameRegEx', false),
    latest: inputs.getBool('latest', false),
    draft: inputs.getBool('draft', false),
    prerelease: inputs.getBool('prerelease', false),
    searchLimit: inputs.getInt('searchLimit', false) || 90,
    repo: inputs.getString('repo', false),
}