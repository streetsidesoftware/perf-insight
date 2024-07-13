import { suite } from 'perf-insight';

// Use 2 seconds as the default timeout for tests in the suite.
// The `--timeout` option can override this value.
const defaultTimeout = 100;

// ts-check
suite('fail', 'Example with tests that fail or throw exceptions.', async (test) => {
    test('ok', () => {
        let a = '';
        for (let i = 0; i < 1000; ++i) {
            a = a + 'a';
        }
    });

    test('fail', () => {
        throw new Error('This test failed.');
    });
}).setTimeout(defaultTimeout); // set the default timeout for this suite.
