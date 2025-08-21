import { useCallback, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import type { MapViewState } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';
import type { RectangleData } from '@/treemap';
import ControlsPanel from '@/components/ControlsPanel';
import MetricsPanel from '@/components/MetricsPanel';
import useTreemap, { type TreemapControls } from '@/hooks/useTreemap';

export default function TreemapApp() {
  const [controls, setControls] = useState<TreemapControls>({
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

  const { rectangles, initialViewState, metrics } = useTreemap(controls);

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
      <div className="absolute top-5 left-5 z-[1000] min-w-72 rounded-md bg-black/80 p-4 shadow-md text-zinc-100">
        <MetricsPanel metrics={metrics} pathText={pathText} />
        <ControlsPanel controls={controls} onChange={handleControlChange} />
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
