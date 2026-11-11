import { styleText } from 'node:util';

import { cutText } from './text.mjs';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const frameInterval = 80; // milliseconds
/** Move to the start of the line and erase all of it. */
const eraseLine = '\r\x1b[2K';
const defaultColumns = 80;

/**
 * A one line progress indicator for a terminal.
 *
 * It has no timer: it only draws when `start` or `render` is called,
 * so nothing runs while a test is being measured.
 */
export interface Spinner {
    readonly isSpinning: boolean;
    /** Show the spinner with `text` next to it. */
    start(text: string): void;
    /** Draw the next frame, if the current one has been showing long enough. */
    render(): void;
    /** Replace the spinner with a ✔ line. */
    succeed(text: string): void;
    /** Replace the spinner with a ✖ line. */
    fail(text: string): void;
}

/**
 * @param stream - the terminal to draw on. The spinner writes control codes, so it must be a TTY.
 */
export function createSpinner(stream: NodeJS.WriteStream): Spinner {
    let spinningText: string | undefined;
    let frameIndex = 0;
    let frameShownAt = 0;

    function start(text: string) {
        spinningText = text;
        frameIndex = 0;
        draw(text);
    }

    function render() {
        if (spinningText === undefined) return;
        if (performance.now() - frameShownAt < frameInterval) return;
        frameIndex = (frameIndex + 1) % frames.length;
        draw(spinningText);
    }

    /** The line is cut to fit the terminal, because `eraseLine` can't erase a line that wrapped. */
    function draw(text: string) {
        const frame = frames[frameIndex];
        const widthLeft = (stream.columns || defaultColumns) - frame.length - 2;
        stream.write(`${eraseLine}${color('cyan', frame)} ${cutText(text, widthLeft)}`);
        frameShownAt = performance.now();
    }

    function replaceWith(symbol: string, text: string) {
        spinningText = undefined;
        stream.write(`${eraseLine}${symbol} ${text}\n`);
    }

    function color(name: 'cyan' | 'green' | 'red', text: string): string {
        return styleText(name, text, { stream });
    }

    return {
        get isSpinning() {
            return spinningText !== undefined;
        },
        start,
        render,
        succeed: (text) => replaceWith(color('green', '✔'), text),
        fail: (text) => replaceWith(color('red', '✖'), text),
    };
}
