'use strict'

/**
 * Logs each Antora lifecycle event with the time it took and a running total.
 *
 * Antora only renders progress when stdout is a TTY: createProgress in
 * @antora/content-aggregator returns nothing unless term.isTTY, and it is
 * handed process.stdout directly, so no environment variable can turn it back
 * on. Both `yarn workspaces foreach` and `run-s -l` pipe stdout to add their
 * own label prefixes, which means the entire aggregate-and-convert phase runs
 * with no output at all.
 *
 * On CI that measured as a single 12m44s gap before Hugo's first line, out of
 * an 18m39s build. A silent gap that long is indistinguishable from a hung
 * build, which is the problem this solves.
 *
 * contentAggregated is the useful boundary: everything before it is cloning
 * and fetching content repositories, everything after is conversion.
 */
const EVENTS = [
  'playbookBuilt',
  'beforeProcess',
  'uiLoaded',
  'contentAggregated',
  'contentClassified',
  'documentsConverted',
  'navigationBuilt',
  'pagesComposed',
  'redirectsProduced',
  'siteMapped',
  'beforePublish',
  'sitePublished'
]

module.exports.register = function () {
  const start = process.hrtime.bigint()
  let previous = start

  const elapsed = (from, to) => (Number(to - from) / 1e9).toFixed(1)

  EVENTS.forEach((event) => {
    this.on(event, () => {
      const now = process.hrtime.bigint()
      process.stdout.write(`antora: ${event} +${elapsed(previous, now)}s (${elapsed(start, now)}s total)\n`)
      previous = now
    })
  })
}
