# Perf Bench

Performance Benchmarking Suite for NodeJS.

## Install

1. `npm i -D perf-bench`

## Getting Started.

## CLI Help

**`npx perf-bench --help`**

<!--- @@inject: static/help.txt --->

```
Usage: perf-bench [options] [filter...]

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

**Example `.perf` file**

<!--- @@inject: examples/dist/exampleMap.perf.mjs --->

```javascript
import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-bench';
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

**`npx perf-bench exampleMap.perf.mjs --timeout 500`**

<!--- @@inject: static/example.txt --->

```
File: examples/dist/exampleMap.perf.mjs
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => a.length)              27760.39 ops/sec  13622 iterations  490.70ms time
✔ .map((a) => { return a.length; }) 16142.85 ops/sec   7972 iterations  493.84ms time
✔ .map(Boolean)                      6775.20 ops/sec   3366 iterations  496.81ms time
✔ .map((a) => !a.length)            14446.33 ops/sec   7160 iterations  495.63ms time
✔ .map((a) => { return a.length; }) 16726.08 ops/sec   8279 iterations  494.98ms time
done.
```

<!--- @@inject-end: static/example.txt --->
