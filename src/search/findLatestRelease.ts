import {GithubApi, ReleaseResponse} from "./types";
import {findReleaseByPredicate} from "./findReleaseByPredicate";
import {checkReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";

export async function findLatestRelease(
    github: GithubApi,
    repoInfo: RepoInfo,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    if (filters.draft === undefined && filters.prerelease === undefined) {
        return (await github.rest.repos.getLatestRelease(repoInfo)).data;
    }
    return findReleaseByPredicate(
        github,
        repoInfo,
        async release => checkReleaseFilters(release, filters)
    );
}