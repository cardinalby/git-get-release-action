import * as ghActions from '@actions/core';
import { actionInputs } from './actionInputs';
import { actionOutputs } from './actionOutputs';
import { GitHub, context } from "@actions/github";
import {Octokit} from "@octokit/rest";

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
    const github = new GitHub(process.env.GITHUB_TOKEN);
    const { owner, repo } = context.repo;

    let releaseResponse: Octokit.ReposGetReleaseResponse|undefined;

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
        releaseResponse = await getReleaseByCommitSha(github, owner, repo, actionInputs.commitSha);
    } else if (context.sha) {
        ghActions.info(`Retrieving release for current commit ${context.sha}...`);
        releaseResponse = await getReleaseByCommitSha(github, owner, repo, context.sha);
    } else {
        throw new Error('No inputs set, context.sha is empty');
    }

    ghActions.info('Release found:');
    console.log(releaseResponse);

    setOutputs(releaseResponse);
}

function setOutputs(release: Octokit.ReposGetReleaseResponse)
{
    actionOutputs.html_url.setValue(release.html_url);
    actionOutputs.upload_url.setValue(release.upload_url);
    actionOutputs.tarball_url.setValue(release.tarball_url);
    actionOutputs.zipball_url.setValue(release.zipball_url);
    actionOutputs.id.setValue(release.id);
    actionOutputs.tag_name.setValue(release.tag_name);
    actionOutputs.target_commitish.setValue(release.target_commitish);
    actionOutputs.name.setValue(release.name);
    actionOutputs.body.setValue(release.body);
    actionOutputs.draft.setValue(release.draft);
    actionOutputs.prerelease.setValue(release.prerelease);
    actionOutputs.created_at.setValue(release.created_at);
    actionOutputs.published_at.setValue(release.published_at);
}

async function getReleaseByCommitSha(github: GitHub, owner: string, repo: string, sha: string) {
    const releases = (await github.repos.listReleases({ owner, repo })).data
        .filter(release => release.target_commitish === sha);
    if (releases.length === 0) {
        throw new Error('Release not found');
    }
    if (releases.length > 1) {
        throw new Error(`${releases.length} releases found`);
    }
    return releases[0];
}

// noinspection JSIgnoredPromiseFromCall
run();
