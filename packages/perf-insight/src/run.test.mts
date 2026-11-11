import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { suite } from './perfSuite.mjs';
import { runBenchmarkSuites } from './run.mjs';

const shortTimeout = 5;

const suiteAlpha = suite('alpha', 'The alpha suite', (test) => {
    test('noop', () => undefined);
}).setTimeout(shortTimeout);

const suiteAlphabet = suite('alphabet', (test) => {
    test('noop', () => undefined);
}).setTimeout(shortTimeout);

const suiteFails = suite('fails', (test) => {
    test('throws', () => {
        throw new Error('boom');
    });
}).setTimeout(shortTimeout);

describe('runBenchmarkSuites', () => {
    let log: string[];

    beforeEach(() => {
        log = [];
        vi.spyOn(console, 'log').mockImplementation((...args) => {
            log.push(args.join(' '));
        });
        vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('runs all active suites by default', async () => {
        const runAlpha = vi.spyOn(suiteAlpha, 'runTests');
        const r = await runBenchmarkSuites();
        expect(r).toEqual({ hadFailures: true, numSuitesRun: 3 });
        expect(runAlpha).toHaveBeenCalledWith({ tests: undefined });
    });

    test('runs a suite given as an object', async () => {
        const r = await runBenchmarkSuites([suiteAlphabet]);
        expect(r).toEqual({ hadFailures: false, numSuitesRun: 1 });
    });

    test('runs suites whose name starts with the given name', async () => {
        const r = await runBenchmarkSuites(['ALPHA']);
        expect(r).toEqual({ hadFailures: false, numSuitesRun: 2 });
    });

    test('runs all suites for "all"', async () => {
        const r = await runBenchmarkSuites(['all']);
        expect(r).toEqual({ hadFailures: true, numSuitesRun: 3 });
    });

    test('a suite is run only once per pass', async () => {
        const runAlpha = vi.spyOn(suiteAlpha, 'runTests');
        await runBenchmarkSuites(['alpha', suiteAlpha, 'all']);
        expect(runAlpha).toHaveBeenCalledTimes(1);
    });

    test('an unknown name is a failure', async () => {
        const r = await runBenchmarkSuites(['alphabet', 'unknown']);
        expect(r).toEqual({ hadFailures: true, numSuitesRun: 1 });
        expect(log.join('\n')).toContain('Unknown test method: unknown');
    });

    test('the suites option skips suites that do not match', async () => {
        const r = await runBenchmarkSuites(undefined, { suites: ['BET'] });
        expect(r).toEqual({ hadFailures: false, numSuitesRun: 1 });
        const text = log.join('\n');
        expect(text).toContain('Skipping Perf Suite');
        expect(text).toContain('Running Perf Suite: alphabet');
    });

    test('passes the timeout and tests options to the suites', async () => {
        const setTimeout = vi.spyOn(suiteFails, 'setTimeout');
        const runTests = vi.spyOn(suiteFails, 'runTests');
        await runBenchmarkSuites([suiteFails], { timeout: 3, tests: ['throws'] });
        expect(setTimeout).toHaveBeenCalledWith(3);
        expect(runTests).toHaveBeenCalledWith({ tests: ['throws'] });
    });

    test('repeat runs the suites again', async () => {
        const runAlpha = vi.spyOn(suiteAlpha, 'runTests');
        const r = await runBenchmarkSuites([suiteAlpha], { repeat: 3 });
        expect(r).toEqual({ hadFailures: false, numSuitesRun: 1 });
        expect(runAlpha).toHaveBeenCalledTimes(3);
        const text = log.join('\n');
        expect(text).toContain('Repeating tests: 2 more times.');
        expect(text).toContain('Repeating tests: 1 more time.');
    });

    test('lists the available suites when none ran', async () => {
        const r = await runBenchmarkSuites(undefined, { suites: ['none match'], repeat: 2 });
        expect(r).toEqual({ hadFailures: true, numSuitesRun: 0 });
        const text = log.join('\n');
        expect(text).toContain('No suites to run.');
        expect(text).toContain('Available suites:');
        expect(text).toContain('The alpha suite');
        expect(text).not.toContain('Repeating tests');
    });
});
