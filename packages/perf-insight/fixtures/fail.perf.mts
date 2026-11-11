import { suite } from '../src/perfSuite.mjs';

suite('fixture-fail', (test) => {
    test('throws', () => {
        throw new Error('This test failed.');
    });
}).setTimeout(5);
