# Performance Insight

Performance Benchmarking Suite for NodeJS.

## Install

1. `npm i -D perf-insight`

## Getting Started.

## CLI Help

**`npx perf-insight --help`**

<!--- @@inject: static/help.txt --->

```
Usage: perf-insight [options] [filter...]

Benchmark performance suites found in `**/*.perf.{js,cjs,mjs,ts,mts}`.

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

<!--- @@inject-end: static/help.txt --->

## Running Benchmarks

**Example `example.perf.mts` file**

<!--- @@inject: examples/src/exampleMap.perf.mts --->

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

<!--- @@inject-end: examples/src/exampleMap.perf.mts --->

**Example Output:**

**`npx perf-insight exampleMap.perf.mts --timeout 500`**

<!--- @@inject: static/example.txt --->

```
File: examples/src/exampleMap.perf.mts
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => !!a)                    18135.52 ops/sec   9010 iterations  496.82ms time
✔ map((a) => a != "")                17551.15 ops/sec   8733 iterations  497.57ms time
✔ map((a) => a.length)               19382.93 ops/sec   9641 iterations  497.40ms time
✔ map((a) => !!a.length)             18259.02 ops/sec   9088 iterations  497.73ms time
✔ .map((a) => { return a.length; })  19300.85 ops/sec   9604 iterations  497.59ms time
✔ .map(Boolean)                      18117.39 ops/sec   9018 iterations  497.75ms time
✔ .map((a) => !a.length)             18088.76 ops/sec   9003 iterations  497.71ms time
✔ .map((a) => { return !a.length; }) 18236.47 ops/sec   9080 iterations  497.90ms time
✔ .map(function len)                 19635.27 ops/sec   9772 iterations  497.68ms time
✔ .map(function hasLen)              18319.66 ops/sec   9121 iterations  497.88ms time
done.
```

<!--- @@inject-end: static/example.txt --->

## TypeScript Support

Node.js 22.18 and later run TypeScript files directly, so no loader or build step is needed.
The default search finds `.ts` and `.mts` perf files along with the JavaScript ones.

The code must use only erasable TypeScript syntax (no `enum` or `namespace`), and relative imports must use the `.mts` / `.ts` extension.
See [Node.js — Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively).
