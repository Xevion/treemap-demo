import { useMemo } from 'react';
import type { MapViewState } from '@deck.gl/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  createTreemapLayout,
  generateHierarchicalData,
  getColorForDepth,
  screenToNormalized,
  type RectangleData,
} from '@/treemap';

export type TreemapControls = {
  targetNodeCount: number;
  maxDepth: number;
  minChildrenPerNode: number;
  maxChildrenPerNode: number;
  branchProbability: number;
  seed: number;
};

export type TreemapMetrics = {
  generationMs: number;
  layoutMs: number;
  nodeCount: number;
  maxDepth: number;
};

type UseTreemapResult = {
  rectangles: RectangleData[];
  initialViewState: MapViewState;
  metrics: TreemapMetrics;
};

export function useTreemap(controls: TreemapControls): UseTreemapResult {
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

  const { rectangles, initialViewState, metrics } = useMemo(() => {
    const { root, metrics: genMetrics } = generateHierarchicalData({
      targetNodeCount: debouncedTargetNodeCount,
      maxDepth: debouncedMaxDepth,
      minChildrenPerNode: debouncedMinChildren,
      maxChildrenPerNode: debouncedMaxChildren,
      branchProbability: debouncedBranchProbability,
      seed: debouncedSeed,
    });

    const { flatNodes, layoutMs } = createTreemapLayout(root);

    const rectangles: RectangleData[] = flatNodes.map((item, index) => {
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
      };
    });

    const initialViewState: MapViewState = {
      longitude: 0,
      latitude: 0,
      zoom: 1,
      bearing: 0,
      pitch: 0,
    };

    return {
      rectangles,
      initialViewState,
      metrics: {
        generationMs: genMetrics.generationMs,
        layoutMs,
        nodeCount: genMetrics.nodeCount,
        maxDepth: genMetrics.maxDepth,
      },
    };
  }, [
    debouncedTargetNodeCount,
    debouncedMaxDepth,
    debouncedMinChildren,
    debouncedMaxChildren,
    debouncedBranchProbability,
    debouncedSeed,
  ]);

  return { rectangles, initialViewState, metrics };
}

export default useTreemap;
