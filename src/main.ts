import * as ghActions from '@actions/core';
import { actionInputs } from './actionInputs';
import { setOutputs} from './actionOutputs';
import { getOctokit, context } from "@actions/github";
import { GitHub } from '@actions/github/lib/utils';
import { components } from '@octokit/openapi-types';
import {findInItems, paginate} from "./paginate";

type GithubApi = InstanceType<typeof GitHub>;
type ReleaseResponse = components['schemas']['release'];
type TagResponse = components['schemas']['tag'];

// noinspection JSUnusedLocalSymbols
export async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(String(error));
    }
}

async function runImpl() {
    if (process.env.GITHUB_TOKEN === undefined) {
        throw new Error('GITHUB_TOKEN env variable is not set');
    }
    const github = getOctokit(process.env.GITHUB_TOKEN);
    const repoInfo = getOwnerAndRepo(actionInputs.repo);

    let releaseResponse: ReleaseResponse;
    if (actionInputs.releaseId) {
        ghActions.info(`Retrieving release with id = ${actionInputs.releaseId}...`);
        releaseResponse = assertRelease((await github.rest.repos.getRelease({
            ...repoInfo,
            release_id: actionInputs.releaseId
        })).data, actionInputs.draft, actionInputs.prerelease);
    } else if (actionInputs.tag) {
        ghActions.info(`Retrieving release by ${actionInputs.tag} tag...`);
        releaseResponse = assertRelease((await github.rest.repos.getReleaseByTag({
            ...repoInfo,
            tag: actionInputs.tag
        })).data, actionInputs.draft, actionInputs.prerelease);
    } else if (actionInputs.commitSha) {
        ghActions.info(`Retrieving release by ${actionInputs.commitSha} SHA...`);
        releaseResponse = await findReleaseByCommitSha(
            github, repoInfo.owner, repoInfo.repo, actionInputs.commitSha, actionInputs.draft, actionInputs.prerelease
        );
    } else if (actionInputs.releaseName) {
        ghActions.info(`Retrieving release by ${actionInputs.releaseName} name...`);
        releaseResponse = await findReleaseByName(
            github, repoInfo.owner, repoInfo.repo, actionInputs.releaseName, actionInputs.draft, actionInputs.prerelease
        );
    } else if (actionInputs.releaseNameRegEx) {
        ghActions.info(`Retrieving release by ${actionInputs.releaseNameRegEx} name regex...`);
        releaseResponse = await findReleaseByNameRegex(
            github,
            repoInfo.owner,
            repoInfo.repo,
            new RegExp(actionInputs.releaseNameRegEx),
            actionInputs.draft,
            actionInputs.prerelease
        );
    } else if (actionInputs.latest) {
        ghActions.info(`Retrieving the latest release...`);
        releaseResponse = await findLatestRelease(
            github, repoInfo.owner, repoInfo.repo, actionInputs.draft, actionInputs.prerelease
        );
    } else if (context.sha) {
        ghActions.info(`Retrieving release for current commit ${context.sha}...`);
        releaseResponse = await findReleaseByCommitSha(
            github, repoInfo.owner, repoInfo.repo, context.sha, actionInputs.draft, actionInputs.prerelease
        );
    } else {
        throw new Error('No inputs set, context.sha is empty');
    }

    ghActions.info('Release found:');
    console.log(releaseResponse);

    setOutputs(releaseResponse);
}

function checkRelease(
    release: ReleaseResponse, draft: boolean|undefined, prerelease: boolean|undefined
): boolean {
    return ((draft === undefined || release.draft === draft) &&
        (prerelease === undefined || release.prerelease === prerelease))
}

function assertRelease(
    release: ReleaseResponse, draft: boolean|undefined, prerelease: boolean|undefined
): ReleaseResponse {
    if (!checkRelease(release, draft, prerelease)) {
        throw new Error(`Found a release with tag = ${release.tag_name}, but it has ` +
            `draft=${release.draft} and prerelease=${release.prerelease}`);
    }
    return release;
}

async function findReleaseByCommitSha(
    github: GithubApi,
    owner: string,
    repo: string,
    sha: string,
    draft: boolean|undefined,
    prerelease: boolean|undefined
): Promise<ReleaseResponse> {
    let release: ReleaseResponse|undefined;
    const tag = await findTag(
        github, owner, repo,
        async tag => {
            if (tag.commit.sha.toLowerCase() !== sha.toLowerCase()) {
                return false;
            }
            try {
                release = await findRelease(
                    github, owner, repo,
                    async release => (release.tag_name === tag.name)
                );
                const meetRequirements =  checkRelease(release, draft, prerelease);
                if (!meetRequirements) {
                    ghActions.debug(`Release with tag == ${tag.name} doesn't meet ` +
                        `draft: ${draft}, prerelease: ${prerelease} requirements`);
                }
                return meetRequirements;
            } catch (err) {
                ghActions.debug(`Release with tag == ${tag.name} not found`);
                return false;
            }
        }
    );
    if (tag === undefined) {
        throw new Error(`Tag with sha == ${sha} not found`);
    }
    if (release !== undefined) {
        return release;
    }
    throw new Error('Finding release internal error');
}

async function findReleaseByName(
    github: GithubApi,
    owner: string,
    repo: string,
    name: string,
    draft: boolean|undefined,
    prerelease: boolean|undefined
): Promise<ReleaseResponse> {
    return findRelease(
        github, owner, repo,
        async release => (release.name === name) && checkRelease(release, draft, prerelease)
    );
}

async function findReleaseByNameRegex(
    github: GithubApi,
    owner: string,
    repo: string,
    nameRegexp: RegExp,
    draft: boolean|undefined,
    prerelease: boolean|undefined
): Promise<ReleaseResponse> {
    return findRelease(
        github, owner, repo,
        async release => (
            !!release.name &&
            nameRegexp.test(release.name) &&
            checkRelease(release, draft, prerelease))
    );
}

async function findLatestRelease(
    github: GithubApi,
    owner: string,
    repo: string,
    draft: boolean|undefined,
    prerelease: boolean|undefined
): Promise<ReleaseResponse> {
    if (draft === undefined && prerelease === undefined) {
        return (await github.rest.repos.getLatestRelease({owner, repo})).data;
    }
    return findRelease(
        github, owner, repo,
        async release => checkRelease(release, draft, prerelease)
    );
}

async function findRelease(
    github: GithubApi,
    owner: string,
    repo: string,
    predicate: (release: ReleaseResponse) => Promise<boolean>
): Promise<ReleaseResponse> {
    const release = await findInItems(
        paginate(
            async (page: number) => (await github.rest.repos.listReleases({ owner, repo, per_page: 30, page})).data,
            actionInputs.searchLimit
        ),
        predicate
    );
    if (release !== undefined) {
        return release;
    }
    throw new Error('Release not found');
}

async function findTag(
    github: GithubApi,
    owner: string,
    repo: string,
    predicate: (tag: TagResponse) => Promise<boolean>
): Promise<TagResponse> {
    const tag = await findInItems(
        paginate(
            async (page: number) => (await github.rest.repos.listTags({ owner, repo, per_page: 30, page})).data,
            actionInputs.searchLimit
        ),
        predicate
    );
    if (tag !== undefined) {
        return tag;
    }
    throw new Error('Tag not found');
}

function getOwnerAndRepo(inputRepoString?: string): {owner: string, repo: string} {
    if (inputRepoString !== undefined) {
        let [owner, ...repoParts] = inputRepoString.split('/');
        const repo = repoParts.join('/');
        if (!(owner.length && repo.length)) {
            throw new Error('Invalid format of "repo" input. Should be: owner/repo');
        }
        return {owner, repo};
    }
    return context.repo;
}
