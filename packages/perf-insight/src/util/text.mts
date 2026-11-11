import { stripVTControlCharacters } from 'node:util';

/**
 * The width of `text` on screen, taking each visible character as one column wide.
 * That is too narrow for double-width characters, and too wide for combining marks and emoji sequences.
 */
export function textWidth(text: string): number {
    return visibleCharacters(text).length;
}

/**
 * Cut `text` so it is no wider than `width`. Text that fits is returned as it is.
 * Text that is cut ends in `…` and loses its color codes.
 */
export function cutText(text: string, width: number): string {
    const characters = visibleCharacters(text);
    if (characters.length <= width) return text;
    if (width < 1) return '';
    return characters
        .slice(0, width - 1)
        .join('')
        .concat('…');
}

function visibleCharacters(text: string): string[] {
    return [...stripVTControlCharacters(text)];
}
