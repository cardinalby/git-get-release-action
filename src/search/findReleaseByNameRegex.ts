import {GithubApi, ReleaseResponse} from "./types";
import {findReleaseByPredicate} from "./findReleaseByPredicate";
import {checkReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";

export async function findReleaseByNameRegex(
    github: GithubApi,
    repoInfo: RepoInfo,
    nameRegexp: RegExp,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    return findReleaseByPredicate(
        github,
        repoInfo,
        async release => (
            !!release.name &&
            nameRegexp.test(release.name) &&
            checkReleaseFilters(release, filters))
    );
}