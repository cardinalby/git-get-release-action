import {NotFoundError} from "../NotFoundError";
import {ReleaseResponse} from "./types";
import {ReleaseFilters} from "../actionInputs";

export function checkReleaseFilters(release: ReleaseResponse, filters: ReleaseFilters): boolean {
    return ((filters.draft === undefined || release.draft === filters.draft) &&
        (filters.prerelease === undefined || release.prerelease === filters.prerelease))
}

export function assertReleaseFilters(release: ReleaseResponse, filters: ReleaseFilters): ReleaseResponse {
    if (!checkReleaseFilters(release, filters)) {
        throw new NotFoundError(`Found a release with tag = ${release.tag_name}, but it has ` +
            `draft=${release.draft} and prerelease=${release.prerelease}`);
    }
    return release;
}