/**
 * The message shown when `--fail-fast` stops a run early.
 * @param count - how many items were not run.
 * @param noun - the singular name of the items, such as `test` or `file`.
 */
export function stoppedAfterFailure(count: number, noun: string): string {
    return `Stopped after first failure: ${count} ${noun}${count === 1 ? '' : 's'} not run.`;
}
