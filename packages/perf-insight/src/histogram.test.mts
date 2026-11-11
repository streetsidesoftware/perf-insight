import { describe, expect, test } from 'vitest';

import { createHistogram } from './histogram.mjs';

describe('histogram', () => {
    test.each`
        fraction | expected
        ${0.001} | ${1}
        ${0.5}   | ${500}
        ${0.95}  | ${950}
        ${0.999} | ${999}
        ${1}     | ${1000}
    `('quantile $fraction of 1 to 1000', ({ fraction, expected }) => {
        const histogram = histogramOf(range(1000).map((i) => i + 1));
        expect(relativeError(histogram.quantile(fraction), expected)).toBeLessThan(0.005);
    });

    test.each`
        scale
        ${1e-8}
        ${1e-3}
        ${1e6}
        ${1e11}
    `('quantiles of values near $scale', ({ scale }) => {
        const values = range(2000).map((i) => scale * (1 + i / 400));
        const histogram = histogramOf(values);
        expect(relativeError(histogram.quantile(0.5), exactQuantile(values, 0.5))).toBeLessThan(0.005);
        expect(relativeError(histogram.quantile(0.95), exactQuantile(values, 0.95))).toBeLessThan(0.005);
    });

    test('rare large values do not move the 95th percentile', () => {
        const values = range(100_000).map((i) => (i % 500 === 0 ? 2 : 0.00006));
        const histogram = histogramOf(values);
        expect(relativeError(histogram.quantile(0.95), 0.00006)).toBeLessThan(0.005);
        expect(relativeError(histogram.quantile(0.9999), 2)).toBeLessThan(0.005);
    });

    test.each`
        value
        ${0}
        ${-5}
        ${1e-12}
        ${Number.NaN}
    `('counts $value in the first bucket', ({ value }) => {
        const histogram = histogramOf([value, 1, 1]);
        expect(histogram.quantile(0.3)).toBeLessThan(1.01e-9);
        expect(relativeError(histogram.quantile(0.95), 1)).toBeLessThan(0.005);
    });

    test.each`
        value
        ${1e15}
        ${Infinity}
    `('counts $value in the last bucket', ({ value }) => {
        const histogram = histogramOf([1, 1, value]);
        expect(relativeError(histogram.quantile(0.5), 1)).toBeLessThan(0.005);
        expect(histogram.quantile(1)).toBeGreaterThan(0.99e12);
        expect(histogram.quantile(1)).toBeLessThan(1.02e12);
    });
});

function histogramOf(values: number[]) {
    const histogram = createHistogram();
    values.forEach((value) => histogram.push(value));
    return histogram;
}

function range(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
}

/**
 * @returns the smallest value that has at least `fraction` of the values at or below it.
 */
function exactQuantile(values: number[], fraction: number): number {
    const sorted = values.toSorted((a, b) => a - b);
    return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

function relativeError(actual: number, expected: number): number {
    return Math.abs(actual - expected) / Math.abs(expected);
}
