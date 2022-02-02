import {GithubApi, ReleaseResponse} from "./types";
import {assertReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";
import {NotFoundError} from "../NotFoundError";

export async function findReleaseById(
    github: GithubApi,
    repoInfo: RepoInfo,
    releaseId: number,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    try {
        const found = (await github.rest.repos.getRelease({
            ...repoInfo,
            release_id: releaseId
        })).data;
        return assertReleaseFilters(found, filters);
    } catch (err) {
        if (err instanceof Error && (err as any).status === 404) {
            throw new NotFoundError(`Release with release id = ${releaseId} not found`);
        }
        throw err;
    }
}