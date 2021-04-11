import * as ghActions from '@actions/core';
import { actionInputs } from './actionInputs';
import { actionOutputs } from './actionOutputs';
import { getOctokit, context } from "@actions/github";
import { GitHub } from '@actions/github/lib/utils';
import { components } from '@octokit/openapi-types';

type GithubApi = InstanceType<typeof GitHub>;
type ReleaseResponse = components['schemas']['release'];

// noinspection JSUnusedLocalSymbols
async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(error.message);
    }
}

async function runImpl() {
    if (process.env.GITHUB_TOKEN === undefined) {
        throw new Error('GITHUB_TOKEN env variable is not set');
    }
    const github = getOctokit(process.env.GITHUB_TOKEN);
    const { owner, repo } = context.repo;

    let releaseResponse: ReleaseResponse;
    if (actionInputs.releaseId) {
        ghActions.info(`Retrieving release with id = ${actionInputs.releaseId}...`);
        releaseResponse = (await github.repos.getRelease({
            owner,
            repo,
            release_id: actionInputs.releaseId
        })).data;
    } else if (actionInputs.tag) {
        ghActions.info(`Retrieving release by ${actionInputs.tag} tag...`);
        releaseResponse = (await github.repos.getReleaseByTag({
            owner,
            repo,
            tag: actionInputs.tag
        })).data;
    } else if (actionInputs.commitSha) {
        ghActions.info(`Retrieving release by ${actionInputs.commitSha} commitish...`);
        releaseResponse = await findReleaseByCommitSha(github, owner, repo, actionInputs.commitSha);
    } else if (actionInputs.releaseName) {
        ghActions.info(`Retrieving release by ${actionInputs.releaseName} name...`);
        releaseResponse = await findRelease(github, owner, repo, release => release.name === actionInputs.releaseName);
    } else if (actionInputs.latest) {
        ghActions.info(`Retrieving the latest release...`);
        releaseResponse = (await github.repos.getLatestRelease({
            owner,
            repo
        })).data;
    } else if (context.sha) {
        ghActions.info(`Retrieving release for current commit ${context.sha}...`);
        releaseResponse = await findReleaseByCommitSha(github, owner, repo, context.sha);
    } else {
        throw new Error('No inputs set, context.sha is empty');
    }

    ghActions.info('Release found:');
    console.log(releaseResponse);

    setOutputs(releaseResponse);
}

function setOutputs(release: ReleaseResponse)
{
    actionOutputs.html_url.setValue(release.html_url);
    actionOutputs.upload_url.setValue(release.upload_url);
    actionOutputs.tarball_url.setValue(release.tarball_url || '');
    actionOutputs.zipball_url.setValue(release.zipball_url || '');
    actionOutputs.id.setValue(release.id);
    actionOutputs.tag_name.setValue(release.tag_name);
    actionOutputs.target_commitish.setValue(release.target_commitish);
    actionOutputs.name.setValue(release.name|| '');
    actionOutputs.body.setValue(release.body|| '');
    actionOutputs.draft.setValue(release.draft);
    actionOutputs.prerelease.setValue(release.prerelease);
    actionOutputs.created_at.setValue(release.created_at);
    actionOutputs.published_at.setValue(release.published_at || '');
}

async function findReleaseByCommitSha(github: GithubApi, owner: string, repo: string, sha: string) {
    return findRelease(github, repo, owner, release => release.target_commitish === sha);
}

async function findRelease(
    github: GithubApi,
    owner: string,
    repo: string,
    predicate: (release: ReleaseResponse) => boolean
) {
    const releases = fetchReleases(github, owner, repo);
    for await (const release of releases) {
        if (predicate(release)) {
            return release;
        }
    }
    throw new Error('Release not found');
}

async function* fetchReleases(github: GithubApi, owner: string, repo: string): AsyncGenerator<ReleaseResponse> {
    let page = 1;
    while (true) {
        const releases = (await github.repos.listReleases({ owner, repo, per_page: 30, page})).data;
        if (releases.length === 0) {
            break;
        }
        for (const release of releases) {
            yield release;
        }
        page++;
    }
}

// noinspection JSIgnoredPromiseFromCall
run();
