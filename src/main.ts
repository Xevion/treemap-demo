import { Deck } from '@deck.gl/core/typed';
import { PolygonLayer } from '@deck.gl/layers/typed';

// Color tuple type for RGBA values
type ColorTuple = [number, number, number, number];

// Coordinate tuple type for longitude/latitude
type Coordinate = [number, number];

// Tree node structure for hierarchical data
class TreeNode {
  public name: string;
  public value: number;
  public children: TreeNode[];
  public depth: number;
  public parent: TreeNode | null;

  // Layout properties (will be set by treemap algorithm)
  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  public height: number = 0;
  public area: number = 0;

  constructor(name: string, value: number = 0, depth: number = 0) {
    this.name = name;
    this.value = value;
    this.children = [];
    this.depth = depth;
    this.parent = null;
  }

  addChild(child: TreeNode): void {
    child.parent = this;
    this.children.push(child);
  }

  // Get the full hierarchical path from root to this node
  getPath(): string {
    const path: string[] = [];
    const traverse = (node: TreeNode): void => {
      if (node.parent) {
        traverse(node.parent);
      }
      path.push(node.name);
    };
    traverse(this);
    return '/' + path.join('/');
  }

  // Calculate total value including all descendants
  getTotalValue(): number {
    if (this.children.length === 0) {
      return this.value;
    }
    return this.children.reduce((sum, child) => sum + child.getTotalValue(), 0);
  }
}

// Interface for flat node representation used by Deck.gl
interface FlatNode {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  name: string;
  path: string;
}

// Interface for rectangle data structure for Deck.gl
interface RectangleData {
  id: number;
  polygon: Coordinate[];
  depth: number;
  node: TreeNode;
  path: string;
  color: ColorTuple;
}

// Interface for click/hover info from Deck.gl
interface PickingInfo {
  object?: RectangleData;
  x: number;
  y: number;
}

class TreemapVisualization {
  private deck: Deck | null = null;
  private treeData: TreeNode | null = null;
  private flatNodes: FlatNode[] = [];
  private generationTime: number = 0;
  private renderTime: number = 0;
  private nodeCount: number = 0;
  private maxDepth: number = 0;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Step 1: Generate hierarchical data
      const genStart = performance.now();
      this.treeData = this.generateHierarchicalData();
      this.generationTime = performance.now() - genStart;

      // Step 2: Create treemap layout
      this.createTreemapLayout();

      // Step 3: Initialize Deck.gl
      const renderStart = performance.now();
      await this.initializeDeckGL();
      this.renderTime = performance.now() - renderStart;

      // Step 4: Update UI
      this.updateMetricsDisplay();
      this.hideLoading();
    } catch (error) {
      console.error('Error initializing treemap visualization:', error);
    }
  }

  // Generate a large hierarchical dataset with 15,000+ nodes
  private generateHierarchicalData(): TreeNode {
    console.log('Generating hierarchical data...');

    const root = new TreeNode('root', 0, 0);
    let totalNodes = 1;
    let maxDepth = 0;

    // Generate tree structure with random branching
    const generateSubtree = (
      parent: TreeNode,
      currentDepth: number,
      remainingNodes: number
    ): number => {
      if (remainingNodes <= 0 || currentDepth > 8) return 0;

      // Random number of children (2-8 for good branching)
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

        // Recursively generate children (60% chance)
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

    // Generate until we have at least 15,000 nodes
    let attempts = 0;
    while (totalNodes < 15000 && attempts < 10) {
      const nodesToGenerate =
        15000 - totalNodes + Math.floor(Math.random() * 5000);
      generateSubtree(root, 0, nodesToGenerate);
      attempts++;
    }

    this.nodeCount = totalNodes;
    this.maxDepth = maxDepth;

    console.log(`Generated ${totalNodes} nodes with max depth ${maxDepth}`);
    return root;
  }

  // Implement treemap layout algorithm (squarified treemap)
  private createTreemapLayout(): void {
    console.log('Creating treemap layout...');

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (!this.treeData) {
      throw new Error('Tree data not initialized');
    }

    // Set root dimensions
    this.treeData.x = 0;
    this.treeData.y = 0;
    this.treeData.width = width;
    this.treeData.height = height;
    this.treeData.area = width * height;

    this.flatNodes = [];
    this.layoutNode(this.treeData);

    console.log(
      `Layout complete. ${this.flatNodes.length} rectangles created.`
    );
  }

  // Recursive function to layout each node using simple rectangular subdivision
  private layoutNode(node: TreeNode): void {
    if (!node) return;

    // Add current node to flat list for rendering
    this.flatNodes.push({
      node: node,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      depth: node.depth,
      name: node.name,
      path: node.getPath(),
    });

    // If no children, we're done
    if (node.children.length === 0) return;

    // Calculate total value of all children
    const totalChildValue = node.children.reduce(
      (sum, child) => sum + child.getTotalValue(),
      0
    );

    if (totalChildValue === 0) return;

    // Sort children by value (descending) for better layout
    const sortedChildren = [...node.children].sort(
      (a, b) => b.getTotalValue() - a.getTotalValue()
    );

    // Use simple horizontal/vertical subdivision based on aspect ratio
    const useHorizontal = node.width > node.height;

    let offset = 0;
    const availableSize = useHorizontal ? node.width : node.height;

    for (const child of sortedChildren) {
      const childValue = child.getTotalValue();
      const proportion = childValue / totalChildValue;
      const childSize = availableSize * proportion;

      if (useHorizontal) {
        // Horizontal subdivision
        child.x = node.x + offset;
        child.y = node.y;
        child.width = childSize;
        child.height = node.height;
      } else {
        // Vertical subdivision
        child.x = node.x;
        child.y = node.y + offset;
        child.width = node.width;
        child.height = childSize;
      }

      child.area = child.width * child.height;
      offset += childSize;

      // Recursively layout children
      this.layoutNode(child);
    }
  }

  // Convert screen coordinates to normalized coordinates for Deck.gl
  private screenToNormalized(x: number, y: number): Coordinate {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Convert to normalized coordinates (-180 to 180, -85 to 85)
    const longitude = ((x - centerX) / centerX) * 180;
    const latitude = -((y - centerY) / centerY) * 85; // Negative because screen Y is flipped

    return [longitude, latitude];
  }

  // Initialize Deck.gl with treemap layer
  private async initializeDeckGL(): Promise<void> {
    console.log('Initializing Deck.gl...');

    // Create rectangles data for Deck.gl with normalized coordinates
    const rectangles: RectangleData[] = this.flatNodes.map((item, index) => {
      // Convert rectangle corners to normalized coordinates
      const topLeft = this.screenToNormalized(item.x, item.y);
      const topRight = this.screenToNormalized(item.x + item.width, item.y);
      const bottomRight = this.screenToNormalized(
        item.x + item.width,
        item.y + item.height
      );
      const bottomLeft = this.screenToNormalized(item.x, item.y + item.height);

      return {
        id: index,
        polygon: [topLeft, topRight, bottomRight, bottomLeft],
        depth: item.depth,
        node: item.node,
        path: item.path,
        // Color based on depth with some variation
        color: this.getColorForDepth(item.depth),
      };
    });

    // Create custom polygon layer for rectangles
    const treemapLayer = new PolygonLayer<RectangleData>({
      id: 'treemap-layer',
      data: rectangles,
      filled: true,
      stroked: true,
      getPolygon: (d: RectangleData) => d.polygon,
      getFillColor: (d: RectangleData) => d.color,
      getLineColor: [255, 255, 255, 80],
      getLineWidth: 1,
      pickable: true,
      onClick: this.handleClick.bind(this),
      onHover: this.handleHover.bind(this),
      autoHighlight: true,
      highlightColor: [255, 255, 255, 100],
    });

    // Initialize Deck.gl with standard Web Mercator projection
    this.deck = new Deck({
      initialViewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1,
        bearing: 0,
        pitch: 0,
      },
      // Disable pan/zoom controls completely
      controller: false,
      layers: [treemapLayer],
      getCursor: () => 'default',
    });

    console.log('Deck.gl initialization complete');
  }

  // Generate color based on depth in hierarchy
  private getColorForDepth(depth: number): ColorTuple {
    const colors: ColorTuple[] = [
      [255, 87, 87, 200], // Red
      [255, 193, 7, 200], // Amber
      [76, 175, 80, 200], // Green
      [33, 150, 243, 200], // Blue
      [156, 39, 176, 200], // Purple
      [255, 152, 0, 200], // Orange
      [0, 150, 136, 200], // Teal
      [121, 85, 72, 200], // Brown
      [96, 125, 139, 200], // Blue Grey
    ];

    const baseColor = colors[depth % colors.length];
    // Add some random variation
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

  // Handle click events on treemap rectangles
  private handleClick(info: PickingInfo): void {
    if (!info.object) return;

    const clickedNode = info.object.node;
    const path = clickedNode.getPath();

    console.log('Clicked node:', clickedNode.name, 'Path:', path);

    // Update path display
    const pathDisplay = document.getElementById('path-display');
    if (pathDisplay) {
      pathDisplay.textContent = path;
    }
  }

  // Handle hover events on treemap rectangles
  private handleHover(info: PickingInfo): void {
    if (info.object) {
      // Change cursor to pointer when hovering over a rectangle
      const canvas = this.deck?.getCanvas();
      if (canvas) {
        canvas.style.cursor = 'pointer';
      }
    } else {
      // Reset cursor when not hovering over anything
      const canvas = this.deck?.getCanvas();
      if (canvas) {
        canvas.style.cursor = 'default';
      }
    }
  }

  // Update the metrics display overlay
  private updateMetricsDisplay(): void {
    const generationTimeEl = document.getElementById('generation-time');
    const renderTimeEl = document.getElementById('render-time');
    const nodeCountEl = document.getElementById('node-count');
    const maxDepthEl = document.getElementById('max-depth');

    if (generationTimeEl) {
      generationTimeEl.textContent = this.generationTime.toFixed(2);
    }
    if (renderTimeEl) {
      renderTimeEl.textContent = this.renderTime.toFixed(2);
    }
    if (nodeCountEl) {
      nodeCountEl.textContent = this.nodeCount.toLocaleString();
    }
    if (maxDepthEl) {
      maxDepthEl.textContent = this.maxDepth.toString();
    }

    // Add debug info
    console.log('Treemap data:', {
      nodeCount: this.nodeCount,
      rectangles: this.flatNodes.length,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      sampleRectangle: this.flatNodes[0],
    });

    // Show the metrics overlay
    const metricsOverlay = document.getElementById('metrics-overlay');
    if (metricsOverlay) {
      metricsOverlay.style.display = 'block';
    }
  }

  // Hide loading indicator
  private hideLoading(): void {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }
}

// Initialize the visualization when page loads
window.addEventListener('load', () => {
  console.log('Page loaded, starting treemap visualization...');
  new TreemapVisualization();
});

// Handle window resize
window.addEventListener('resize', () => {
  // For simplicity, reload on resize
  location.reload();
});
