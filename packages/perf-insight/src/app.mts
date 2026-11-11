import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { Argument, Command, program as defaultCommand } from 'commander';

import { findFiles } from './findFiles.mjs';
import { stoppedAfterFailure } from './stoppedAfterFailure.mjs';
import { green, red, yellow } from './util/index.mjs';

interface AppOptions {
    repeat?: number;
    timeout?: number;
    all?: boolean;
    file?: string[];
    exclude?: string[];
    suite?: string[];
    test?: string[];
    failFast?: boolean;
}

const urlRunnerCli = new URL('./runBenchmarkCli.mjs', import.meta.url).toString();
const pathToRunnerCliModule = fileURLToPath(urlRunnerCli);

export async function app(program = defaultCommand): Promise<Command> {
    const argument = new Argument('[filter...]', 'Perf file filter.');
    argument.variadic = true;

    program
        .name('perf-insight')
        .addArgument(argument)
        .description('Benchmark performance suites found in `**/*.perf.{js,cjs,mjs,ts,mts}`.')
        .option('-a, --all', 'Run all perf files.', false)
        .option('-f, --file <glob...>', 'Globs to search for perf files.', appendValue)
        .option('-x, --exclude <glob...>', 'Globs to exclude from search.', appendValue)
        .option('-t, --timeout <timeout>', 'Override the timeout for each test suite.', (v) => Number(v))
        .option('-s, --suite <suite...>', 'Run only matching suites.', appendValue)
        .option('-T, --test <test...>', 'Run only matching test found in suites', appendValue)
        .option('--fail-fast', 'Stop on first failure.', false)
        .option('--repeat <count>', 'Repeat the tests.', (v) => Number(v), 1)
        .action(async (suiteNamesToRun: string[], options: AppOptions, command: Command) => {
            if (!suiteNamesToRun.length && !(options.all || options.file?.length)) {
                console.error(red('No tests to run.'));
                console.error(yellow('Use ') + green('--all') + yellow(' to run all tests.\n'));
                command.help();
            }

            // console.log('%o', options);
            const fileGlobs = options.file?.length ? options.file : ['**/*.perf.{js,mjs,cjs,ts,mts}'];
            const excludes = options.exclude?.length ? options.exclude : [];

            const found = await findFiles([...fileGlobs, '!**/node_modules/**'], { excludes });

            if (!found.length) {
                console.error(red('No perf files found.'));
                return;
            }

            const files = found.filter(
                (file) =>
                    !suiteNamesToRun.length ||
                    suiteNamesToRun.some((name) => file.toLowerCase().includes(name.toLowerCase())),
            );

            await spawnRunners(files, options);

            return console.log(process.exitCode ? red('failed.') : green('done.'));
        });

    program.showHelpAfterError();
    return program;
}

const defaultAbortTimeout = 1000 * 60 * 5; // 5 minutes

async function spawnRunners(files: string[], options: AppOptions): Promise<void> {
    const cliOptions: string[] = [];

    if (options.repeat) {
        cliOptions.push('--repeat', options.repeat.toString());
    }

    if (options.timeout) {
        cliOptions.push('--timeout', options.timeout.toString());
    }

    if (options.suite?.length) {
        cliOptions.push(...options.suite.flatMap((s) => ['--suite', s]));
    }

    if (options.test?.length) {
        cliOptions.push(...options.test.flatMap((t) => ['--test', t]));
    }

    if (options.failFast) {
        cliOptions.push('--fail-fast');
    }

    for (const [index, file] of files.entries()) {
        const failed = await runFile(file, cliOptions);
        if (failed && options.failFast) {
            const notRun = files.length - index - 1;
            if (notRun) console.log(yellow(stoppedAfterFailure(notRun, 'file')));
            break;
        }
    }
}

/**
 * Runs one perf file in its own process.
 * @returns true if the runner failed or could not be started.
 */
async function runFile(file: string, cliOptions: string[]): Promise<boolean> {
    try {
        const code = await spawnRunner([file, ...cliOptions]);
        if (!code) return false;
        process.exitCode ??= code;
    } catch (e) {
        console.error('Failed to spawn runner.', e);
        process.exitCode ??= 1;
    }
    return true;
}

function spawnRunner(args: string[]): Promise<number | undefined> {
    const ac = new AbortController();
    const process = fork(pathToRunnerCliModule, args, { stdio: 'inherit', signal: ac.signal });
    // Started only once there is a runner to abort: a timer left pending after `fork` throws keeps this process alive.
    const timeout = setTimeout(() => ac.abort(), defaultAbortTimeout);

    return new Promise((resolve, reject) => {
        let completed = false;
        let error: Error | undefined = undefined;
        let exitCode: number | undefined = undefined;

        function complete() {
            if (completed) return;
            clearTimeout(timeout);
            completed = true;
            if (process.connected) process.disconnect();
            return error ? reject(error) : resolve(exitCode);
        }

        process.on('error', (err) => {
            error = err;
            console.error('Runner error: %o', err);
            complete();
        });

        process.on('exit', (code, _signal) => {
            exitCode = code ?? undefined;
            complete();
        });
    });
}

export async function run(argv?: string[], program?: Command): Promise<void> {
    const prog = await app(program);
    await prog.parseAsync(argv);
}

function appendValue(v: string, prev: string[] | undefined): string[] {
    if (!prev) return [v];
    return [...prev, v];
}
