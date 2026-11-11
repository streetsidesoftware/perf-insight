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
✔ map((a) => !!a)                    17128.71 ops/sec   8502 iterations  496.36ms time
✔ map((a) => a != "")                16905.84 ops/sec   8411 iterations  497.52ms time
✔ map((a) => a.length)               18456.28 ops/sec   9176 iterations  497.18ms time
✔ map((a) => !!a.length)             17334.51 ops/sec   8625 iterations  497.56ms time
✔ .map((a) => { return a.length; })  18578.06 ops/sec   9242 iterations  497.47ms time
✔ .map(Boolean)                      17497.66 ops/sec   8709 iterations  497.72ms time
✔ .map((a) => !a.length)             17102.04 ops/sec   8509 iterations  497.54ms time
✔ .map((a) => { return !a.length; }) 16408.35 ops/sec   8165 iterations  497.61ms time
✔ .map(function len)                 18203.91 ops/sec   9054 iterations  497.37ms time
✔ .map(function hasLen)              17353.75 ops/sec   8636 iterations  497.64ms time
done.
```

<!--- @@inject-end: static/example.txt --->

## TypeScript Support

Node.js 22.18 and later run TypeScript files directly, so no loader or build step is needed.
The default search finds `.ts` and `.mts` perf files along with the JavaScript ones.

The code must use only erasable TypeScript syntax (no `enum` or `namespace`), and relative imports must use the `.mts` / `.ts` extension.
See [Node.js — Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively).

For anything type stripping can't handle, such as `enum` or tsconfig `paths`, load a module loader through Node with `NODE_OPTIONS`.
The perf files run in a child process that inherits it.

```
NODE_OPTIONS="--import tsx" npx perf-insight --all
```
