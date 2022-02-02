import * as ghActions from '@actions/core';
import { actionInputs } from './actionInputs';
import { setOutputs} from './actionOutputs';
import { getOctokit, context } from "@actions/github";
import {NotFoundError} from "./NotFoundError";
import {GithubApi, ReleaseResponse} from "./search/types";
import {findReleaseById} from "./search/findReleaseById";
import {findReleaseByTag} from "./search/findReleaseByTag";
import {findReleaseByCommitSha} from "./search/findReleaseByCommitSha";
import {findReleaseByName} from "./search/findReleaseByName";
import {findReleaseByNameRegex} from "./search/findReleaseByNameRegex";
import {findLatestRelease} from "./search/findLatestRelease";

export async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        if (actionInputs.doNotFailIfNotFound && error instanceof NotFoundError) {
            ghActions.warning(error.message);
        } else {
            ghActions.setFailed(String(error));
        }
    }
}

async function runImpl() {
    if (process.env.GITHUB_TOKEN === undefined) {
        throw new Error('GITHUB_TOKEN env variable is not set');
    }
    const github = getOctokit(process.env.GITHUB_TOKEN);
    const releaseResponse = await findRelease(github);
    ghActions.info('Release found:');
    console.log(releaseResponse);
    setOutputs(releaseResponse);
}

async function findRelease(github: GithubApi): Promise<ReleaseResponse> {
    const repoInfo = actionInputs.getOwnerAndRepo();
    
    if (actionInputs.releaseId) {
        ghActions.info(`Retrieving release with id = ${actionInputs.releaseId}...`);
        return await findReleaseById(
            github, repoInfo, actionInputs.releaseId, actionInputs.getFilters()
        );
    } 
    
    if (actionInputs.tag) {
        ghActions.info(`Retrieving release by ${actionInputs.tag} tag...`);
        return await findReleaseByTag(
            github, repoInfo, actionInputs.tag, actionInputs.getFilters()
        );
    }

    if (actionInputs.commitSha) {
        ghActions.info(`Retrieving release by ${actionInputs.commitSha} SHA...`);
        return await findReleaseByCommitSha(
            github, repoInfo, actionInputs.commitSha, actionInputs.getFilters()
        );
    }

    if (actionInputs.releaseName) {
        ghActions.info(`Retrieving release by ${actionInputs.releaseName} name...`);
        return await findReleaseByName(
            github, repoInfo, actionInputs.releaseName, actionInputs.getFilters()
        );
    }

    if (actionInputs.releaseNameRegEx) {
        ghActions.info(`Retrieving release by ${actionInputs.releaseNameRegEx} name regex...`);
        return await findReleaseByNameRegex(
            github,
            repoInfo,
            new RegExp(actionInputs.releaseNameRegEx),
            actionInputs.getFilters()
        );
    }

    if (actionInputs.latest) {
        ghActions.info(`Retrieving the latest release...`);
        return await findLatestRelease(
            github, repoInfo, actionInputs.getFilters()
        );
    }

    if (context.sha) {
        ghActions.info(`Retrieving release for current commit ${context.sha}...`);
        return await findReleaseByCommitSha(
            github, repoInfo, context.sha, actionInputs.getFilters()
        );
    }

    throw new Error('No inputs set, context.sha is empty');
}









