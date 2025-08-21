import type { TreemapMetrics } from '@/hooks/useTreemap';
import { useMemo } from 'react';

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

  return (
    <div>
      <h4 className="text-teal-300 font-semibold mb-2">Performance Metrics</h4>
      <div className="mb-2">
        <span className="font-semibold text-teal-200">
          Data Generation Time:
        </span>
        <span className="text-teal-100 ml-1" id="generation-time">
          {metrics.generationMs.toFixed(2)}
        </span>{' '}
        ms
      </div>
      <div className="mb-2">
        <span className="font-semibold text-teal-200">
          Initial Render Time:
        </span>
        <span className="text-teal-100 ml-1" id="render-time">
          {metrics.layoutMs.toFixed(2)}
        </span>{' '}
        ms
      </div>
      <div className="mb-2">
        <span className="font-semibold text-teal-200">Total Nodes:</span>
        <span className="text-teal-100 ml-1" id="node-count">
          {metrics.nodeCount.toLocaleString()}
        </span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-teal-200">Max Depth:</span>
        <span className="text-teal-100 ml-1" id="max-depth">
          {metrics.maxDepth}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="font-semibold text-teal-200">Selected Path:</div>
        <div
          className="text-teal-100 break-words max-w-[350px]"
          id="path-display"
        >
          {renderedPath}
        </div>
      </div>
    </div>
  );
}
