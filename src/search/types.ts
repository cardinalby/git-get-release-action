import {GitHub} from "@actions/github/lib/utils";
import {components} from "@octokit/openapi-types";

export type GithubApi = InstanceType<typeof GitHub>;
export type ReleaseResponse = components['schemas']['release'];

