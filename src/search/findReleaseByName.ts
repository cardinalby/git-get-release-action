import {GithubApi, ReleaseResponse} from "./types";
import {findReleaseByPredicate} from "./findReleaseByPredicate";
import {checkReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";

export async function findReleaseByName(
    github: GithubApi,
    repoInfo: RepoInfo,
    name: string,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    return findReleaseByPredicate(
        github,
        repoInfo,
        async release =>
            (release.name === name) &&
            checkReleaseFilters(release, filters)
    );
}