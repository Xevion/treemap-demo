import { Title } from '@mantine/core';
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
      <span className="path-segment" key={idx}>
        {seg}
        {idx < segments.length - 1 && '/'}
      </span>
    ));
  }, [pathText]);

  return (
    <div id="metrics-overlay" style={{ display: 'block' }}>
      <Title order={4} c="teal.3">
        Performance Metrics
      </Title>
      <div className="metric-item">
        <span className="metric-label">Data Generation Time:</span>
        <span className="metric-value" id="generation-time">
          {metrics.generationMs.toFixed(2)}
        </span>{' '}
        ms
      </div>
      <div className="metric-item">
        <span className="metric-label">Initial Render Time:</span>
        <span className="metric-value" id="render-time">
          {metrics.layoutMs.toFixed(2)}
        </span>{' '}
        ms
      </div>
      <div className="metric-item">
        <span className="metric-label">Total Nodes:</span>
        <span className="metric-value" id="node-count">
          {metrics.nodeCount.toLocaleString()}
        </span>
      </div>
      <div className="metric-item">
        <span className="metric-label">Max Depth:</span>
        <span className="metric-value" id="max-depth">
          {metrics.maxDepth}
        </span>
      </div>

      <div id="selected-path">
        <div className="metric-label">Selected Path:</div>
        <div className="path-text metric-value" id="path-display">
          {renderedPath}
        </div>
      </div>
    </div>
  );
}
