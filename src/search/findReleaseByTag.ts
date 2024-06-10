import {GithubApi, ReleaseResponse} from "./types";
import {assertReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";
import {NotFoundError} from "../NotFoundError";

export async function findReleaseByTag(
    github: GithubApi,
    repoInfo: RepoInfo,
    tag: string,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    try {
        const found = (await github.rest.repos.getReleaseByTag({
            ...repoInfo,
            tag: tag
        })).data;
        return assertReleaseFilters(found, filters);
    } catch (err) {
        if (err instanceof Error && (err as any).status == 404) {
            throw new NotFoundError(`Release for tag = ${tag} not found`);
        }
        throw err;
    }
}