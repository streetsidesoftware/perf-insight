import { styleText } from 'node:util';

export function red(text: string): string {
    return color('red', text);
}

export function green(text: string): string {
    return color('green', text);
}

export function yellow(text: string): string {
    return color('yellow', text);
}

/**
 * Color `text` only when stdout is a terminal, so piped output never carries color codes.
 *
 * `styleText` makes that check itself on Node. It does not on Bun before 1.4.0 or Deno before 2.8.0.
 */
function color(name: 'red' | 'green' | 'yellow', text: string): string {
    return process.stdout.isTTY ? styleText(name, text) : text;
}
