import {findInItems, paginate} from "../paginate";
import {actionInputs, RepoInfo} from "../actionInputs";
import {NotFoundError} from "../NotFoundError";
import {GithubApi, ReleaseResponse} from "./types";

export async function findReleaseByPredicate(
    github: GithubApi,
    repoInfo: RepoInfo,
    predicate: (release: ReleaseResponse) => Promise<boolean>
): Promise<ReleaseResponse> {
    const release = await findInItems(
        paginate(
            async (page: number) => (await github.rest.repos.listReleases({
                ...repoInfo,
                per_page: 30,
                page
            })).data,
            actionInputs.searchLimit
        ),
        predicate
    );
    if (release !== undefined) {
        return release;
    }
    throw new NotFoundError('Release not found');
}