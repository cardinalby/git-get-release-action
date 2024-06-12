import {GithubApi, ReleaseResponse} from "./types";
import {findReleaseByPredicate} from "./findReleaseByPredicate";
import {checkReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";
import {NotFoundError} from "../NotFoundError";

export async function findLatestRelease(
    github: GithubApi,
    repoInfo: RepoInfo,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    if (filters.draft === undefined && filters.prerelease === undefined) {
        try {
            return (await github.rest.repos.getLatestRelease(repoInfo)).data;
        } catch (error: any) {
            if (error instanceof Error && (error as any).status == 404) {
                throw new NotFoundError("latest release not found: " + typeof error)
            }
            throw error;
        }
    }
    return findReleaseByPredicate(
        github,
        repoInfo,
        async release => checkReleaseFilters(release, filters)
    );
}