/**
 * Finds quantiles of any number of values in fixed memory.
 */
export interface Histogram {
    push(value: number): void;
    /**
     * @param fraction - the share of the values at or below the result: 0.95 for the 95th percentile.
     * @returns a value within 0.5% of the exact quantile.
     */
    quantile(fraction: number): number;
}

export function createHistogram(): Histogram {
    return new HistogramImpl();
}

/** Each bucket's upper bound is this many times its lower bound. */
const growth = 1.01;
/** Values at or below `minValue` are counted in the first bucket, and values above `maxValue` in the last. */
const minValue = 1e-9;
const maxValue = 1e12;

const logGrowth = Math.log(growth);
const logMinValue = Math.log(minValue);
const bucketCount = Math.ceil((Math.log(maxValue) - logMinValue) / logGrowth) + 1;

class HistogramImpl implements Histogram {
    // Floats count exactly up to 2^53. A 32-bit integer would overflow after 4.29 billion values in one bucket.
    #counts = new Float64Array(bucketCount);
    #count = 0;

    push(value: number) {
        this.#counts[bucketIndex(value)]++;
        this.#count++;
    }

    quantile(fraction: number) {
        const target = fraction * this.#count;
        let index = 0;
        let seen = this.#counts[0];
        while (seen < target && index < bucketCount - 1) {
            seen += this.#counts[++index];
        }
        return bucketMiddle(index);
    }
}

function bucketIndex(value: number): number {
    // Written so that NaN goes to the first bucket too.
    if (!(value > minValue)) return 0;
    return Math.min(Math.floor((Math.log(value) - logMinValue) / logGrowth), bucketCount - 1);
}

/**
 * @returns the geometric middle, which is the same relative distance from both bounds of the bucket.
 */
function bucketMiddle(index: number): number {
    return minValue * growth ** (index + 0.5);
}
