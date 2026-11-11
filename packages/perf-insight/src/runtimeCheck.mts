// This file runs before the app loads, so it must not import modules that need permissions under Deno, such as chalk.

const requiredDenoPermissions = ['read', 'env', 'run', 'sys'] as const;

type DenoPermissionName = (typeof requiredDenoPermissions)[number];

/**
 * The part of the `Deno` global that the permission check uses.
 */
export interface DenoRuntime {
    permissions: {
        querySync(descriptor: { name: DenoPermissionName }): { state: string };
    };
}

export const denoPermissionMessage =
    'perf-insight needs the Deno permissions --allow-read, --allow-env, --allow-run and --allow-sys (or -A).';

/**
 * Checks that perf-insight can run in the current runtime.
 * @param deno - the `Deno` global, `undefined` outside Deno.
 * @returns a message describing the problem, or `undefined` when there is none.
 */
export function runtimeProblem(deno: DenoRuntime | undefined): string | undefined {
    if (deno && !hasDenoPermissions(deno)) return denoPermissionMessage;
    return undefined;
}

/**
 * Deno reports a scoped grant, such as `--allow-env=HOME`, as not granted.
 * perf-insight needs full grants: chalk reads many variables, and the forked runner reads the user's files.
 */
function hasDenoPermissions(deno: DenoRuntime): boolean {
    return requiredDenoPermissions.every((name) => deno.permissions.querySync({ name }).state === 'granted');
}
