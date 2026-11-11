import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Vitest 4+ no longer excludes `dist` by default, so limit the run to the sources.
        include: ['src/**/*.test.mts'],
        coverage: {
            include: ['src/**/*.mts'],
            exclude: ['**/*.test.*'],
            // CI uploads coverage/lcov.info.
            reporter: ['html', 'text', 'lcov', 'json'],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80,
            },
        },
    },
});
