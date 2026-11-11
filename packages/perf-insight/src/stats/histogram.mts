/**
 * Finds quantiles of any number of values in fixed memory, by counting the values in buckets.
 */
export interface Histogram {
    push(value: number): void;
    /**
     * @param fraction - the share of the values at or below the result: 0.95 for the 95th percentile.
     *   It is above 0 and at most 1.
     * @returns a value within 0.5% of the exact quantile, when the exact quantile is 0 or lies in the range
     *   from `minValue` to `maxValue`.
     */
    quantile(fraction: number): number;
}

export function createHistogram(): Histogram {
    return new HistogramImpl();
}

/** Each bucket's upper bound is this many times its lower bound. */
const growth = 1.01;
/**
 * The buckets cover the values above `minValue`, up to `maxValue`. Outside that range:
 * - a value at or below `minValue` counts as 0, and so does NaN.
 * - a value above `maxValue` counts as `maxValue`.
 */
const minValue = 1e-9;
const maxValue = 1e12;

const logGrowth = Math.log(growth);
const logMinValue = Math.log(minValue);
const indexBelowRange = 0;
const indexAboveRange = indexInRange(maxValue) + 1;

class HistogramImpl implements Histogram {
    // Floats count exactly up to 2^53. A 32-bit integer would overflow after 4.29 billion values in one bucket.
    #counts = new Float64Array(indexAboveRange + 1);
    #count = 0;

    push(value: number) {
        this.#counts[bucketIndex(value)]++;
        this.#count++;
    }

    quantile(fraction: number) {
        const target = fraction * this.#count;
        let index = 0;
        let seen = this.#counts[0];
        while (seen < target) {
            seen += this.#counts[++index];
        }
        return bucketValue(index);
    }
}

function bucketIndex(value: number): number {
    // Written so that NaN is below the range too.
    if (!(value > minValue)) return indexBelowRange;
    if (value > maxValue) return indexAboveRange;
    return indexInRange(value);
}

function indexInRange(value: number): number {
    return 1 + Math.floor((Math.log(value) - logMinValue) / logGrowth);
}

function bucketValue(index: number): number {
    if (index === indexBelowRange) return 0;
    if (index === indexAboveRange) return maxValue;
    // The geometric middle, which is the same relative distance from both bounds of the bucket.
    return minValue * growth ** (index - 0.5);
}
