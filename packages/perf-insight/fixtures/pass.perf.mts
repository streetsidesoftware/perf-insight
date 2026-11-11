import { suite } from '../src/perfSuite.mjs';

suite('fixture-pass', (test) => {
    test('noop', () => undefined);
}).setTimeout(5);
