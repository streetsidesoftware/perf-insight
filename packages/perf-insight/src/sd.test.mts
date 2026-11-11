import fs from 'fs/promises';
import { describe, expect, test } from 'vitest';

import { createRunningStdDev } from './sd.mjs';

const urlFixtures = new URL('../../../fixtures/', import.meta.url);

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
        expect(sd.p95).toBeGreaterThan(p95 * 0.9);
        expect(sd.p95).toBeLessThan(p95 * 1.05);
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
    });

    test('a single value', () => {
        const sd = createRunningStdDev();
        sd.push(3);
        expect(sd.ok).toBe(false);
        expect(sd.mean).toBe(3);
        expect(() => sd.variance).toThrow('Need at least two values to calculate variance');
        expect(() => sd.sampleVariance).toThrow('Need at least two values to calculate sample variance');
        expect(() => sd.p95).toThrow();
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
