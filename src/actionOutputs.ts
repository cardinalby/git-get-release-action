import { ActionOutput, ActionTrOutput } from 'github-actions-utils';

export const actionOutputs = {
    html_url: new ActionOutput('html_url'),
    upload_url: new ActionOutput('upload_url'),
    tarball_url: new ActionOutput('tarball_url'),
    zipball_url: new ActionOutput('zipball_url'),
    id: new ActionTrOutput<number>('id', v => v.toString()),
    tag_name: new ActionOutput('tag_name'),
    target_commitish: new ActionOutput('target_commitish'),
    name: new ActionOutput('name'),
    draft: new ActionTrOutput<boolean>('draft', v => v ? 'true' : 'false'),
    prerelease: new ActionTrOutput<boolean>('prerelease', v => v ? 'true' : 'false'),
    created_at: new ActionOutput('created_at'),
    published_at: new ActionOutput('published_at')
}