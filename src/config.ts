export let config = {
  shouldPanic: true,
  verbose: true,
}

export function panic() {
  if (config.shouldPanic) {
    process.exit(1)
  }
}
