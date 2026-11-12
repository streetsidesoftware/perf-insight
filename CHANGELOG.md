# Changelog

## [3.0.0](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-2.0.1...perf-insight-repo-3.0.0) (2026-11-12)


### ⚠ BREAKING CHANGES

* remove the --register option ([#399](https://github.com/streetsidesoftware/perf-insight/issues/399))
* drop support for Node 20 ([#374](https://github.com/streetsidesoftware/perf-insight/issues/374))

### Features

* drop support for Node 20 ([#374](https://github.com/streetsidesoftware/perf-insight/issues/374)) ([b5905ad](https://github.com/streetsidesoftware/perf-insight/commit/b5905ad3ef86ba3dbf3e1b678e41c416d3c7025c))
* remove the --register option ([#399](https://github.com/streetsidesoftware/perf-insight/issues/399)) ([0c4a637](https://github.com/streetsidesoftware/perf-insight/commit/0c4a637f1225da6eae9dc596754f7b0f9439422a))
* run TypeScript perf files natively, and find `.ts` and `.mts` perf files by default ([c8d4440](https://github.com/streetsidesoftware/perf-insight/commit/c8d444098c4f29c76168bc70d09131a853d53b44))
* support running perf-insight with Bun and Deno ([#401](https://github.com/streetsidesoftware/perf-insight/issues/401)) ([3b0a147](https://github.com/streetsidesoftware/perf-insight/commit/3b0a147248f8cb62a7cfb4a54488a32cf6595e0a))


### Bug Fixes

* exit right away when a perf file's process cannot be started ([#414](https://github.com/streetsidesoftware/perf-insight/issues/414)) ([61e11ec](https://github.com/streetsidesoftware/perf-insight/commit/61e11ecbb30a8d1377512e44bb2dafe29b90d21a))
* keep result columns aligned for fast tests ([#405](https://github.com/streetsidesoftware/perf-insight/issues/405)) ([c1f2b4b](https://github.com/streetsidesoftware/perf-insight/commit/c1f2b4b1da8466e84f42367cce0e557e4a09a509))
* make the statistics in runTests() results accurate ([#410](https://github.com/streetsidesoftware/perf-insight/issues/410)) ([5c23dc5](https://github.com/streetsidesoftware/perf-insight/commit/5c23dc59a80a237b7f551fe5dd359d0dbae95fd9))
* replace chalk with the runtime's built-in text styling ([#409](https://github.com/streetsidesoftware/perf-insight/issues/409)) ([3b40243](https://github.com/streetsidesoftware/perf-insight/commit/3b402435a32b577ebd507d7481829d99cfc65bab))
* replace ora with a built-in spinner ([#408](https://github.com/streetsidesoftware/perf-insight/issues/408)) ([935ca69](https://github.com/streetsidesoftware/perf-insight/commit/935ca69fa3748cdf06c1a7fa53c0ae706266c183))
* run every suite after a failure, and make --fail-fast stop at the first failing test ([#402](https://github.com/streetsidesoftware/perf-insight/issues/402)) ([8c83da4](https://github.com/streetsidesoftware/perf-insight/commit/8c83da44f7f5588be330b1fa2510ccb19538b205))

## [2.0.1](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-2.0.0...perf-insight-repo-2.0.1) (2025-10-31)


### Bug Fixes

* Use jiti instead of ts-node ([#339](https://github.com/streetsidesoftware/perf-insight/issues/339)) ([f6827f1](https://github.com/streetsidesoftware/perf-insight/commit/f6827f1836e98da0da6d9c0df45119bde2f694f7))

## [2.0.0](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-1.2.0...perf-insight-repo-2.0.0) (2025-07-05)


### ⚠ BREAKING CHANGES

* Drop support for Node 18 ([#283](https://github.com/streetsidesoftware/perf-insight/issues/283))

### Features

* Drop support for Node 18 ([#283](https://github.com/streetsidesoftware/perf-insight/issues/283)) ([59a35ce](https://github.com/streetsidesoftware/perf-insight/commit/59a35ce92984465841dc5daa3b0ae44d92ead01c))

## [1.2.0](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-1.1.1...perf-insight-repo-1.2.0) (2024-07-13)


### Features

* Exit with 1 if a test failed ([#58](https://github.com/streetsidesoftware/perf-insight/issues/58)) ([b7d8519](https://github.com/streetsidesoftware/perf-insight/commit/b7d85194d0f3614e7a831ac7c937461b096649a6))

## [1.1.1](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-1.1.0...perf-insight-repo-1.1.1) (2024-04-23)


### Bug Fixes

* improve error reporting ([#19](https://github.com/streetsidesoftware/perf-insight/issues/19)) ([ac563c4](https://github.com/streetsidesoftware/perf-insight/commit/ac563c4e011fc86000074f46a0b453c1cc47b123))

## [1.1.0](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-1.0.3...perf-insight-repo-1.1.0) (2024-04-22)


### Features

* Support node loaders ([#17](https://github.com/streetsidesoftware/perf-insight/issues/17)) ([1fa6010](https://github.com/streetsidesoftware/perf-insight/commit/1fa60101f0acd8270d780db440f4231971c3ba5d))

## [1.0.3](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-1.0.2...perf-insight-repo-1.0.3) (2024-04-22)


### Bug Fixes

* Update README.md ([f38a315](https://github.com/streetsidesoftware/perf-insight/commit/f38a315f262d87c27befe729efb9115da9ddb5dc))

## [1.0.2](https://github.com/streetsidesoftware/perf-insight/compare/perf-insight-repo-v1.0.0...perf-insight-repo-1.0.2) (2024-04-22)


### Features

* Initial check in. ([c674626](https://github.com/streetsidesoftware/perf-insight/commit/c674626cf9d04471d9c44718052a5172d48749dc))


### Bug Fixes

* Make package public ([9fbfa82](https://github.com/streetsidesoftware/perf-insight/commit/9fbfa82df72854977890718cd1affb531949133a))
* Rename to `perf-insight` ([a7d91a2](https://github.com/streetsidesoftware/perf-insight/commit/a7d91a25f4494353cc709e2641787361f663bcb6))
* Update README.md and improve examples ([#12](https://github.com/streetsidesoftware/perf-insight/issues/12)) ([0409120](https://github.com/streetsidesoftware/perf-insight/commit/040912029f2d4faea6ed1a65b37a5c9ac04c42ce))


### Miscellaneous Chores

* release 1.0.0 ([c70c381](https://github.com/streetsidesoftware/perf-insight/commit/c70c3819b00874ca762d48a9d09979f668c454c0))
* release 1.0.2 ([f9f440d](https://github.com/streetsidesoftware/perf-insight/commit/f9f440d72bd5a57f0bfb1c23b47da67bde67ac28))

## Changelog
