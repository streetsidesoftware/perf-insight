import { afterEach, describe, expect, test, vi } from 'vitest';

import { main } from './main.mjs';
import type { DenoRuntime } from './runtimeCheck.mjs';
import { denoPermissionMessage } from './runtimeCheck.mjs';

const { run } = vi.hoisted(() => ({ run: vi.fn() }));

vi.mock('./app.mjs', () => ({ run }));

describe('main', () => {
    afterEach(() => {
        process.exitCode = undefined;
        vi.restoreAllMocks();
        run.mockReset();
    });

    test('runs the app outside Deno', async () => {
        await main(undefined);
        expect(run).toHaveBeenCalledOnce();
        expect(process.exitCode).toBeUndefined();
    });

    test('stops before loading the app when Deno lacks a permission', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        await main(denoWithoutPermissions());
        expect(error).toHaveBeenCalledWith(denoPermissionMessage);
        expect(run).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });
});

function denoWithoutPermissions(): DenoRuntime {
    return { permissions: { querySync: () => ({ state: 'prompt' }) } };
}
