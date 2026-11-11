<!--- @@inject: ../../README.md --->

# Performance Insight

Performance Benchmarking Suite for NodeJS.

## Install

1. `npm i -D perf-insight`

## Getting Started.

## CLI Help

**`npx perf-insight --help`**

```
Usage: perf-insight [options] [filter...]

Benchmark performance suites found in `**/*.perf.{js,cjs,mjs}`.

Arguments:
  filter                   Perf file filter.

Options:
  -a, --all                Run all perf files. (default: false)
  -f, --file <glob...>     Globs to search for perf files.
  -x, --exclude <glob...>  Globs to exclude from search.
  -t, --timeout <timeout>  Override the timeout for each test suite.
  -s, --suite <suite...>   Run only matching suites.
  -T, --test <test...>     Run only matching test found in suites
  --fail-fast              Stop on first failure. (default: false)
  --repeat <count>         Repeat the tests. (default: 1)
  --register <loader>      Register a module loader.
  -h, --help               display help for command
```

## Running Benchmarks

**Example `example.perf.mts` file**

```typescript
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
```

**Example Output:**

**`npx perf-insight exampleMap.perf.mts --file "**/*.perf.mts" --timeout 500`**

```
File: examples/src/exampleMap.perf.mts
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => !!a)                    17569.36 ops/sec   8729 iterations  496.83ms time
✔ map((a) => a != "")                16923.54 ops/sec   8423 iterations  497.71ms time
✔ map((a) => a.length)               18781.42 ops/sec   9343 iterations  497.46ms time
✔ map((a) => !!a.length)             17961.36 ops/sec   8941 iterations  497.79ms time
✔ .map((a) => { return a.length; })  18752.49 ops/sec   9332 iterations  497.64ms time
✔ .map(Boolean)                      17822.99 ops/sec   8872 iterations  497.78ms time
✔ .map((a) => !a.length)             17782.90 ops/sec   8852 iterations  497.78ms time
✔ .map((a) => { return !a.length; }) 17717.70 ops/sec   8824 iterations  498.03ms time
✔ .map(function len)                 18491.62 ops/sec   9206 iterations  497.85ms time
✔ .map(function hasLen)              17475.31 ops/sec   8702 iterations  497.96ms time
done.
```

## TypeScript Support

Node.js 22.18 and later run TypeScript files directly, so no loader or build step is needed.
The default search only finds JavaScript files, so pass the TypeScript glob with `--file`.

**Usage:**

```
npx perf-insight --file "**/*.perf.mts" --timeout 500
```

The code must use only erasable TypeScript syntax (no `enum` or `namespace`), and relative imports must use the `.mts` / `.ts` extension.
See [Node.js — Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively).

<!--- @@inject-end: ../../README.md --->
