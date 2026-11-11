import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { findFiles } from './findFiles.mjs';

const examplesDir = fileURLToPath(new URL('../../../examples/', import.meta.url));

describe('findFiles', () => {
    test('finds files relative to cwd', async () => {
        const files = await findFiles(['src/*.perf.mts'], { cwd: examplesDir });
        expect(files).toContain('src/exampleMap.perf.mts');
        expect(files).toContain('src/fail.perf.mts');
    });

    test('ignores blank globs and trims the rest', async () => {
        const files = await findFiles([' src/fail.perf.mts ', '', '  '], { cwd: examplesDir });
        expect(files).toEqual(['src/fail.perf.mts']);
    });

    test('applies excludes', async () => {
        const files = await findFiles(['src/*.perf.mts'], { cwd: examplesDir, excludes: ['**/fail.*'] });
        expect(files).toContain('src/exampleMap.perf.mts');
        expect(files).not.toContain('src/fail.perf.mts');
    });

    test('excludes node_modules by default', async () => {
        const files = await findFiles(['node_modules/perf-insight/package.json'], { cwd: examplesDir });
        expect(files).toEqual([]);
    });

    test('can include directories', async () => {
        const files = await findFiles(['src/l*'], { cwd: examplesDir, onlyFiles: false });
        expect(files).toEqual(['src/lib']);
    });

    test('defaults to the current directory', async () => {
        const files = await findFiles(['package.json']);
        expect(files).toEqual(['package.json']);
    });
});
