import { afterEach, describe, expect, test, vi } from 'vitest';

import { green, red, yellow } from './color.mjs';

describe('color', () => {
    const isTTY = process.stdout.isTTY;

    afterEach(() => {
        process.stdout.isTTY = isTTY;
        vi.unstubAllEnvs();
    });

    test.each`
        name        | fn        | code
        ${'red'}    | ${red}    | ${31}
        ${'green'}  | ${green}  | ${32}
        ${'yellow'} | ${yellow} | ${33}
    `('$name colors text when stdout is a terminal', ({ fn, code }) => {
        process.stdout.isTTY = true;
        // Without this, whether a terminal gets color depends on the machine running the test.
        vi.stubEnv('FORCE_COLOR', '1');
        expect(fn('text')).toBe(`\u001b[${code}m` + 'text' + '\u001b[39m');
    });

    test.each([red, green, yellow])('%o leaves text as it is when stdout is not a terminal', (fn) => {
        process.stdout.isTTY = false;
        expect(fn('text')).toBe('text');
    });

    test('FORCE_COLOR does not color output that is not a terminal', () => {
        process.stdout.isTTY = false;
        vi.stubEnv('FORCE_COLOR', '1');
        expect(red('text')).toBe('text');
    });
});
