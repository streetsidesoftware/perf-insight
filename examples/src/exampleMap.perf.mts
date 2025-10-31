import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-insight';

// Use 2 seconds as the default timeout for tests in the suite.
// The `--timeout` option can override this value.
const defaultTimeout = 2000;

// ts-check
suite('map', 'Measure .map performance with different functions', async (test) => {
    let knownWords: string[] = [];

    test.beforeAll(() => {
        knownWords = loremIpsum({ count: 10000, units: 'words' }).split(' ');
    });

    test('map((a) => !!a)', () => {
        return knownWords.map((a) => !!a);
    });

    test('map((a) => a != "")', () => {
        return knownWords.map((a) => a != '');
    });

    test('map((a) => a.length)', () => {
        return knownWords.map((a) => a.length);
    });

    test('map((a) => !!a.length)', () => {
        return knownWords.map((a) => !!a.length);
    });

    test('.map((a) => { return a.length; })', () => {
        return knownWords.map((a) => {
            return a.length;
        });
    });

    test('.map(Boolean)', () => {
        return knownWords.map(Boolean);
    });

    test('.map((a) => !a.length)', () => {
        return knownWords.map((a) => !a.length);
    });

    test('.map((a) => { return !a.length; })', () => {
        return knownWords.map((a) => {
            return !a.length;
        });
    });

    function len(a: string): number {
        return a.length;
    }

    function hasLen(a: string): boolean {
        return !!a.length;
    }

    test('.map(function len)', () => {
        return knownWords.map(len);
    });

    test('.map(function hasLen)', () => {
        return knownWords.map(hasLen);
    });
}).setTimeout(defaultTimeout); // set the default timeout for this suite.
