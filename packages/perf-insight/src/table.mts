import { stripVTControlCharacters } from 'node:util';

const delimiter = '  ';

/**
 * Format rows as the lines of a text table: the header, a dashed rule, then one line per row.
 *
 * - Every line is padded to the same width.
 * - An `undefined` cell is left blank.
 * - A line break inside a cell is shown as `\n`, so each row stays on one line.
 * - Color codes in a cell don't count toward its width.
 * - When the table is wider than `maxWidth`, each column gives up space in proportion to its width.
 *   A cell that no longer fits is cut short and ends in `…`. It loses its color codes.
 */
export function formatTable(header: string[], rows: (string | undefined)[][], maxWidth = Infinity): string[] {
    const cells = [header, ...rows].map((row) => row.map((cell) => (cell ?? '').replaceAll('\n', '\\n')));
    const naturalWidths = header.map((_, i) => cells.reduce((width, row) => Math.max(width, textWidth(row[i])), 0));
    const naturalTotal = naturalWidths.reduce((a, b) => a + b, 0);
    const available = maxWidth - delimiter.length * (header.length - 1);
    const excess = Math.max(0, naturalTotal - available);
    const widths = naturalWidths.map((width) => Math.max(0, Math.floor(width - (excess * width) / naturalTotal)));

    const [titles, ...body] = cells.map((row) => row.map((cell, i) => fit(cell, widths[i])).join(delimiter));
    return [titles, '-'.repeat(textWidth(titles)), ...body];
}

function fit(text: string, width: number): string {
    const padding = width - textWidth(text);
    if (padding >= 0) return text + ' '.repeat(padding);
    return visibleCharacters(text)
        .slice(0, Math.max(0, width - 1))
        .join('')
        .concat('…');
}

/**
 * The width of `text` on screen, taking each visible character as one column wide.
 * That is too narrow for double-width characters, and too wide for combining marks and emoji sequences.
 */
function textWidth(text: string): number {
    return visibleCharacters(text).length;
}

function visibleCharacters(text: string): string[] {
    return [...stripVTControlCharacters(text)];
}
