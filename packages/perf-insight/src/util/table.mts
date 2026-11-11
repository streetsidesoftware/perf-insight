import { cutText, textWidth } from './text.mjs';

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
    const cut = cutText(text, width);
    return cut + ' '.repeat(width - textWidth(cut));
}
