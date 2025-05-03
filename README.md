# Nativelink Benchmarks

This repository runs [nativelink](https://github.com/TraceMachina/nativelink) benchmarks on [TensorFlow](https://github.com/tensorflow/tensorflow) and presents the data using plots in a static site.

It uses:

- [Bun](https://bun.sh/)
- [Astro](https://github.com/withastro/astro)
- [TailwindCSS](https://tailwindcss.com/)
- [uPlot](https://github.com/leeoniya/uPlot)

## Installation

```sh
bun install
```

## Development

```sh
bun run dev
```

## Build

Build the website with Astro:

```sh
bun run build
```

Now, you can publish the static files under `dist/` anywhere (e.g. Vercel, Netlify, Deno Deploy...).

A `deploy.yml` GitHub workflow is provided, but I'd recommend using Vercel as it supports Bun and Astro out of the box, and doesn't require neither a workflow nor configuration.

## Run the Benchmark

> The actual benchmarking is still to be implemented. Check out [./scripts/benchmark.ts](./scripts/benchmark.ts) and search for `TODO`.

First, you need to clone nativelink:

```sh
git clone --depth 1 https://github.com/TraceMachina/nativelink.git nativelink
```

Next, clone TensorFlow:

```sh
git clone --depth 1 https://github.com/tensorflow/tensorflow.git tensorflow
```

Finally, run:

```sh
bun run benchmark
```

## More information

### The benchmark files specification

The Astro project is configured with a custom loader that will prepare the benchmark data found in `src/benchmarks/`. The benchmark data must be assigned to a category, so the project can properly group benchmarks and present them in different pages, with an additional index page with all of the links to the categories.

The `src/benchmarks/` looks like this:

```sh
src/benchmarks/
  <category-id>.json # a JSON that defines the category (only "title" is supported as of now)
  <category-id>/<benchmark-id>.jsonl # a JSONL that holds the benchmark definition and the benchmarking data
```

Some examples:

#### The category file (e.g. `src/benchmarks/building.json`)

```json
{ "title": "Building" }
```

#### The benchmark file (e.g. `src/benchmarks/building/time-to-build.json`)

```jsonl
{"title": "Time to build", "series": [{}, {"label":"Build time (seconds)"}], "axes": [{"label":"Time"}, {"label":"Build time (seconds)"}]}
{"timestamp": 1746005785627, "value": 62.9, "commitHash": "d44afee804a688116ea0389902d30e1d9dbfbb95", "commitMessage": "Improve error handling in forms (#904)"}
{"timestamp": 1746005886627, "value": 65.3, "commitHash": "749b622126ffc89371b23e66d89421ffbcda18fe", "commitMessage": "Improve logging for error tracking (#275)"}
```

The first JSON must define:

- The `title` of the benchmark
- The `series` of the plot, which is an array of `{ label?: string; stroke?: string; }`
  - The first series is the time series
  - The second is the benchmark values
- The `axes` of the plot, which is an array of `{ label?: string; }`

The rest of the lines are JSON that define the benchmark data for a given commit:

- The `timestamp` of the benchmark
- The `value` of the benchmark (aka, the time it took to run)
- The `commitHash` and `commitMessage`, used to present additional information in the plot


### Adding new benchmarks

First of all, create the `src/benchmarks/<category>.json`, if the category doesn't exist yet. Then, create a `src/benchmarks/<category>/<benchmark>.jsonl` file with the heading JSON, as described above.

Then, update the GitHub workflow in order to run the new benchmarks and append the data to the `src/benchmarks/<category>/<benchmark>.jsonl` file.
