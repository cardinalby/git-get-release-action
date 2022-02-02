import {findInItems, paginate} from "../paginate";
import {actionInputs, RepoInfo} from "../actionInputs";
import {NotFoundError} from "../NotFoundError";
import {GithubApi} from "./types";
import {components} from "@octokit/openapi-types";

type TagResponse = components['schemas']['tag'];

export async function findTagByPredicate(
    github: GithubApi,
    repoInfo: RepoInfo,
    predicate: (tag: TagResponse) => Promise<boolean>
): Promise<TagResponse> {
    const tag = await findInItems(
        paginate(
            async (page: number) => (await github.rest.repos.listTags({
                ...repoInfo,
                per_page: 30,
                page
            })).data,
            actionInputs.searchLimit
        ),
        predicate
    );
    if (tag !== undefined) {
        return tag;
    }
    throw new NotFoundError('Tag not found');
}