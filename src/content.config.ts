import fs from "node:fs/promises";
import { defineCollection, z } from "astro:content";
import { parseBechmarksJsonl } from "./utils/parse-benchmarks-jsonl.ts";

const jsonStringSchema = z.string().transform((str, ctx): unknown => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

const categorySchema = z.object({
  title: z.string(),
});

const getIdFromCategoryFilename = (filename: string) => {
  const results = filename.match(/^\.\/benchmarks\/(.+?)\.json$/);
  if (!results) {
    throw new Error();
  }
  return results[1];
};

const getIdFromBenchmarkFilename = (filename: string) => {
  const results = filename.match(/^\.\/benchmarks\/(.+?)\/(.+?)\.jsonl$/);
  if (!results) {
    throw new Error();
  }
  return {
    categoryId: results[1],
    benchmarkId: results[2],
  };
};

const benchmarksByCategory = defineCollection({
  loader: async () => {
    const categoryFiles = import.meta.glob("./benchmarks/*.json", {
      query: "?raw",
      import: "default",
    });
    const categories = await Promise.all(
      Object.entries(categoryFiles).map(async ([filename, getContents]) => {
        const id = getIdFromCategoryFilename(filename);
        const contents = await fs.readFile(
          new URL(filename, import.meta.url),
          "utf-8",
        );
        const category = jsonStringSchema.pipe(categorySchema).parse(contents);
        return {
          id,
          category: category.title,
        };
      }),
    );
    const benchmarkFiles = import.meta.glob("./benchmarks/*/*.jsonl", {
      query: "?raw",
      import: "default",
    });
    const benchmarks = await Promise.all(
      Object.entries(benchmarkFiles).map(async ([filename, getContents]) => {
        const ids = getIdFromBenchmarkFilename(filename);
        const contents = await fs.readFile(
          new URL(filename, import.meta.url),
          "utf-8",
        );
        if (typeof contents !== "string") {
          throw new Error();
        }
        const benchmark = parseBechmarksJsonl(contents);
        return {
          ...ids,
          ...benchmark,
        };
      }),
    );

    const benchmarksByCategory = Object.groupBy(
      benchmarks,
      (benchmark) => benchmark.categoryId,
    );

    return categories.map((category) => {
      return {
        ...category,
        benchmarks: benchmarksByCategory[category.id] ?? [],
      };
    });
  },
  schema: z.object({
    category: z.string(),
    benchmarks: z.array(
      z.object({
        title: z.string(),
        benchmarkId: z.string(),
        timestamps: z.array(z.number()),
        values: z.array(z.number()),
        series: z.array(
          z.object({
            label: z.string().optional(),
            stroke: z.string().optional(),
          }),
        ),
        axes: z.array(
          z.object({
            label: z.string().optional(),
          }),
        ),
        commits: z.array(
          z.object({
            commitHash: z.string(),
            commitTitle: z.string(),
            commitDescription: z.string(),
            pullRequestId: z.number().optional(),
          }),
        ),
      }),
    ),
  }),
});

export const collections = { benchmarksByCategory };
