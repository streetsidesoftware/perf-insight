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
  test('.map((a) => { return a.length; })', () => {
    return knownWords.map((a) => {
      return a.length;
    });
  });
}).setTimeout(defaultTimeout); // set the default timeout for this suite.
```

<!--- @@inject-end: examples/dist/exampleMap.perf.mjs --->

**Example Output:**

**`npx perf-insight exampleMap.perf.mjs --timeout 500`**

<!--- @@inject: static/example.txt --->

```
[ 'examples/dist/exampleMap.perf.mjs', [length]: 1 ]
File: examples/dist/exampleMap.perf.mjs
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => a.length)              24059.07 ops/sec  11792 iterations  490.13ms time
✔ .map((a) => { return a.length; }) 13708.22 ops/sec   6778 iterations  494.45ms time
✔ .map(Boolean)                      7407.73 ops/sec   3682 iterations  497.05ms time
✔ .map((a) => !a.length)            13040.03 ops/sec   6469 iterations  496.09ms time
✔ .map((a) => { return a.length; }) 11657.43 ops/sec   5774 iterations  495.31ms time
done.
```

<!--- @@inject-end: static/example.txt --->

## TypeScript Support

It is necessary to register a TypeScript loader like [ts-node](https://typestrong.org/ts-node/).

**Usage:**

```
npx perf-insight --file "**/*.perf.mts" --timeout 500 --register ts-node/esm
```
