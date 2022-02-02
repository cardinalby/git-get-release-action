import {GithubApi, ReleaseResponse} from "./types";
import * as ghActions from "@actions/core";
import {findTagByPredicate} from "./findTagByPredicate";
import {findReleaseByPredicate} from "./findReleaseByPredicate";
import {checkReleaseFilters} from "./filtering";
import {ReleaseFilters, RepoInfo} from "../actionInputs";

export async function findReleaseByCommitSha(
    github: GithubApi,
    repoInfo: RepoInfo,
    sha: string,
    filters: ReleaseFilters
): Promise<ReleaseResponse> {
    let release: ReleaseResponse|undefined;
    ghActions.info(`Looking for tag with sha == ${sha} ...`);
    await findTagByPredicate(
        github,
        repoInfo,
        async tag => {
            if (tag.commit.sha.toLowerCase() !== sha.toLowerCase()) {
                return false;
            }
            try {
                release = await findReleaseByPredicate(
                    github,
                    repoInfo,
                    async release => (release.tag_name === tag.name)
                );
                const meetRequirements = checkReleaseFilters(release, filters);
                if (!meetRequirements) {
                    ghActions.debug(
                        `Release with tag == ${tag.name} doesn't meet ${JSON.stringify(filters)} requirements`
                    );
                }
                return meetRequirements;
            } catch (err) {
                ghActions.debug(`Release with tag == ${tag.name} not found`);
                return false;
            }
        }
    );
    if (release !== undefined) {
        return release;
    }
    throw new Error('Finding release internal error');
}