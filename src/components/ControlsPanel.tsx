import { Group, Slider, Text } from '@mantine/core';
import type { TreemapControls } from '@/hooks/useTreemap';

type Props = {
  controls: TreemapControls;
  onChange: <K extends keyof TreemapControls>(key: K, value: number) => void;
};

export default function ControlsPanel({ controls, onChange }: Props) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-700 min-w-80">
      <div className="flex flex-col gap-2 m-2">
        <div>
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={500} className="font-semibold text-teal-100">
              Target Nodes
            </Text>
            <Text size="sm" className="text-teal-100">
              {controls.targetNodeCount.toLocaleString()}
            </Text>
          </Group>
          <Slider
            min={100}
            max={50000}
            step={100}
            value={controls.targetNodeCount}
            onChange={value => onChange('targetNodeCount', value)}
            color="teal"
            labelAlwaysOn
          />
        </div>

        <div>
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={500} className="font-semibold text-teal-200">
              Max Depth
            </Text>
            <Text size="sm" className="text-teal-100">
              {controls.maxDepth}
            </Text>
          </Group>
          <Slider
            min={1}
            max={12}
            step={1}
            value={controls.maxDepth}
            onChange={value => onChange('maxDepth', value)}
            color="teal"
          />
        </div>

        <div>
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={500} className="font-semibold text-teal-200">
              Min Children / Node
            </Text>
            <Text size="sm" className="text-teal-100">
              {controls.minChildrenPerNode}
            </Text>
          </Group>
          <Slider
            min={0}
            max={20}
            step={1}
            value={controls.minChildrenPerNode}
            onChange={value => onChange('minChildrenPerNode', value)}
            color="teal"
          />
        </div>

        <div>
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={500} className="font-semibold text-teal-200">
              Max Children / Node
            </Text>
            <Text size="sm" className="text-teal-100">
              {controls.maxChildrenPerNode}
            </Text>
          </Group>
          <Slider
            min={0}
            max={30}
            step={1}
            value={controls.maxChildrenPerNode}
            onChange={value => onChange('maxChildrenPerNode', value)}
            color="teal"
          />
        </div>

        <div>
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={500} className="font-semibold text-teal-200">
              Branch Probability
            </Text>
            <Text size="sm" className="text-teal-100">
              {Math.round(controls.branchProbability * 100)}%
            </Text>
          </Group>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={controls.branchProbability}
            onChange={value => onChange('branchProbability', value)}
            color="teal"
          />
        </div>

        <div>
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={500} className="font-semibold text-teal-200">
              Seed
            </Text>
            <Text size="sm" className="text-teal-100">
              {controls.seed}
            </Text>
          </Group>
          <Slider
            min={0}
            max={10000}
            step={1}
            value={controls.seed}
            onChange={value => onChange('seed', value)}
            color="teal"
          />
        </div>
      </div>
    </div>
  );
}
