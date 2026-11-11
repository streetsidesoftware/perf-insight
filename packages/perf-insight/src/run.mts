import type { PerfSuite, RunTestsOptions } from './perfSuite.mjs';
import { getActiveSuites } from './perfSuite.mjs';
import { stoppedAfterFailure } from './stoppedAfterFailure.mjs';
import { formatTable, green, red, yellow } from './util/index.mjs';

export interface RunOptions {
    repeat?: number | undefined;
    timeout?: number | undefined;
    suites?: string[] | undefined;
    tests?: string[] | undefined;
    /**
     * Stop at the first failing test, suite or repeat.
     */
    failFast?: boolean | undefined;
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
            console.log(yellow(`Repeating tests: ${repeat} more time${repeat > 1 ? 's' : ''}.`));
        }
        const r = await runTestSuites(suites, suiteToRun || suites, options || {});
        numSuitesRun = r.numSuitesRun;
        hadErrors ||= r.hadFailures;
        if (!numSuitesRun) break;
        if (r.hadFailures && options?.failFast) {
            const notRun = repeat - 1;
            if (notRun) console.log(yellow(stoppedAfterFailure(notRun, 'repeat')));
            break;
        }
        showRepeatMsg = true;
    }

    if (!numSuitesRun) {
        console.log(red('No suites to run.'));
        console.log(yellow('Available suites:'));
        const width = process.stdout.columns || 80;
        const tableLines = formatTable(
            ['Suite', 'Description'],
            suites.map((suite) => [suite.name, suite.description]),
            width - 2,
        );
        console.log(tableLines.map((line) => `  ${line}`).join('\n'));

        hadErrors = true;
    }

    return { hadFailures: hadErrors, numSuitesRun };
}

interface RunTestSuitesResults {
    hadFailures: boolean;
    numSuitesRun: number;
}

/**
 * One step of a run, in the order the steps happen.
 */
type PlanStep =
    { kind: 'run'; suite: PerfSuite } | { kind: 'filtered'; suite: PerfSuite } | { kind: 'unknown'; name: string };

async function runTestSuites(
    suites: PerfSuite[],
    suitesToRun: (string | PerfSuite)[],
    options: RunOptions,
): Promise<RunTestSuitesResults> {
    const timeout = options.timeout || undefined;
    const plan = planRun(suites, suitesToRun, options.suites);
    let hadFailures = false;
    let numSuitesRun = 0;

    for (const [index, step] of plan.entries()) {
        const failed = await runStep(step);
        hadFailures ||= failed;
        if (failed && options.failFast) {
            const notRun = plan.slice(index + 1).filter((s) => s.kind === 'run').length;
            if (notRun) console.log(yellow(stoppedAfterFailure(notRun, 'suite')));
            break;
        }
    }

    return { hadFailures, numSuitesRun };

    async function runStep(step: PlanStep): Promise<boolean> {
        switch (step.kind) {
            case 'filtered':
                console.log(yellow('Skipping Perf Suite: ') + green(step.suite.name) + yellow(' - not in filter.'));
                return false;
            case 'unknown':
                console.log(red(`Unknown test method: ${step.name}`));
                return true;
            case 'run': {
                console.log(green(`Running Perf Suite: ${step.suite.name}`));
                ++numSuitesRun;
                const runOptions: RunTestsOptions = { tests: options.tests, failFast: options.failFast };
                const result = await step.suite.setTimeout(timeout).runTests(runOptions);
                return result.hadFailures;
            }
        }
    }
}

/**
 * Resolves the requested suites into the steps of a run. Each suite appears at most once.
 * @param suites - all active suites.
 * @param suitesToRun - suites, suite name prefixes, or `all`.
 * @param filter - when not empty, only suites whose name contains one of these run.
 */
function planRun(suites: PerfSuite[], suitesToRun: (string | PerfSuite)[], filter: string[] | undefined): PlanStep[] {
    const seen = new Set<PerfSuite>();
    const plan: PlanStep[] = [];

    for (const name of suitesToRun) {
        const matching = resolve(name);
        if (!matching.length) {
            plan.push({ kind: 'unknown', name: name as string });
            continue;
        }
        for (const suite of matching) {
            if (seen.has(suite)) continue;
            seen.add(suite);
            plan.push({ kind: inFilter(suite) ? 'run' : 'filtered', suite });
        }
    }

    return plan;

    function resolve(name: string | PerfSuite): PerfSuite[] {
        if (typeof name !== 'string') return [name];
        if (name === 'all') return suites;
        return suites.filter((suite) => suite.name.toLowerCase().startsWith(name.toLowerCase()));
    }

    function inFilter(suite: PerfSuite): boolean {
        if (!filter?.length) return true;
        return filter.some((name) => suite.name.toLowerCase().includes(name.toLowerCase()));
    }
}
