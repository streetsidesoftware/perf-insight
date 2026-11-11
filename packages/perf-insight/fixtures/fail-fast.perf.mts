import { suite } from '../src/perfSuite.mjs';

suite('fixture-ff-fails', (test) => {
    test('throws', () => {
        throw new Error('This test failed.');
    });
}).setTimeout(5);

suite('fixture-ff-after', (test) => {
    test('noop', () => undefined);
}).setTimeout(5);
