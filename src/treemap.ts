// Core types used by the treemap
export type ColorTuple = [number, number, number, number];

export type Coordinate = [number, number];

export interface FlatNode {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  name: string;
  path: string;
}

export class TreeNode {
  public name: string;
  public value: number;
  public children: TreeNode[] = [];
  public depth: number;
  public parent: TreeNode | null = null;

  // Layout properties (will be set by treemap algorithm)
  public x = 0;
  public y = 0;
  public width = 0;
  public height = 0;
  public area = 0;

  constructor(name: string, value: number = 0, depth: number = 0) {
    this.name = name;
    this.value = value;
    this.depth = depth;
  }

  addChild(child: TreeNode): void {
    child.parent = this;
    this.children.push(child);
  }

  getPath(): string {
    const path: string[] = [];
    const traverse = (node: TreeNode): void => {
      if (node.parent) traverse(node.parent);
      path.push(node.name);
    };
    traverse(this);
    return '/' + path.join('/');
  }

  getTotalValue(): number {
    if (this.children.length === 0) return this.value;
    return this.children.reduce((sum, child) => sum + child.getTotalValue(), 0);
  }
}

export type TreemapMetrics = {
  nodeCount: number;
  maxDepth: number;
  generationMs: number;
  layoutMs: number;
};

export function generateHierarchicalData(): {
  root: TreeNode;
  metrics: Pick<TreemapMetrics, 'nodeCount' | 'maxDepth' | 'generationMs'>;
} {
  const start = performance.now();

  const root = new TreeNode('root', 0, 0);
  let totalNodes = 1;
  let maxDepth = 0;

  const generateSubtree = (
    parent: TreeNode,
    currentDepth: number,
    remainingNodes: number
  ): number => {
    if (remainingNodes <= 0 || currentDepth > 8) return 0;

    const numChildren = Math.min(
      Math.floor(Math.random() * 7) + 2,
      remainingNodes
    );
    let usedNodes = 0;

    for (let i = 0; i < numChildren && usedNodes < remainingNodes; i++) {
      const childName = `node_${totalNodes}`;
      const childValue = Math.floor(Math.random() * 100) + 10;
      const child = new TreeNode(childName, childValue, currentDepth + 1);

      parent.addChild(child);
      totalNodes++;
      usedNodes++;
      maxDepth = Math.max(maxDepth, currentDepth + 1);

      if (Math.random() > 0.4 && currentDepth < 6) {
        const childrenToGenerate = Math.floor(
          (remainingNodes - usedNodes) / numChildren
        );
        usedNodes += generateSubtree(
          child,
          currentDepth + 1,
          childrenToGenerate
        );
      }
    }
    return usedNodes;
  };

  let attempts = 0;
  while (totalNodes < 15000 && attempts < 10) {
    const nodesToGenerate =
      15000 - totalNodes + Math.floor(Math.random() * 5000);
    generateSubtree(root, 0, nodesToGenerate);
    attempts++;
  }

  const generationMs = performance.now() - start;

  return {
    root,
    metrics: { nodeCount: totalNodes, maxDepth, generationMs },
  };
}

export function createTreemapLayout(root: TreeNode): {
  flatNodes: FlatNode[];
  layoutMs: number;
} {
  const start = performance.now();

  const width = window.innerWidth;
  const height = window.innerHeight;

  root.x = 0;
  root.y = 0;
  root.width = width;
  root.height = height;
  root.area = width * height;

  const flatNodes: FlatNode[] = [];

  const layoutNode = (node: TreeNode): void => {
    if (!node) return;

    flatNodes.push({
      node,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      depth: node.depth,
      name: node.name,
      path: node.getPath(),
    });

    if (node.children.length === 0) return;

    const totalChildValue = node.children.reduce(
      (sum, child) => sum + child.getTotalValue(),
      0
    );
    if (totalChildValue === 0) return;

    const sortedChildren = [...node.children].sort(
      (a, b) => b.getTotalValue() - a.getTotalValue()
    );

    const useHorizontal = node.width > node.height;
    let offset = 0;
    const availableSize = useHorizontal ? node.width : node.height;

    for (const child of sortedChildren) {
      const childValue = child.getTotalValue();
      const proportion = childValue / totalChildValue;
      const childSize = availableSize * proportion;

      if (useHorizontal) {
        child.x = node.x + offset;
        child.y = node.y;
        child.width = childSize;
        child.height = node.height;
      } else {
        child.x = node.x;
        child.y = node.y + offset;
        child.width = node.width;
        child.height = childSize;
      }

      child.area = child.width * child.height;
      offset += childSize;

      layoutNode(child);
    }
  };

  layoutNode(root);

  const layoutMs = performance.now() - start;
  return { flatNodes, layoutMs };
}

export function screenToNormalized(x: number, y: number): Coordinate {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const longitude = ((x - centerX) / centerX) * 180;
  const latitude = -((y - centerY) / centerY) * 85;
  return [longitude, latitude];
}

export function getColorForDepth(depth: number): ColorTuple {
  const colors: ColorTuple[] = [
    [255, 87, 87, 200],
    [255, 193, 7, 200],
    [76, 175, 80, 200],
    [33, 150, 243, 200],
    [156, 39, 176, 200],
    [255, 152, 0, 200],
    [0, 150, 136, 200],
    [121, 85, 72, 200],
    [96, 125, 139, 200],
  ];
  const baseColor = colors[depth % colors.length];
  const variation = 30;
  return [
    Math.max(
      0,
      Math.min(255, baseColor[0] + (Math.random() - 0.5) * variation)
    ),
    Math.max(
      0,
      Math.min(255, baseColor[1] + (Math.random() - 0.5) * variation)
    ),
    Math.max(
      0,
      Math.min(255, baseColor[2] + (Math.random() - 0.5) * variation)
    ),
    baseColor[3],
  ];
}
