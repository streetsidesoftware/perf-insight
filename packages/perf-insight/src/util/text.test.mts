import { describe, expect, test } from 'vitest';

import { cutText, textWidth } from './text.mjs';

describe('textWidth', () => {
    test.each`
        text               | expected
        ${''}              | ${0}
        ${'lookup'}        | ${6}
        ${green('lookup')} | ${6}
        ${'𝒳y'}            | ${2}
    `('counts the visible characters of $text', ({ text, expected }) => {
        expect(textWidth(text)).toBe(expected);
    });
});

describe('cutText', () => {
    test('returns text that fits as it is, color codes included', () => {
        expect(cutText('lookup', 6)).toBe('lookup');
        expect(cutText(green('lookup'), 6)).toBe(green('lookup'));
    });

    test('ends text it cuts in an ellipsis', () => {
        expect(cutText('starboard', 5)).toBe('star…');
    });

    test('drops the color codes of text it cuts', () => {
        expect(cutText(green('starboard'), 5)).toBe('star…');
    });

    test('cuts by character, not by UTF-16 unit', () => {
        expect(cutText('𝒳'.repeat(9), 5)).toBe('𝒳'.repeat(4) + '…');
    });

    test.each([0, -3])('returns nothing when the width is %i', (width) => {
        expect(cutText('lookup', width)).toBe('');
    });
});

function green(text: string): string {
    return `\u001b[32m${text}\u001b[39m`;
}
