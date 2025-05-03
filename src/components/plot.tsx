import "uplot/dist/uPlot.min.css";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type uPlot from "uplot";
import UplotReact from "uplot-react";
import { useResizeObserver } from "../hooks/use-resize-observer.ts";

const PLOT_HEIGHT_PX = 400;

type AlignedData = [number[], ...number[][]];

export interface CommitInfo {
  commitHash: string;
  commitTitle: string;
  commitDescription: string;
  pullRequestId?: number;
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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();
  const chart = useRef<uPlot>(null);
  useEffect(() => {
    if (!chart.current) {
      return;
    }

    chart.current.setSize({
      width: size.width,
      height: chart.current.height,
    });
  }, [size]);

  const [closestIdx, setClosestIdx] = useState<number>();

  const options = useMemo<uPlot.Options>(() => {
    return {
      title: props.title,
      width: 0,
      height: PLOT_HEIGHT_PX,
      series: props.series,
      axes: props.axes,
      plugins: [
        {
          hooks: {
            init: [
              (chart) => {
                const { over } = chart;
                over.addEventListener("mouseleave", () => {
                  // biome-ignore lint/style/noNonNullAssertion: safe to assume it is defined
                  const tooltip = tooltipRef.current!;
                  tooltip.style.display = "none";
                });
                over.addEventListener("mouseenter", () => {
                  // biome-ignore lint/style/noNonNullAssertion: safe to assume it is defined
                  const tooltip = tooltipRef.current!;
                  tooltip.style.display = "block";
                });
              },
            ],
            setCursor: [
              (chart) => {
                const { idx } = chart.cursor;
                if (idx == null) {
                  return;
                }

                setClosestIdx(idx);

                const serieIdx = 1;
                const serie = chart.series[serieIdx];

                // biome-ignore lint/style/noNonNullAssertion: safe to assume it is defined
                const tooltip = tooltipRef.current!;

                const xVal = chart.data[0][idx];
                // biome-ignore lint/style/noNonNullAssertion: safe to assume it is defined
                const yVal = chart.data[serieIdx][idx]!;

                // tooltip.textContent = `(oh ${xVal}, ${yVal})`;

                tooltip.style.left = `${Math.round(chart.valToPos(xVal, "x"))}px`;
                tooltip.style.top = `${
                  // biome-ignore lint/style/noNonNullAssertion: safe to assume it is defined
                  Math.round(chart.valToPos(yVal, serie.scale!))
                }px`;
              },
            ],
          },
        },
      ],
    };
  }, [props]);

  const commit = useMemo(() => {
    if (!closestIdx) {
      return;
    }

    return props.commits.at(closestIdx);
  }, [props.commits, closestIdx]);

  return (
    <div className="w-full p-8">
      <div ref={containerRef} className="w-full">
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none p-1 z-10 transition-all"
        >
          {commit && (
            <div className="bg-indigo-50 border rounded shadow text-xs px-3 py-2">
              <div>{commit.commitTitle}</div>
              <div className="whitespace-pre-line">
                {commit.commitDescription}
              </div>
            </div>
          )}
        </div>

        {/* <div className="w-full" style={{ height: `${PLOT_HEIGHT_PX}px` }}> */}
        <UplotReact
          options={options}
          data={props.data}
          onCreate={(uplot) => {
            chart.current = uplot;

            // biome-ignore lint/style/noNonNullAssertion: safe to assume it is defined
            uplot.over.appendChild(tooltipRef.current!);
          }}
        />
        {/* </div> */}
      </div>
    </div>
  );
};
