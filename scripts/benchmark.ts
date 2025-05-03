import { $ } from "bun";

// Get the nativelink commit hash and message.
const nativelinkCommitHash = await $`git -C nativelink rev-parse HEAD`.text();
const nativelinkCommitMessage =
  await $`git -C nativelink log -1 --pretty=%B`.text();

// Read the latest benchmark commit hash.
const latestBenchmarkCommitHashFile = Bun.file(
  new URL(".latest-benchmark-commit-hash", import.meta.url),
);
const latestBenchmarkCommitHash = await latestBenchmarkCommitHashFile.text();

// Dump some info.
console.info({
  nativelinkCommitHash,
  nativelinkCommitMessage,
  latestBenchmarkCommitHash,
});

// Make sure we don't benchmark the same commit twice.
if (nativelinkCommitHash.trim() === latestBenchmarkCommitHash.trim()) {
  console.info("The cloned commit from nativelink was already benchmarked");
  process.exit(0);
}

// Get a hold of the current timestamp.
const now = Date.now();

// TODO: Run some benchmarks against tensorflow.

// Dump the new data to the relevant benchmark files.
import { appendFile } from "node:fs/promises";
await appendFile(
  new URL(
    "../src/benchmarks/example-category/example-benchmark.jsonl",
    import.meta.url,
  ),
  `${JSON.stringify({
    timestamp: now,
    // TODO: Change `value` to whatever metric value you gathered.
    value: Math.floor(20 + Math.random() * 100),
    commitHash: nativelinkCommitHash,
    commitMessage: nativelinkCommitMessage,
  })}\n`,
);

// Update the latest benchmark commit hash file.
await latestBenchmarkCommitHashFile.write(nativelinkCommitHash);
