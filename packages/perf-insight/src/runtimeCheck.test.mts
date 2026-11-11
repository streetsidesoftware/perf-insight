import { describe, expect, test } from 'vitest';

import type { DenoRuntime } from './runtimeCheck.mjs';
import { denoPermissionMessage, runtimeProblem } from './runtimeCheck.mjs';

describe('runtimeProblem', () => {
    test('outside Deno', () => {
        expect(runtimeProblem(undefined)).toBeUndefined();
    });

    test('Deno with all permissions', () => {
        expect(runtimeProblem(fakeDeno([]))).toBeUndefined();
    });

    test.each(['read', 'env', 'run', 'sys'])('Deno without %s', (name) => {
        expect(runtimeProblem(fakeDeno([name]))).toBe(denoPermissionMessage);
    });
});

/**
 * @param notGranted - permissions that report the `prompt` state, as Deno does when a permission is not granted.
 */
function fakeDeno(notGranted: string[]): DenoRuntime {
    return {
        permissions: {
            querySync: ({ name }) => ({ state: notGranted.includes(name) ? 'prompt' : 'granted' }),
        },
    };
}
