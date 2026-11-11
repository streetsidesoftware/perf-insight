import { PassThrough } from 'node:stream';
import { stripVTControlCharacters } from 'node:util';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createSpinner } from './spinner.mjs';

const eraseLine = '\r\x1b[2K';

describe('spinner', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['performance'] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('start erases the line and draws the first frame with the text', () => {
        const terminal = createTerminal(80);
        const spinner = createSpinner(terminal.stream);
        expect(spinner.isSpinning).toBe(false);

        spinner.start('lookup');

        expect(spinner.isSpinning).toBe(true);
        expect(terminal.written()[0].startsWith(eraseLine)).toBe(true);
        expect(terminal.text()).toEqual(['\r⠋ lookup']);
    });

    test('render draws the next frame once the current one has shown for 80 ms', () => {
        const terminal = createTerminal(80);
        const spinner = createSpinner(terminal.stream);
        spinner.start('lookup');

        vi.advanceTimersByTime(79);
        spinner.render();
        expect(terminal.text()).toEqual(['\r⠋ lookup']);

        vi.advanceTimersByTime(1);
        spinner.render();
        spinner.render();
        expect(terminal.text()).toEqual(['\r⠋ lookup', '\r⠙ lookup']);
    });

    test('render returns to the first frame after the last', () => {
        const terminal = createTerminal(80);
        const spinner = createSpinner(terminal.stream);
        spinner.start('x');
        for (let i = 0; i < 10; ++i) {
            vi.advanceTimersByTime(80);
            spinner.render();
        }
        expect(terminal.text().join('')).toBe('\r⠋ x\r⠙ x\r⠹ x\r⠸ x\r⠼ x\r⠴ x\r⠦ x\r⠧ x\r⠇ x\r⠏ x\r⠋ x');
    });

    test('render draws nothing before start', () => {
        const terminal = createTerminal(80);
        createSpinner(terminal.stream).render();
        expect(terminal.written()).toEqual([]);
    });

    test.each`
        method       | symbol
        ${'succeed'} | ${'✔'}
        ${'fail'}    | ${'✖'}
    `('$method replaces the spinner with a $symbol line', ({ method, symbol }) => {
        const terminal = createTerminal(80);
        const spinner = createSpinner(terminal.stream);
        spinner.start('lookup');

        spinner[method as 'succeed' | 'fail']('lookup 100 ops/sec');

        expect(spinner.isSpinning).toBe(false);
        expect(terminal.written()[1].startsWith(eraseLine)).toBe(true);
        expect(terminal.text()[1]).toBe(`\r${symbol} lookup 100 ops/sec\n`);

        vi.advanceTimersByTime(80);
        spinner.render();
        expect(terminal.written()).toHaveLength(2);
    });

    test('start begins again at the first frame', () => {
        const terminal = createTerminal(80);
        const spinner = createSpinner(terminal.stream);
        spinner.start('one');
        vi.advanceTimersByTime(80);
        spinner.render();
        spinner.succeed('one');

        spinner.start('two');

        expect(terminal.text().at(-1)).toBe('\r⠋ two');
    });

    test('shows line breaks and tabs in the text as spaces, so the spinner stays on one row', () => {
        const terminal = createTerminal(80);
        createSpinner(terminal.stream).start('line one\nline two\r\nline\tthree');
        expect(terminal.text()).toEqual(['\r⠋ line one line two  line three']);
    });

    test('cuts the text so the line stays narrower than the terminal', () => {
        const terminal = createTerminal(10);
        createSpinner(terminal.stream).start('lookup table');
        expect(terminal.text()).toEqual(['\r⠋ lookup…']);
    });

    test.each([undefined, 0])('takes the terminal as 80 columns wide when it reports a width of %s', (columns) => {
        const terminal = createTerminal(columns);
        createSpinner(terminal.stream).start('x'.repeat(100));
        expect(terminal.text()).toEqual([`\r⠋ ${'x'.repeat(76)}…`]);
    });

    test('does not cut the final line', () => {
        const terminal = createTerminal(10);
        createSpinner(terminal.stream).succeed('lookup table');
        expect(terminal.text()).toEqual(['\r✔ lookup table\n']);
    });
});

function createTerminal(columns: number | undefined) {
    const chunks: string[] = [];
    const stream = Object.assign(new PassThrough(), { columns }) as unknown as NodeJS.WriteStream;
    stream.on('data', (chunk) => chunks.push(String(chunk)));
    return {
        stream,
        /** The chunks written so far. */
        written: () => chunks,
        /** The chunks written so far, without escape codes. `eraseLine` leaves its carriage return. */
        text: () => chunks.map((chunk) => stripVTControlCharacters(chunk)),
    };
}
