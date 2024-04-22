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
  --repeat <count>         Repeat the tests. (default: 1)
  --register <loader>      Register a module loader. (e.g. ts-node/esm)
  -h, --help               display help for command
```

<!--- @@inject-end: static/help.txt --->

## Running Benchmarks

**Example `example.perf.mjs` file**

<!--- @@inject: examples/dist/exampleMap.perf.mjs --->

```javascript
import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-insight';
// Use 2 seconds as the default timeout for tests in the suite.
// The `--timeout` option can override this value.
const defaultTimeout = 2000;
// ts-check
suite('map', 'Measure .map performance with different functions', async (test) => {
  let knownWords = [];
  test.beforeAll(() => {
    knownWords = loremIpsum({ count: 10000, units: 'words' }).split(' ');
  });
  test('map((a) => a.length)', () => {
    return knownWords.map((a) => a.length);
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
}).setTimeout(defaultTimeout); // set the default timeout for this suite.
```

<!--- @@inject-end: examples/dist/exampleMap.perf.mjs --->

**Example Output:**

**`npx perf-insight exampleMap.perf.mjs --timeout 500`**

<!--- @@inject: static/example.txt --->

```
File: examples/dist/exampleMap.perf.mjs
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => a.length)               30161.75 ops/sec  14805 iterations  490.85ms time
✔ .map((a) => { return a.length; })  18350.31 ops/sec   9068 iterations  494.16ms time
✔ .map(Boolean)                       7007.64 ops/sec   3480 iterations  496.60ms time
✔ .map((a) => !a.length)             14078.50 ops/sec   6985 iterations  496.15ms time
✔ .map((a) => { return !a.length; }) 13274.67 ops/sec   6579 iterations  495.61ms time
done.
```

<!--- @@inject-end: static/example.txt --->

## TypeScript Support

It is necessary to register a TypeScript loader like [ts-node](https://typestrong.org/ts-node/).

**Usage:**

```
npx perf-insight --file "**/*.perf.mts" --timeout 500 --register ts-node/esm
```
