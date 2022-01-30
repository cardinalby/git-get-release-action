import { ActionOutput, ActionTrOutput } from 'github-actions-utils';
import {components} from "@octokit/openapi-types";

type ReleaseResponse = components['schemas']['release'];

export const actionOutputs = {
    html_url: new ActionOutput('html_url'),
    upload_url: new ActionOutput('upload_url'),
    tarball_url: new ActionOutput('tarball_url'),
    zipball_url: new ActionOutput('zipball_url'),
    id: new ActionTrOutput<number>('id', v => v.toString()),
    tag_name: new ActionOutput('tag_name'),
    target_commitish: new ActionOutput('target_commitish'),
    name: new ActionOutput('name'),
    body: new ActionOutput('body'),
    draft: new ActionTrOutput<boolean>('draft', v => v ? 'true' : 'false'),
    prerelease: new ActionTrOutput<boolean>('prerelease', v => v ? 'true' : 'false'),
    created_at: new ActionOutput('created_at'),
    published_at: new ActionOutput('published_at'),
    url: new ActionOutput('url'),
    assets_url: new ActionOutput('assets_url'),
    node_id: new ActionOutput('node_id'),
    /** The name of the tag. */
    author: new ActionTrOutput<components["schemas"]["simple-user"]>
        ('author', v => JSON.stringify(v)),
    assets: new ActionTrOutput<components["schemas"]["release-asset"][]>
        ('assets', v => JSON.stringify(v)),
    body_html: new ActionOutput('body_html'),
    body_text: new ActionOutput('body_text')
}

export function setOutputs(release: ReleaseResponse)
{
    actionOutputs.html_url.setValue(release.html_url);
    actionOutputs.upload_url.setValue(release.upload_url);
    actionOutputs.tarball_url.setValue(release.tarball_url || '');
    actionOutputs.zipball_url.setValue(release.zipball_url || '');
    actionOutputs.id.setValue(release.id);
    actionOutputs.tag_name.setValue(release.tag_name);
    actionOutputs.target_commitish.setValue(release.target_commitish);
    actionOutputs.name.setValue(release.name || '');
    actionOutputs.body.setValue(release.body || '');
    actionOutputs.draft.setValue(release.draft);
    actionOutputs.prerelease.setValue(release.prerelease);
    actionOutputs.created_at.setValue(release.created_at);
    actionOutputs.published_at.setValue(release.published_at || '');
    actionOutputs.url.setValue(release.url);
    actionOutputs.assets_url.setValue(release.assets_url);
    actionOutputs.node_id.setValue(release.node_id);
    actionOutputs.author.setValue(release.author);
    actionOutputs.assets.setValue(release.assets);
    actionOutputs.body_html.setValue(release.body_html || '');
    actionOutputs.body_text.setValue(release.body_text || '');
}
