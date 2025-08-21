import { useEffect, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import type { MapViewState } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';
import type { ColorTuple } from './treemap';
import {
  createTreemapLayout,
  generateHierarchicalData,
  getColorForDepth,
  screenToNormalized,
  TreeNode,
} from './treemap';

type RectangleData = {
  id: number;
  polygon: [number, number][];
  depth: number;
  node: TreeNode;
  path: string;
  color: ColorTuple;
};

export default function TreemapApp() {
  const [pathText, setPathText] = useState<string>(
    'Hover a rectangle to see its path'
  );
  const [metrics, setMetrics] = useState({
    generationMs: 0,
    layoutMs: 0,
    nodeCount: 0,
    maxDepth: 0,
  });

  const { rectangles, initialViewState, genMetrics, layoutMs } = useMemo(() => {
    const { root, metrics: genMetrics } = generateHierarchicalData();
    const { flatNodes, layoutMs } = createTreemapLayout(root);

    const rectangles = flatNodes.map((item, index) => {
      const topLeft = screenToNormalized(item.x, item.y);
      const topRight = screenToNormalized(item.x + item.width, item.y);
      const bottomRight = screenToNormalized(
        item.x + item.width,
        item.y + item.height
      );
      const bottomLeft = screenToNormalized(item.x, item.y + item.height);
      return {
        id: index,
        polygon: [topLeft, topRight, bottomRight, bottomLeft],
        depth: item.depth,
        node: item.node,
        path: item.path,
        color: getColorForDepth(item.depth),
      } satisfies RectangleData;
    });

    return {
      rectangles,
      initialViewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1,
        bearing: 0,
        pitch: 0,
      },
      genMetrics,
      layoutMs,
    };
  }, []);

  useEffect(() => {
    setMetrics({
      generationMs: genMetrics.generationMs,
      layoutMs,
      nodeCount: genMetrics.nodeCount,
      maxDepth: genMetrics.maxDepth,
    });
  }, [genMetrics, layoutMs]);

  const layer = useMemo(
    () =>
      new PolygonLayer<RectangleData>({
        id: 'treemap-layer',
        data: rectangles,
        filled: true,
        stroked: true,
        getPolygon: d => d.polygon,
        getFillColor: d => d.color,
        getLineColor: [255, 255, 255, 80],
        getLineWidth: 1,
        pickable: true,
        onHover: info => {
          if (info.object) setPathText(info.object.path);
        },
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
      }),
    [rectangles]
  );

  return (
    <>
      <div id="loading" style={{ display: 'none' }} />
      <div id="metrics-overlay" style={{ display: 'block' }}>
        <h3>Performance Metrics</h3>
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
            {pathText}
          </div>
        </div>
      </div>

      <DeckGL
        initialViewState={initialViewState as unknown as MapViewState}
        controller={false}
        layers={[layer]}
        getCursor={() => 'default'}
        style={{ position: 'absolute', inset: '0' }}
      />
    </>
  );
}
