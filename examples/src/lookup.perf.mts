import { suite } from 'perf-insight';

suite('lookup', 'Compare looking up values in an Array and a Set', async (test) => {
    const values = Array.from({ length: 1000 }, (_, i) => `value-${i}`);
    const valueSet = new Set(values);
    const lookFor = ['value-10', 'value-500', 'value-999', 'missing'];

    test('Array.includes', () => {
        return lookFor.map((v) => values.includes(v));
    });

    test('Set.has', () => {
        return lookFor.map((v) => valueSet.has(v));
    });
});
