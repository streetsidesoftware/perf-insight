import { createHistogram } from './histogram.mjs';

export interface RunningStdDev {
    push(value: number): void;
    readonly count: number;
    readonly mean: number;
    readonly variance: number;
    readonly sampleVariance: number;
    readonly standardDeviation: number;
    readonly sampleStandardDeviation: number;
    readonly min: number;
    readonly max: number;
    readonly ok: boolean;
    readonly p95: number;
}

export function createRunningStdDev(): RunningStdDev {
    return new RunningStdDevImpl();
}

class RunningStdDevImpl {
    #count = 0;
    #sum = 0;
    #m2 = 0;
    #min = Infinity;
    #max = -Infinity;
    #histogram = createHistogram();

    push(value: number) {
        this.#histogram.push(value);
        let mean = this.#count ? this.#sum / this.#count : 0;
        this.#count++;
        const delta = value - mean;
        this.#sum += value;
        mean = this.#sum / this.#count;
        const delta2 = value - mean;
        this.#m2 += delta * delta2;
        this.#min = Math.min(this.#min, value);
        this.#max = Math.max(this.#max, value);
    }

    get count() {
        return this.#count;
    }

    /**
     * Returns true if there are at least two values.
     */
    get ok() {
        return this.#count > 1;
    }

    get mean() {
        assert(this.#count, 'No values to calculate mean');
        return this.#sum / this.#count;
    }

    get variance() {
        assert(this.#count > 1, 'Need at least two values to calculate variance');
        return this.#m2 / this.#count;
    }

    get sampleVariance() {
        assert(this.#count > 1, 'Need at least two values to calculate sample variance');
        return this.#m2 / (this.#count - 1);
    }

    get standardDeviation() {
        return Math.sqrt(this.variance);
    }

    get sampleStandardDeviation() {
        return Math.sqrt(this.sampleVariance);
    }

    get min() {
        return this.#min;
    }

    get max() {
        return this.#max;
    }

    get p95() {
        assert(this.#count, 'No values to calculate p95');
        // The middle of a bucket can lie outside the values that were pushed.
        return Math.min(this.#max, Math.max(this.#min, this.#histogram.quantile(0.95)));
    }
}

function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message ?? 'Assertion failed');
    }
}
