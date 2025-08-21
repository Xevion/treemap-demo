import { Box, Group, Slider, Stack, Text, Title } from '@mantine/core';
import type { TreemapControls } from '@/hooks/useTreemap';

type Props = {
  controls: TreemapControls;
  onChange: <K extends keyof TreemapControls>(key: K, value: number) => void;
};

export default function ControlsPanel({ controls, onChange }: Props) {
  return (
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
            onChange={value => onChange('targetNodeCount', value)}
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
            onChange={value => onChange('maxDepth', value)}
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
            onChange={value => onChange('minChildrenPerNode', value)}
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
            onChange={value => onChange('maxChildrenPerNode', value)}
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
            onChange={value => onChange('branchProbability', value)}
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
            onChange={value => onChange('seed', value)}
            color="teal"
          />
        </div>
      </Stack>
    </Box>
  );
}
