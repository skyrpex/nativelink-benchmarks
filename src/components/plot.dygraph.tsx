import Dygraph from "dygraphs";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type AlignedData = [number[], ...number[][]];

export interface CommitInfo {
  commitHash: string;
  // commitMessage: string;
  commitTitle: string;
  commitDescription: string;
  pullRequestId: number | undefined;
}

export interface PlotProps {
  title: string;
  series: uPlot.Series[];
  axes?: uPlot.Axis[];
  commits: CommitInfo[];
  data: AlignedData;
  tooltip?: (closestIdx: number) => ReactNode;
}

export const Plot = (props: PlotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const g = new Dygraph(
      containerRef.current,
      "Date,Temperature\n" +
        "2008-05-07,75\n" +
        "2008-05-08,70\n" +
        "2008-05-09,80\n",
      {},
    );
    return () => {
      g.destroy();
    };
  });

  return (
    <div className="w-full p-8">
      <div ref={containerRef} />
    </div>
  );
};
