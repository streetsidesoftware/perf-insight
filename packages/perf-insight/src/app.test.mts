import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';

import { Command, CommanderError } from 'commander';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { run } from './app.mjs';

const { fork } = vi.hoisted(() => ({ fork: vi.fn() }));

vi.mock('node:child_process', () => ({ fork }));

const examplesDir = fileURLToPath(new URL('../../../examples/', import.meta.url));

describe('app', () => {
    let cwd: string;
    let errors: string[];
    let logs: string[];

    beforeEach(() => {
        cwd = process.cwd();
        process.chdir(examplesDir);
        errors = [];
        logs = [];
        vi.spyOn(console, 'error').mockImplementation((...args) => {
            errors.push(args.join(' '));
        });
        vi.spyOn(console, 'log').mockImplementation((...args) => {
            logs.push(args.join(' '));
        });
        fork.mockImplementation(() => fakeChild({ exitCode: 0 }));
    });

    afterEach(() => {
        process.chdir(cwd);
        process.exitCode = undefined;
        vi.restoreAllMocks();
        fork.mockReset();
    });

    test.each`
        args
        ${'--help'}
    `('run error $args', async ({ args }) => {
        const argv = genArgv(args);
        const program = new Command();
        program.exitOverride((e) => {
            throw e;
        });
        const output = {
            writeOut: vi.fn(),
            writeErr: vi.fn(),
            outputError: vi.fn(),
        };
        program.configureOutput(output);
        await expect(run(argv, program)).rejects.toBeInstanceOf(CommanderError);
        expect(output.outputError).not.toHaveBeenCalled();
        expect(output.writeOut).toHaveBeenCalled();
        expect(output.writeErr).not.toHaveBeenCalled();
    });

    test('shows help when there is nothing to run', async () => {
        const { program, output } = createProgram();
        await expect(run(genArgv([]), program)).rejects.toBeInstanceOf(CommanderError);
        expect(errors.join('\n')).toContain('No tests to run.');
        expect(output.writeOut).toHaveBeenCalled();
        expect(fork).not.toHaveBeenCalled();
    });

    test('reports when no perf files are found', async () => {
        const { program } = createProgram();
        await run(genArgv(['--file', 'no-such-dir/*.perf.mts']), program);
        expect(errors.join('\n')).toContain('No perf files found.');
        expect(fork).not.toHaveBeenCalled();
    });

    test('runs the perf files matching the filter', async () => {
        const { program } = createProgram();
        await run(genArgv(['fail']), program);
        expect(fork).toHaveBeenCalledTimes(1);
        expect(fork).toHaveBeenCalledWith(
            expect.stringMatching(/runBenchmarkCli\.mjs$/),
            ['src/fail.perf.mts', '--repeat', '1'],
            expect.objectContaining({ stdio: 'inherit' }),
        );
        expect(process.exitCode).toBeUndefined();
        expect(logs.join('\n')).toContain('done.');
    });

    test('passes the options on to the runner', async () => {
        const { program } = createProgram();
        const args = ['fail', '-t', '50', '--repeat', '2', '-s', 'a', '-s', 'b', '-T', 'c', '--register', 'r'];
        await run(genArgv(args), program);
        expect(fork.mock.calls[0][1]).toEqual([
            'src/fail.perf.mts',
            '--repeat',
            '2',
            '--timeout',
            '50',
            '--suite',
            'a',
            '--suite',
            'b',
            '--test',
            'c',
            '--register',
            'r',
        ]);
    });

    test('runs every file with --all and --exclude', async () => {
        const { program } = createProgram();
        await run(genArgv(['--all', '--exclude', '**/measure*', '--exclude', '**/trie*']), program);
        const files = fork.mock.calls.map((call) => call[1][0]).sort();
        expect(files).toEqual(['src/exampleMap.perf.mts', 'src/fail.perf.mts']);
    });

    test('a failing runner sets the exit code and the rest still run', async () => {
        fork.mockImplementation(() => fakeChild({ exitCode: 2 }));
        const { program } = createProgram();
        await run(genArgv(['--all']), program);
        expect(fork.mock.calls.length).toBeGreaterThan(1);
        expect(process.exitCode).toBe(2);
        expect(logs.join('\n')).toContain('failed.');
    });

    test('--fail-fast stops after the first failure', async () => {
        fork.mockImplementation(() => fakeChild({ exitCode: 1 }));
        const { program } = createProgram();
        await run(genArgv(['--all', '--fail-fast']), program);
        expect(fork).toHaveBeenCalledTimes(1);
        expect(process.exitCode).toBe(1);
    });

    test('a runner that fails to spawn is reported', async () => {
        fork.mockImplementation(() => fakeChild({ error: new Error('spawn failed') }));
        const { program } = createProgram();
        await run(genArgv(['fail']), program);
        expect(errors.join('\n')).toContain('Failed to spawn runner.');
        expect(fork.mock.results[0].value.disconnect).toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });
});

function genArgv(args: string | string[]): string[] {
    args = typeof args === 'string' ? [args] : args;
    const argv: string[] = [process.argv[0], 'bin.mjs', ...args];
    return argv;
}

function createProgram() {
    const program = new Command();
    program.exitOverride((e) => {
        throw e;
    });
    const output = {
        writeOut: vi.fn(),
        writeErr: vi.fn(),
        outputError: vi.fn(),
    };
    program.configureOutput(output);
    return { program, output };
}

interface FakeChildOptions {
    exitCode?: number;
    error?: Error;
}

/**
 * Stands in for a forked runner. It emits `error` and/or `exit` on the next tick,
 * after the caller has attached its listeners.
 */
function fakeChild({ exitCode, error }: FakeChildOptions) {
    const child = Object.assign(new EventEmitter(), {
        connected: true,
        disconnect: vi.fn(() => {
            child.connected = false;
        }),
    });
    setImmediate(() => {
        if (error) child.emit('error', error);
        child.emit('exit', exitCode ?? null, null);
    });
    return child;
}
