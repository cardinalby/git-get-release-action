import {actionInputs as inputs} from 'github-actions-utils';
import {context} from "@actions/github";

export type RepoInfo = {owner: string, repo: string};

export interface ReleaseFilters {
    draft?: boolean;
    prerelease?: boolean;
}

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
    doNotFailIfNotFound: inputs.getBool('doNotFailIfNotFound', true),

    getOwnerAndRepo(): RepoInfo {
        if (actionInputs.repo !== undefined) {
            let [owner, ...repoParts] = actionInputs.repo.split('/');
            const repo = repoParts.join('/');
            if (!(owner.length && repo.length)) {
                throw new Error('Invalid format of "repo" input. Should be: owner/repo');
            }
            return {owner, repo};
        }
        return context.repo;
    },

    getFilters(): ReleaseFilters {
        return {
            draft: actionInputs.draft,
            prerelease: actionInputs.prerelease
        }
    }
}

