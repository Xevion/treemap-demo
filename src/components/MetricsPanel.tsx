import type { TreemapMetrics } from '@/hooks/useTreemap';
import { ReactNode, useMemo } from 'react';

type Props = {
  metrics: TreemapMetrics;
  pathText: string;
};

export default function MetricsPanel({ metrics, pathText }: Props) {
  const renderedPath = useMemo(() => {
    if (!pathText) return null;
    const segments = pathText.split('/').filter(Boolean);
    return segments.map((seg, idx) => (
      <span className="whitespace-nowrap" key={idx}>
        {seg}
        {idx < segments.length - 1 && '/'}
      </span>
    ));
  }, [pathText]);

  type Metric = [ReactNode, ReactNode];
  const metricItems: Metric[] = useMemo(
    () => [
      ['Data Generation Time', `${metrics.generationMs.toFixed(2)}ms`],
      ['Layout Render Time', `${metrics.layoutMs.toFixed(2)}ms`],
      ['Total Nodes', metrics.nodeCount.toLocaleString()],
      ['Max Depth', metrics.maxDepth],
    ],
    [metrics]
  );

  return (
    <div>
      <h2 className="text-xl font-semibold">Performance</h2>
      <div className="flex flex-col gap-y-1 ml-2">
        {metricItems.map(([name, value], idx) => (
          <dl key={idx}>
            <dt className="inline text-teal-100">{name}:</dt>
            <dd className="inline ml-1">{value}</dd>
          </dl>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-teal-100">Selected Path:</div>
        <div className="break-words max-w-[350px] ml-2 line-clamp-4 min-h-19">
          {renderedPath}
        </div>
      </div>
    </div>
  );
}
