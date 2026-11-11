import fs from 'fs/promises';
import { describe, expect, test } from 'vitest';

import { createRunningStdDev } from './sd.mjs';

const urlFixtures = new URL('../../../../fixtures/', import.meta.url);

describe('sd', async () => {
    const sampleData = (await readSampleData()).sort((a, b) => a - b);

    const sum = sampleData.reduce((a, b) => a + b, 0);
    const count = sampleData.length;
    const mean = sum / count;
    const p95 = sampleData[Math.floor(count * 0.95)];
    const min = sampleData[0];
    const max = sampleData[sampleData.length - 1];

    // console.log('%o', { sum, count, mean, p95, min, max });

    const sd = createRunningStdDev();

    sampleData.forEach((value) => sd.push(value));

    test('sd', () => {
        expect(sd.count).toBe(count);
        expect(sd.mean).toBe(mean);
        expect(sd.min).toBe(min);
        expect(sd.max).toBe(max);
        expect(relativeError(sd.p95, p95)).toBeLessThan(0.01);
        expect(sd.ok).toBe(true);
    });

    test('variance and standard deviation', () => {
        const variance = sampleData.reduce((acc, v) => acc + (v - mean) ** 2, 0) / count;
        const sampleVariance = (variance * count) / (count - 1);
        expect(relativeError(sd.variance, variance)).toBeLessThan(1e-12);
        expect(relativeError(sd.sampleVariance, sampleVariance)).toBeLessThan(1e-12);
        expect(relativeError(sd.standardDeviation, Math.sqrt(variance))).toBeLessThan(1e-12);
        expect(relativeError(sd.sampleStandardDeviation, Math.sqrt(sampleVariance))).toBeLessThan(1e-12);
    });

    test('empty', () => {
        const sd = createRunningStdDev();
        expect(sd.count).toBe(0);
        expect(sd.ok).toBe(false);
        expect(sd.min).toBe(Infinity);
        expect(sd.max).toBe(-Infinity);
        expect(() => sd.mean).toThrow('No values to calculate mean');
        expect(() => sd.p95).toThrow('No values to calculate p95');
    });

    test('a single value', () => {
        const sd = createRunningStdDev();
        sd.push(3);
        expect(sd.ok).toBe(false);
        expect(sd.mean).toBe(3);
        expect(() => sd.variance).toThrow('Need at least two values to calculate variance');
        expect(() => sd.sampleVariance).toThrow('Need at least two values to calculate sample variance');
        expect(sd.p95).toBe(3);
    });

    // The histogram answers 0.9983 for both: the middle of the bucket that holds them.
    test.each`
        values
        ${[0.994, 0.995, 0.996]}
        ${[1.0001, 1.0002, 1.0003]}
    `('p95 stays within $values', ({ values }: { values: number[] }) => {
        const sd = createRunningStdDev();
        values.forEach((value) => sd.push(value));
        expect(sd.p95).toBeGreaterThanOrEqual(sd.min);
        expect(sd.p95).toBeLessThanOrEqual(sd.max);
    });

    test('p95 is the value that 95% of the values are at or below', () => {
        const sd = createRunningStdDev();
        // Each value is 10% above the one before, so the neighboring percentiles are far apart.
        const values = Array.from({ length: 100 }, (_, i) => 1.1 ** i);
        values.forEach((value) => sd.push(value));
        expect(relativeError(sd.p95, values[94])).toBeLessThan(0.005);
    });

    test('p95 is 0 when 95% of the values are 0', () => {
        const sd = createRunningStdDev();
        for (let i = 0; i < 100; ++i) {
            sd.push(i < 96 ? 0 : 0.001);
        }
        expect(sd.p95).toBe(0);
    });

    test('p95 is not moved by rare slow values', () => {
        const sd = createRunningStdDev();
        for (let i = 0; i < 100_000; ++i) {
            sd.push(i % 500 === 0 ? 2 : 0.00006);
        }
        expect(relativeError(sd.p95, 0.00006)).toBeLessThan(0.01);
    });
});

async function readSampleData() {
    const url = new URL('sample-data.txt', urlFixtures);
    const data = await fs.readFile(url, 'utf8');
    return data
        .split('\n')
        .filter((a) => a)
        .map(Number);
}

function relativeError(actual: number, expected: number): number {
    return Math.abs(actual - expected) / Math.abs(expected);
}
