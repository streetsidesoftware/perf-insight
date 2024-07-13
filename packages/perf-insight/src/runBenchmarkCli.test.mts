import { describe, expect, test } from 'vitest';

import { run } from './runBenchmarkCli.mjs';

describe('runBenchmarkCli', () => {
    test.each`
        file                         | args                    | root
        ${'src/exampleMap.perf.mts'} | ${'--suite map -t 500'} | ${'../../../examples/'}
    `('runBenchmarkCli $file $args', async ({ file, args, root }) => {
        expect(run).toBeTypeOf('function');

        args = typeof args === 'string' ? args.split(/\s+/g) : args;
        const r = new URL(root, import.meta.url).href;
        const fileUrl = new URL(file, r).href;

        await expect(run([fileUrl, '--root', r, ...args])).resolves.toEqual({
            error: undefined,
            hadFailures: true,
        });
    });
});
