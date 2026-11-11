import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { run } from './runBenchmarkCli.mjs';

const root = new URL('../fixtures/', import.meta.url).href;

describe('runBenchmarkCli', () => {
    let errors: string[];

    beforeEach(() => {
        errors = [];
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
        vi.spyOn(console, 'error').mockImplementation((...args) => {
            errors.push(args.join(' '));
        });
        vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
        process.exitCode = undefined;
        vi.restoreAllMocks();
    });

    // Suites register globally, so each test selects its own suites with `--suite`.
    test.each`
        file               | args                       | hadFailures | exitCode
        ${'pass.perf.mts'} | ${'--suite fixture-pass'}  | ${false}    | ${0}
        ${'fail.perf.mts'} | ${'--suite fixture-fail'}  | ${true}     | ${1}
        ${'pass.perf.mts'} | ${'--suite no-such-suite'} | ${true}     | ${1}
        ${'pass.perf.mts'} | ${'-S fixture-pass -r 2'}  | ${false}    | ${0}
        ${'pass.perf.mts'} | ${'-S fixture-pass -t 3'}  | ${false}    | ${0}
        ${'pass.perf.mts'} | ${'-S fixture-pass -T no'} | ${false}    | ${0}
    `('run $file $args', async ({ file, args, hadFailures, exitCode }) => {
        await expect(run([file, '--root', root, ...args.split(' ')])).resolves.toEqual({
            error: undefined,
            hadFailures,
        });
        expect(process.exitCode).toBe(exitCode);
    });

    test('a file that fails to import is an error', async () => {
        const r = await run(['throws-on-import.perf.mts', '--root', root]);
        expect(r.hadFailures).toBe(true);
        expect(r.error?.message).toBe('Failed to import file: throws-on-import.perf.mts');
        expect(r.error?.cause).toEqual(new Error('Import failed.'));
        expect(errors.join('\n')).toContain('Failed to import file: throws-on-import.perf.mts');
        expect(process.exitCode).toBe(1);
    });

    test('files are resolved against the current directory by default', async () => {
        const r = await run(['fixtures/pass.perf.mts', '--suite', 'fixture-pass']);
        expect(r).toEqual({ error: undefined, hadFailures: false });
    });

    test('unknown options are rejected', async () => {
        await expect(run(['--unknown'])).rejects.toThrow();
    });
});
