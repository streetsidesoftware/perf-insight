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

## Running Benchmarks

**Example `example.perf.mjs` file**

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

**Example Output:**

**`npx perf-insight exampleMap.perf.mjs --timeout 500`**

```
File: examples/dist/exampleMap.perf.mjs
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => a.length)              27203.18 ops/sec  13352 iterations  490.82ms time
✔ .map((a) => { return a.length; }) 15047.53 ops/sec   7437 iterations  494.23ms time
✔ .map(Boolean)                      7700.32 ops/sec   3827 iterations  496.99ms time
✔ .map((a) => !a.length)            11501.15 ops/sec   5700 iterations  495.60ms time
✔ .map((a) => { return a.length; }) 16183.73 ops/sec   8018 iterations  495.44ms time
done.
```

<!--- @@inject-end: ../../README.md --->
