# Perf Tests

This is a collection of perf tests. They are designed to check assumptions on performance.

This is a simple command line tool that lists files matching the provided globs.

## Getting Started

1. Install [`pnpm`](https://pnppm.io)

1. `pnpm i`

1. `pnpm build`

1. `pnpm test`

1. `pnpm run app --help`

   <!--- @@inject: static/help.txt --->

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

   <!--- @@inject-end: static/help.txt --->

1. `pnpm run app map`

   **Example:**

   <!--- @@inject: static/example.txt --->

   ```
   done.
   ```

   <!--- @@inject-end: static/example.txt --->
