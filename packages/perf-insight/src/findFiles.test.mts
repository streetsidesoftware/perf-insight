import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { findFiles } from './findFiles.mjs';

// The tests own this tree, so adding an example to the docs can't change their results.
const fixtureDir = fileURLToPath(new URL('../fixtures/find-files/', import.meta.url));

describe('findFiles', () => {
    test('finds files relative to cwd', async () => {
        const files = await findFiles(['src/*.perf.mts'], { cwd: fixtureDir });
        expect(files.sort()).toEqual(['src/alpha.perf.mts', 'src/beta.perf.mts']);
    });

    test('ignores blank globs and trims the rest', async () => {
        const files = await findFiles([' src/alpha.perf.mts ', '', '  '], { cwd: fixtureDir });
        expect(files).toEqual(['src/alpha.perf.mts']);
    });

    test('applies excludes', async () => {
        const files = await findFiles(['**/*.perf.mts'], { cwd: fixtureDir, excludes: ['**/beta.*'] });
        expect(files.sort()).toEqual(['other/gamma.perf.mts', 'src/alpha.perf.mts']);
    });

    test('excludes node_modules by default', async () => {
        // git ignores node_modules, so the tree is built at test time.
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'perf-insight-find-'));
        try {
            await fs.mkdir(path.join(dir, 'node_modules/pkg'), { recursive: true });
            await fs.writeFile(path.join(dir, 'node_modules/pkg/dep.perf.mts'), '');
            await fs.writeFile(path.join(dir, 'own.perf.mts'), '');

            expect(await findFiles(['**/*.perf.mts'], { cwd: dir })).toEqual(['own.perf.mts']);
            const all = await findFiles(['**/*.perf.mts'], { cwd: dir, excludes: [] });
            expect(all.sort()).toEqual(['node_modules/pkg/dep.perf.mts', 'own.perf.mts']);
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });

    test('can include directories', async () => {
        const files = await findFiles(['src/*'], { cwd: fixtureDir, onlyFiles: false });
        expect(files.sort()).toEqual(['src/alpha.perf.mts', 'src/beta.perf.mts', 'src/lib']);
    });

    test('defaults to the current directory', async () => {
        const files = await findFiles(['package.json']);
        expect(files).toEqual(['package.json']);
    });
});
