import {RunTarget, RunOptions} from "github-action-ts-run-api";
import dotenv from 'dotenv';

dotenv.config({path: 'tests.env'});

describe('git-get-release-action', () => {
    const target = RunTarget.jsFile('lib/index.js', 'action.yml');
    const options = RunOptions.create({
        env: {
            GITHUB_TOKEN: process.env.GITHUB_TOKEN,
            GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY
        }
    });

    it('should get by id', () => {
        const res = target.run(options.clone()
            .setInputs({  releaseId: '56669824' })
        );
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.id).toEqual('56669824');
        expect(res.commands.outputs.tag_name).toEqual('testTag');
        expect(res.commands.outputs.name).toEqual('test release name');
        expect(res.commands.outputs.body).toEqual('test body');
        expect(res.commands.outputs.draft).toEqual('false');
        expect(res.commands.outputs.prerelease).toEqual('true');
        expect(res.commands.outputs.created_at).toEqual('2021-04-12T19:34:47Z');
        expect(JSON.parse(res.commands.outputs.author as string).login).toEqual('cardinalby');
        const assets = JSON.parse(res.commands.outputs.assets as string);
        expect(Array.isArray(assets)).toBe(true);
        expect(assets.length).toEqual(1);
        expect(assets[0].name).toEqual('github-actions-webext.png');
    });

    test.each([
        ['true',    'true',    false],
        [undefined, undefined, true],
        ['false',   undefined, false],
        ['true',    undefined, true]
    ])(
        'should get by tag, prerelease: %s, draft: %s',
        (prerelease, draft, expectSuccess) => {
            const res = target.run(options.clone()
                .setInputs({
                    tag: 'testTag',
                    prerelease: prerelease,
                    draft: draft,
                    doNotFailIfNotFound: 'true'
                })
            );
            expect(res.isSuccess).toEqual(true);
            if (expectSuccess) {
                expect(res.commands.outputs.id).toEqual('56669824');
            }
        });

    test.each([
        ['true',    'true',    undefined],
        [undefined, undefined, 'testTagDraft'],
        ['false',   undefined, 'testTagDraft'],
        [undefined, 'true',    'testTagDraft'],
        ['true',    undefined, 'testTag'],
        ['false',   'false',   '1.1.1'],
    ])(
        'should get by commit SHA, prerelease: %s, draft: %s, expected tag: %s',
        (prerelease, draft, tagName) => {
        const res = target.run(options.clone()
            .setInputs({
                commitSha: 'e92acb19de8845ad1f3cb6cfab421ac26002d6b6',
                prerelease: prerelease,
                draft: draft
            })
        );
        expect(res.isSuccess).toEqual(tagName !== undefined);
        if (res.isSuccess) {
            expect(res.commands.outputs.tag_name).toEqual(tagName);
            expect(res.commands.errors).toEqual([]);
        } else {
            expect(res.commands.errors).not.toEqual([]);
        }
    });

    it('should get by releaseName', () => {
        const res = target.run(options.clone()
            .setInputs({  releaseName: 'Initial release' })
        );
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.id).toEqual('28737577');
        expect(res.commands.outputs.tag_name).toEqual('1.0.0');
    });

    it('should get by releaseNameRegEx', () => {
        const res = target.run(options.clone()
            .setInputs({ releaseNameRegEx: 'searchLimit \\w+' })
        );
        expect(res.isSuccess).toEqual(true);
        expect(res.commands.outputs.name).toEqual('searchLimit input');
        expect(res.commands.outputs.tag_name).toEqual('1.1.1');
    });
})