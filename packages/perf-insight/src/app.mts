import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';
import { Argument, Command, program as defaultCommand } from 'commander';

import { findFiles } from './findFiles.mjs';

interface AppOptions {
    repeat?: number;
    timeout?: number;
    all?: boolean;
    file?: string[];
    exclude?: string[];
    suite?: string[];
    test?: string[];
    register?: string[];
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
        .description('Benchmark performance suites found in `**/*.perf.{js,cjs,mjs}`.')
        .option('-a, --all', 'Run all perf files.', false)
        .option('-f, --file <glob...>', 'Globs to search for perf files.', appendValue)
        .option('-x, --exclude <glob...>', 'Globs to exclude from search.', appendValue)
        .option('-t, --timeout <timeout>', 'Override the timeout for each test suite.', (v) => Number(v))
        .option('-s, --suite <suite...>', 'Run only matching suites.', appendValue)
        .option('-T, --test <test...>', 'Run only matching test found in suites', appendValue)
        .option('--fail-fast', 'Stop on first failure.', false)
        .option('--repeat <count>', 'Repeat the tests.', (v) => Number(v), 1)
        .option('--register <loader>', 'Register a module loader. (e.g. ts-node/esm)', appendValue)
        .action(async (suiteNamesToRun: string[], options: AppOptions, command: Command) => {
            if (!suiteNamesToRun.length && !(options.all || options.file?.length)) {
                console.error(chalk.red('No tests to run.'));
                console.error(chalk.yellow(`Use ${chalk.green('--all')} to run all tests.\n`));
                command.help();
            }

            // console.log('%o', options);
            const fileGlobs = options.file?.length ? options.file : ['**/*.perf.{js,mjs,cjs}'];
            const excludes = options.exclude?.length ? options.exclude : [];

            const found = await findFiles([...fileGlobs, '!**/node_modules/**'], { excludes });

            if (!found.length) {
                console.error(chalk.red('No perf files found.'));
                return;
            }

            const files = found.filter(
                (file) =>
                    !suiteNamesToRun.length ||
                    suiteNamesToRun.some((name) => file.toLowerCase().includes(name.toLowerCase())),
            );

            await spawnRunners(files, options);

            process.exitCode ? console.log(chalk.red('failed.')) : console.log(chalk.green('done.'));
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

    if (options.register?.length) {
        cliOptions.push(...options.register.flatMap((r) => ['--register', r]));
    }

    for (const file of files) {
        try {
            const code = await spawnRunner([file, ...cliOptions]);
            if (code) {
                // console.error('Runner failed with "%s" code: %d', file, code);
                process.exitCode ??= code;
                if (options.failFast) {
                    break;
                }
            }
        } catch (e) {
            console.error('Failed to spawn runner.', e);
            process.exitCode ??= 1;
        }
    }
}

function spawnRunner(args: string[]): Promise<number | undefined> {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), defaultAbortTimeout);
    const process = fork(pathToRunnerCliModule, args, { stdio: 'inherit', signal: ac.signal });

    return new Promise((resolve, reject) => {
        let completed = false;
        let error: Error | undefined = undefined;
        let exitCode: number | undefined = undefined;

        function complete() {
            if (completed) return;
            clearTimeout(timeout);
            completed = true;
            process.connected && process.disconnect();
            error ? reject(error) : resolve(exitCode);
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
