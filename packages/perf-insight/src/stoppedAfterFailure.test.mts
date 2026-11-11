import { describe, expect, test } from 'vitest';

import { stoppedAfterFailure } from './stoppedAfterFailure.mjs';

describe('stoppedAfterFailure', () => {
    test.each`
        count | noun      | expected
        ${1}  | ${'test'} | ${'Stopped after first failure: 1 test not run.'}
        ${3}  | ${'file'} | ${'Stopped after first failure: 3 files not run.'}
    `('$count $noun', ({ count, noun, expected }) => {
        expect(stoppedAfterFailure(count, noun)).toBe(expected);
    });
});
