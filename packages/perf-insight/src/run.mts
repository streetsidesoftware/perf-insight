import asTable from 'as-table';
import chalk from 'chalk';

import type { PerfSuite } from './perfSuite.mjs';
import { getActiveSuites } from './perfSuite.mjs';

export interface RunOptions {
    repeat?: number | undefined;
    timeout?: number | undefined;
    suites?: string[] | undefined;
    tests?: string[] | undefined;
}

export interface RunBenchmarkSuitesResult {
    hadFailures: boolean;
    numSuitesRun: number;
}

/**
 *
 * @param suiteNames
 * @param options
 */
export async function runBenchmarkSuites(
    suiteToRun?: (string | PerfSuite)[],
    options?: RunOptions,
): Promise<RunBenchmarkSuitesResult> {
    const suites = getActiveSuites();

    let numSuitesRun = 0;
    let showRepeatMsg = false;
    let hadErrors = false;

    for (let repeat = options?.repeat || 1; repeat > 0; repeat--) {
        if (showRepeatMsg) {
            console.log(chalk.yellow(`Repeating tests: ${repeat} more time${repeat > 1 ? 's' : ''}.`));
        }
        const r = await runTestSuites(suites, suiteToRun || suites, options || {});
        numSuitesRun = r.numSuitesRun;
        hadErrors ||= r.hadFailures;
        if (!numSuitesRun) break;
        showRepeatMsg = true;
    }

    if (!numSuitesRun) {
        console.log(chalk.red('No suites to run.'));
        console.log(chalk.yellow('Available suites:'));
        const width = process.stdout.columns || 80;
        const table = asTable.configure({ maxTotalWidth: width - 2 })(
            suites.map((suite) => ({ Suite: suite.name, Description: suite.description })),
        );
        console.log(
            table
                .split('\n')
                .map((line) => `  ${line}`)
                .join('\n'),
        );

        hadErrors = true;
    }

    return { hadFailures: hadErrors, numSuitesRun };
}

interface Result {
    hadFailures: boolean;
}

interface RunTestSuitesResults extends Result {
    numSuitesRun: number;
}

async function runTestSuites(
    suites: PerfSuite[],
    suitesToRun: (string | PerfSuite)[],
    options: RunOptions,
): Promise<RunTestSuitesResults> {
    const timeout = options.timeout || undefined;
    const suitesRun = new Set<PerfSuite>();
    let hadFailures = false;

    async function _runSuite(suites: PerfSuite[]): Promise<Result> {
        let hadFailures = false;
        for (const suite of suites) {
            if (suitesRun.has(suite)) continue;
            if (!filterSuite(suite)) {
                console.log(chalk.yellow(`Skipping Perf Suite: ${chalk.green(suite.name)} - not in filter.`));
                continue;
            }
            suitesRun.add(suite);
            console.log(chalk.green(`Running Perf Suite: ${suite.name}`));
            const result = await suite.setTimeout(timeout).runTests({ tests: options.tests });
            if (result.hadFailures) {
                hadFailures = true;
            }
        }

        return { hadFailures: hadFailures };
    }

    async function runSuite(name: string | PerfSuite): Promise<Result> {
        if (typeof name !== 'string') {
            return await _runSuite([name]);
        }

        if (name === 'all') {
            return await _runSuite(suites);
        }
        const matching = suites.filter((suite) => suite.name.toLowerCase().startsWith(name.toLowerCase()));
        if (!matching.length) {
            console.log(chalk.red(`Unknown test method: ${name}`));
            return { hadFailures: true };
        }
        return await _runSuite(matching);
    }

    for (const name of suitesToRun) {
        hadFailures ||= (await runSuite(name)).hadFailures;
    }

    return { hadFailures, numSuitesRun: suitesRun.size };

    function filterSuite(suite: PerfSuite): boolean {
        const { suites } = options;
        if (!suites?.length) return true;
        return suites.some((name) => suite.name.toLowerCase().includes(name.toLowerCase()));
    }
}
