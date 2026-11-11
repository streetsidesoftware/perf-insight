import type { DenoRuntime } from './runtimeCheck.mjs';
import { runtimeProblem } from './runtimeCheck.mjs';

/**
 * The CLI entry point.
 * It checks the runtime before loading the app, because loading the app under Deno without permissions crashes.
 * @param deno - the `Deno` global, `undefined` outside Deno.
 */
export async function main(deno = (globalThis as { Deno?: DenoRuntime }).Deno): Promise<void> {
    const problem = runtimeProblem(deno);
    if (problem) {
        console.error(problem);
        process.exitCode = 1;
        return;
    }

    const { run } = await import('./app.mjs');
    await run();
}
