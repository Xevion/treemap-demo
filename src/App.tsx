import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import type { MapViewState } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';
import type { ColorTuple } from '@/treemap';
import {
  createTreemapLayout,
  generateHierarchicalData,
  getColorForDepth,
  screenToNormalized,
  TreeNode,
} from '@/treemap';
import { Box, Group, Slider, Stack, Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

type RectangleData = {
  id: number;
  polygon: [number, number][];
  depth: number;
  node: TreeNode;
  path: string;
  color: ColorTuple;
};

export default function TreemapApp() {
  const [controls, setControls] = useState({
    targetNodeCount: 5000,
    maxDepth: 8,
    minChildrenPerNode: 2,
    maxChildrenPerNode: 8,
    branchProbability: 0.6,
    seed: 1,
  });
  const [pathText, setPathText] = useState<string>(
    'Hover a rectangle to see its path'
  );
  const [metrics, setMetrics] = useState({
    generationMs: 0,
    layoutMs: 0,
    nodeCount: 0,
    maxDepth: 0,
  });

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

  // Debounce heavy recompute while keeping sliders responsive
  const [debouncedTargetNodeCount] = useDebouncedValue(
    controls.targetNodeCount,
    50
  );
  const [debouncedMaxDepth] = useDebouncedValue(controls.maxDepth, 50);
  const [debouncedMinChildren] = useDebouncedValue(
    controls.minChildrenPerNode,
    50
  );
  const [debouncedMaxChildren] = useDebouncedValue(
    controls.maxChildrenPerNode,
    50
  );
  const [debouncedBranchProbability] = useDebouncedValue(
    controls.branchProbability,
    50
  );
  const [debouncedSeed] = useDebouncedValue(controls.seed, 50);

  const { rectangles, initialViewState, genMetrics, layoutMs } = useMemo(() => {
    const { root, metrics: genMetrics } = generateHierarchicalData({
      targetNodeCount: debouncedTargetNodeCount,
      maxDepth: debouncedMaxDepth,
      minChildrenPerNode: debouncedMinChildren,
      maxChildrenPerNode: debouncedMaxChildren,
      branchProbability: debouncedBranchProbability,
      seed: debouncedSeed,
    });
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
        color: getColorForDepth(item.depth, item.path, debouncedSeed),
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
  }, [
    debouncedTargetNodeCount,
    debouncedMaxDepth,
    debouncedMinChildren,
    debouncedMaxChildren,
    debouncedBranchProbability,
    debouncedSeed,
  ]);

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

  const handleControlChange = useCallback(
    <K extends keyof typeof controls>(key: K, value: number) => {
      setControls(prev => {
        const next = { ...prev, [key]: value } as typeof prev;
        if (key === 'minChildrenPerNode' && value > next.maxChildrenPerNode) {
          next.maxChildrenPerNode = value;
        } else if (
          key === 'maxChildrenPerNode' &&
          value < next.minChildrenPerNode
        ) {
          next.minChildrenPerNode = value;
        }
        return next;
      });
    },
    [setControls]
  );

  return (
    <>
      <div id="loading" style={{ display: 'none' }} />
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

        <Box mt="md" style={{ borderTop: '1px solid #444', paddingTop: 12 }}>
          <Title order={4} c="teal.3">
            Controls
          </Title>
          <Stack gap={10} mt={8} style={{ minWidth: 320 }}>
            <div>
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} className="metric-label">
                  Target Nodes
                </Text>
                <Text size="sm" className="metric-value">
                  {controls.targetNodeCount.toLocaleString()}
                </Text>
              </Group>
              <Slider
                min={100}
                max={50000}
                step={100}
                value={controls.targetNodeCount}
                onChange={value =>
                  handleControlChange('targetNodeCount', value)
                }
                color="teal"
                labelAlwaysOn
              />
            </div>

            <div>
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} className="metric-label">
                  Max Depth
                </Text>
                <Text size="sm" className="metric-value">
                  {controls.maxDepth}
                </Text>
              </Group>
              <Slider
                min={1}
                max={12}
                step={1}
                value={controls.maxDepth}
                onChange={value => handleControlChange('maxDepth', value)}
                color="teal"
              />
            </div>

            <div>
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} className="metric-label">
                  Min Children / Node
                </Text>
                <Text size="sm" className="metric-value">
                  {controls.minChildrenPerNode}
                </Text>
              </Group>
              <Slider
                min={0}
                max={20}
                step={1}
                value={controls.minChildrenPerNode}
                onChange={value =>
                  handleControlChange('minChildrenPerNode', value)
                }
                color="teal"
              />
            </div>

            <div>
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} className="metric-label">
                  Max Children / Node
                </Text>
                <Text size="sm" className="metric-value">
                  {controls.maxChildrenPerNode}
                </Text>
              </Group>
              <Slider
                min={0}
                max={30}
                step={1}
                value={controls.maxChildrenPerNode}
                onChange={value =>
                  handleControlChange('maxChildrenPerNode', value)
                }
                color="teal"
              />
            </div>

            <div>
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} className="metric-label">
                  Branch Probability
                </Text>
                <Text size="sm" className="metric-value">
                  {Math.round(controls.branchProbability * 100)}%
                </Text>
              </Group>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={controls.branchProbability}
                onChange={value =>
                  handleControlChange('branchProbability', value)
                }
                color="teal"
              />
            </div>

            <div>
              <Group justify="space-between" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} className="metric-label">
                  Seed
                </Text>
                <Text size="sm" className="metric-value">
                  {controls.seed}
                </Text>
              </Group>
              <Slider
                min={0}
                max={10000}
                step={1}
                value={controls.seed}
                onChange={value => handleControlChange('seed', value)}
                color="teal"
              />
            </div>
          </Stack>
        </Box>
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
