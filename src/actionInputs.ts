import { actionInputs as inputs } from 'github-actions-utils';

export const actionInputs = {
    releaseId: inputs.getInt('releaseId', false),
    tag: inputs.getString('tag', false),
    commitSha: inputs.getString('commitSha', false),
    releaseName: inputs.getString('releaseName', false),
    latest: inputs.getBool('latest', false)
}