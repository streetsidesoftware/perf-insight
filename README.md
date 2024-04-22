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

Benchmark performance suites.

Arguments:
  filter                   Perf file filter.

Options:
  -a, --all                Run all perf files. (default: false)
  -t, --timeout <timeout>  Override the timeout for each test suite.
  -s, --suite <suite...>   Run only matching suites.
  -T, --test <test...>     Run only matching test found in suites
  --repeat <count>         Repeat the tests. (default: 1)
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
File: examples/dist/exampleMap.perf.mjs
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => a.length)              28560.04 ops/sec  14016 iterations  490.76ms time
✔ .map((a) => { return a.length; }) 16871.89 ops/sec   8336 iterations  494.08ms time
✔ .map(Boolean)                      7359.97 ops/sec   3656 iterations  496.74ms time
✔ .map((a) => !a.length)            13735.05 ops/sec   6812 iterations  495.96ms time
✔ .map((a) => { return a.length; }) 17403.23 ops/sec   8622 iterations  495.43ms time
done.
```

<!--- @@inject-end: static/example.txt --->
