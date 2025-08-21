# treemap-demo

A high-performance hierarchical treemap visualization using Deck.gl with 15,000+ nodes. Demonstrates efficient WebGL-based rendering of large hierarchical datasets.

## Features

- **15,000+ nodes**: Generates complex hierarchical tree structures
- **WebGL rendering**: Uses Deck.gl for high-performance visualization
- **Interactive**: Click rectangles to see hierarchical paths
- **Performance metrics**: Real-time generation and render timing
- **Responsive**: Adapts to window size changes

## Tech Stack

- **Frontend**: TypeScript, Vite
- **Visualization**: Deck.gl, WebGL
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, Husky

## Prerequisites

- Node.js v22.18+ (I use `mise` for tool management)
- pnpm package manager

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd dirstat-demo

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Run type check, lint, and format check
```

## Deployment

The project automatically deploys to GitHub Pages on pushes to `main` or `master` branches via GitHub Actions.

## Browser Support

- Modern browsers with WebGL support
- Chrome 50+, Firefox 51+, Safari 10+, Edge 79+
