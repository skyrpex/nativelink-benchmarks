import { z } from "astro:content";

const findPullRequestIdFromCommitMessage = (commitMessage: string) => {
  const results = commitMessage.match(/#([0-9]+)/);
  if (!results) {
    return;
  }

  return Number.parseInt(results[1]);
};

const jsonStringSchema = z.string().transform((str, ctx): unknown => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

const headerSchema = z.object({
  title: z.string(),
  series: z.array(z.any()),
  axes: z.array(z.any()),
});

const lineToHeader = jsonStringSchema.pipe(headerSchema);

const itemSchema = z.object({
  timestamp: z.number(),
  value: z.number(),
  commitHash: z.string(),
  commitMessage: z.string(),
});

const lineToItem = jsonStringSchema.pipe(itemSchema);

export const parseBechmarksJsonl = (data: string) => {
  const timestamps = new Array<number>();
  const values = new Array<number>();
  const commits = new Array<{
    commitHash: string;
    commitTitle: string;
    commitDescription: string;
    pullRequestId: number | undefined;
  }>();

  const [headerLine, ...itemLines] = data.split("\n");
  const header = lineToHeader.parse(headerLine);

  for (const line of itemLines) {
    if (!line) {
      continue;
    }

    const item = lineToItem.parse(line);
    timestamps.push(item.timestamp / 1000);
    values.push(item.value);
    const [commitTitle, ...commitDescription] = item.commitMessage.split("\n");
    commits.push({
      commitHash: item.commitHash,
      commitTitle,
      commitDescription: commitDescription.join("\n"),
      pullRequestId: findPullRequestIdFromCommitMessage(item.commitMessage),
    });
  }

  return {
    ...header,
    timestamps,
    values,
    commits,
  };
};
