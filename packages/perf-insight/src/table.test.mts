import { describe, expect, test } from 'vitest';

import { formatTable } from './table.mjs';

// cspell:ignore agai looku -- words the table cuts short

const header = ['Suite', 'Description'];
const rows = [
    ['map', 'Measure Array.map against a for loop.'],
    ['lookup-with-a-long-name', undefined],
    ['x', 'line one\nline two'],
];

describe('formatTable', () => {
    test('pads every column to its widest cell', () => {
        expect(formatTable(header, rows)).toEqual([
            'Suite                    Description                          ',
            '--------------------------------------------------------------',
            'map                      Measure Array.map against a for loop.',
            'lookup-with-a-long-name                                       ',
            'x                        line one\\nline two                   ',
        ]);
    });

    test('leaves a table alone when it fits exactly', () => {
        expect(formatTable(header, rows, 62)).toEqual(formatTable(header, rows));
    });

    test('shrinks the columns to fit 40', () => {
        expect(formatTable(header, rows, 40)).toEqual([
            'Suite           Description            ',
            '---------------------------------------',
            'map             Measure Array.map agai…',
            'lookup-with-a…                         ',
            'x               line one\\nline two     ',
        ]);
    });

    test('shrinks the columns to fit 20', () => {
        expect(formatTable(header, rows, 20)).toEqual([
            'Suite   Description',
            '-------------------',
            'map     Measure Ar…',
            'looku…             ',
            'x       line one\\n…',
        ]);
    });

    test('returns the header and rule when there are no rows', () => {
        expect(formatTable(header, [])).toEqual(['Suite  Description', '------------------']);
    });
});
