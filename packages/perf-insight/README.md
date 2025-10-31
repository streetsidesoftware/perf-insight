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
  --register <loader>      Register a module loader. (e.g. jiti/register)
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
  function len(a) {
    return a.length;
  }
  function hasLen(a) {
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

**`npx perf-insight exampleMap.perf.mjs --timeout 500`**

```
File: examples/dist/exampleMap.perf.mjs
Running Perf Suite: map
Measure .map performance with different functions
✔ map((a) => !!a)                    17922.63 ops/sec   8910 iterations  497.14ms time
✔ map((a) => a != "")                17113.94 ops/sec   8521 iterations  497.90ms time
✔ map((a) => a.length)               19090.99 ops/sec   9502 iterations  497.72ms time
✔ map((a) => !!a.length)             18338.71 ops/sec   9133 iterations  498.02ms time
✔ .map((a) => { return a.length; })  19056.21 ops/sec   9489 iterations  497.95ms time
✔ .map(Boolean)                      18051.54 ops/sec   8991 iterations  498.07ms time
✔ .map((a) => !a.length)             18182.27 ops/sec   9056 iterations  498.07ms time
✔ .map((a) => { return !a.length; }) 17654.60 ops/sec   8794 iterations  498.11ms time
✔ .map(function len)                 19423.79 ops/sec   9672 iterations  497.95ms time
✔ .map(function hasLen)              18287.86 ops/sec   9109 iterations  498.09ms time
done.
```

## TypeScript Support

It is necessary to register a TypeScript loader like [jiti](https://github.com/unjs/jiti).

**Usage:**

```
npx perf-insight --file "**/*.perf.mts" --timeout 500 --register jiti/register
```

<!--- @@inject-end: ../../README.md --->
