import { stripVTControlCharacters } from 'node:util';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getActiveSuites, runSuite, suite } from './perfSuite.mjs';

const shortTimeout = 5;

describe('perfSuite', () => {
    let output: string[];

    beforeEach(() => {
        output = [];
        vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
            output.push(String(chunk));
            return true;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    test('suite registers itself as an active suite', () => {
        const s = suite('registered', () => undefined);
        expect(s.name).toBe('registered');
        expect(s.description).toBeUndefined();
        expect(getActiveSuites()).toContain(s);
    });

    test('suite with a description', () => {
        const s = suite('described', 'A description', () => undefined);
        expect(s.description).toBe('A description');
    });

    test('suite requires a function', () => {
        // @ts-expect-error missing suiteFn
        expect(() => suite('no fn', 'description')).toThrow('suiteFn must be a function');
    });

    test('runSuite with a suite', async () => {
        const s = suite('runSuite object', (test) => {
            test('noop', () => undefined, shortTimeout);
        });
        const r = await runSuite(s);
        expect(r).toEqual(
            expect.objectContaining({ name: 'runSuite object', description: undefined, hadFailures: false }),
        );
        expect(r.results.map((r) => r.name)).toEqual(['noop']);
        expect(r.results[0].iterations).toBeGreaterThan(0);
        expect(output.join('')).toContain('✔ noop');
    });

    test('runSuite with a name and a function', async () => {
        const r = await runSuite('runSuite name', (test) => {
            test('noop', () => undefined, shortTimeout);
        });
        expect(r.name).toBe('runSuite name');
        expect(r.hadFailures).toBe(false);
    });

    test('runSuite with a name, description and function', async () => {
        const r = await runSuite('runSuite desc', 'The description', (test) => {
            test('noop', () => undefined, shortTimeout);
        });
        expect(r.description).toBe('The description');
        expect(output.join('')).toContain('The description\n');
    });

    test('runSuite requires a function', () => {
        // @ts-expect-error missing suiteFn
        expect(() => runSuite('no fn', 'description')).toThrow('suiteFn must be a function');
    });

    test('hooks run in order', async () => {
        const calls: string[] = [];
        const r = await runSuite('hooks', (test) => {
            test.beforeAll(() => {
                calls.push('beforeAll');
            });
            test.afterAll(async () => {
                calls.push('afterAll');
            });
            test.beforeEach(() => {
                calls.push('beforeEach');
            });
            test.afterEach(() => {
                calls.push('afterEach');
            });
            test(
                'once',
                () => {
                    calls.push('test');
                },
                shortTimeout,
            );
        });
        expect(r.hadFailures).toBe(false);
        expect(calls[0]).toBe('beforeAll');
        expect(calls.slice(1, 4)).toEqual(['beforeEach', 'test', 'afterEach']);
        expect(calls.at(-1)).toBe('afterAll');
        const iterations = r.results[0].iterations;
        expect(calls.filter((c) => c === 'test')).toHaveLength(iterations);
    });

    test('prepare runs once and passes data to its tests', async () => {
        const prepareFn = vi.fn(async () => ({ value: 42 }));
        const seen = new Set<number>();
        const r = await runSuite('prepare', (_test, context) => {
            const prepared = context.prepare(prepareFn);
            prepared.test('first', (data) => seen.add(data.value), shortTimeout);
            prepared.test('second', (data) => seen.add(data.value), shortTimeout);
        });
        expect(r.hadFailures).toBe(false);
        expect(prepareFn).toHaveBeenCalledTimes(1);
        expect([...seen]).toEqual([42]);
    });

    test('a failing prepare reports an error', async () => {
        const r = await runSuite('prepare fails', (test) => {
            test.prepare(() => Promise.reject('bad data')).test('uses data', () => undefined, shortTimeout);
        });
        expect(r.hadFailures).toBe(true);
        expect(r.results[0].error).toEqual(new Error('bad data'));
        expect(r.results[0].iterations).toBe(0);
    });

    test('a throwing test reports an error', async () => {
        const r = await runSuite('fails', (test) => {
            test('ok', () => undefined, shortTimeout);
            test(
                'throws',
                () => {
                    throw new Error('boom');
                },
                shortTimeout,
            );
        });
        expect(r.hadFailures).toBe(true);
        expect(r.results.map((r) => r.error?.message)).toEqual([undefined, 'boom']);
        const text = output.join('');
        expect(text).toContain('✔ ok');
        expect(text).toContain('X throws');
        expect(text).toContain('Error: Error: boom');
    });

    test('a non-Error throw is wrapped in an Error', async () => {
        const r = await runSuite('throws string', (test) => {
            test(
                'throws',
                () => {
                    throw 'not an error';
                },
                shortTimeout,
            );
        });
        expect(r.results[0].error).toEqual(new Error('not an error'));
    });

    test('filter tests by name, ignoring case', async () => {
        const s = suite('filter', (test) => {
            test('Alpha', () => undefined, shortTimeout);
            test('beta', () => undefined, shortTimeout);
            test('alphabet', () => undefined, shortTimeout);
        });
        const r = await s.runTests({ tests: ['ALPHA'] });
        expect(r.results.map((r) => r.name)).toEqual(['Alpha', 'alphabet']);
    });

    test('suite setTimeout sets the default test timeout', async () => {
        let contextTimeout = 0;
        const s = suite('suite timeout', (test, context) => {
            contextTimeout = context.timeout;
            test('noop', () => undefined);
        }).setTimeout(shortTimeout);
        // undefined keeps the current timeout.
        s.setTimeout(undefined);
        const r = await s.runTests({});
        expect(contextTimeout).toBe(shortTimeout);
        expect(r.results[0].timeout).toBe(shortTimeout);
    });

    test('context setTimeout overrides the suite timeout', async () => {
        const r = await runSuite('context timeout', (test) => {
            test.setTimeout(shortTimeout + 1);
            test('noop', () => undefined);
            test('explicit', () => undefined, shortTimeout);
        });
        expect(r.results.map((r) => r.timeout)).toEqual([shortTimeout + 1, shortTimeout]);
    });

    test('long tests report progress and collect statistics', async () => {
        const r = await runSuite('long', (test) => {
            test('wait', () => new Promise((resolve) => setTimeout(resolve, 2)), 150);
        });
        const result = r.results[0];
        expect(result.error).toBeUndefined();
        expect(result.iterationCallbacks).toBeGreaterThan(0);
        expect(result.sd.count).toBeGreaterThan(0);
        expect(result.duration).toBeGreaterThan(0);
        expect(result.overhead).toBeGreaterThanOrEqual(0);
    });

    test('uses a spinner when stdout is a TTY', async () => {
        const isTTY = process.stdout.isTTY;
        process.stdout.isTTY = true;
        // ora only spins in an interactive terminal: not in CI and not with TERM=dumb.
        vi.stubEnv('CI', undefined);
        vi.stubEnv('TERM', 'xterm');
        try {
            const r = await runSuite('tty', (test) => {
                test('ok', () => undefined, shortTimeout);
                test(
                    'throws',
                    () => {
                        throw new Error('boom');
                    },
                    shortTimeout,
                );
            });
            expect(r.hadFailures).toBe(true);
        } finally {
            process.stdout.isTTY = isTTY;
        }
        // The spinner colors its symbols when the terminal supports color.
        const text = stripVTControlCharacters(output.join(''));
        expect(text).toContain('✔ ok');
        // The spinner marks failures with ✖; plain output uses X.
        expect(text).toContain('✖ throws');
        expect(text).not.toContain('X throws');
    });
});
