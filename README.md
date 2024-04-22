<!--- @@inject: ./packages/perf-bench/README.md --->

# Perf Bench

Performance Benchmarking Suite for NodeJS.

This is a collection of perf tests. They are designed to check assumptions on performance.

This is a simple command line tool that lists files matching the provided globs.

## Install

1. `npm i -D perf-bench`

## Getting Started.

## CLI Help

1. `npx perf-bench --help`

   ```
   Usage: perf runner [options] [filter...]

   Run performance tests.

   Arguments:
     filter                   perf file filter.

   Options:
     -a, --all                run all tests (default: false)
     -t, --timeout <timeout>  override the timeout for each test
     -s, --suite <suite...>   run matching suites
     -T, --test <test...>     run matching test found in suites
     --repeat <count>         repeat the tests (default: 1)
     -h, --help               display help for command
   ```

1. `npx perf-bench map`

   **Example:**

   ```
   File: test-packages/test/dist/measureMap.perf.mjs
   Running Perf Suite: map
   Measure .map and .filter performance with different functions
   ✔ (a) => a.length             35289.16 ops/sec  69189 iterations 1960.63ms time
   ✔ filter Boolean              15376.08 ops/sec  30478 iterations 1982.17ms time
   ✔ filter (a) => a             17344.62 ops/sec  34338 iterations 1979.75ms time
   ✔ filter (a) => !!a           16124.49 ops/sec  31952 iterations 1981.58ms time
   ✔ (a) => { return a.length; } 33345.17 ops/sec  65630 iterations 1968.20ms time
   ✔ (fnLen)                     33272.30 ops/sec  65509 iterations 1968.87ms time
   ✔ (a) => fnLen(a)             33846.62 ops/sec  66666 iterations 1969.65ms time
   ✔ (vfLen)                     34360.59 ops/sec  67659 iterations 1969.09ms time
   ✔ for of                      22680.99 ops/sec  44821 iterations 1976.15ms time
   ✔ for i                       24474.31 ops/sec  48298 iterations 1973.42ms time
   ✔ for i r[i]=v                18181.71 ops/sec  35950 iterations 1977.26ms time
   ✔ for i Array.from(words)     34932.02 ops/sec  68736 iterations 1967.71ms time
   ✔ for i Array.from             2077.77 ops/sec   4151 iterations 1997.81ms time
   ✔ for i Array(size)           32803.80 ops/sec  64506 iterations 1966.42ms time
   done.
   ```

<!--- @@inject-end: ./packages/perf-bench/README.md --->
