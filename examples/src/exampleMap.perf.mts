import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-bench';

const defaultTimeout = 2000;

suite('map', 'Measure .map performance with different functions', async (test) => {
    let knownWords: string[] = [];

    test.beforeAll(() => {
        knownWords = loremIpsum({ count: 10000, units: 'words' }).split(' ');
    });

    test('map( (a) => a.length )', () => {
        return knownWords.map((a) => a.length);
    });

    test('map( (a) => { return a.length; } )', () => {
        return knownWords.map((a) => {
            return a.length;
        });
    });

    test('map( Boolean )', () => {
        return knownWords.map(Boolean);
    });

    test('map( (a) => !a.length )', () => {
        return knownWords.map((a) => !a.length);
    });

    test('map( (a) => { return a.length; } )', () => {
        return knownWords.map((a) => {
            return a.length;
        });
    });
}).setTimeout(defaultTimeout);
