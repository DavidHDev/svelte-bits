# 🌊 CellWave

**Interactive Fluid Dynamics Simulator** - A pure JavaScript implementation of fluid dynamics with support for both square and hexagonal grid systems.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)]()
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://newjordan.github.io/cellwave/demo/)

> **[🚀 Try the Live Demo](https://newjordan.github.io/cellwave/demo/)**

---

## 📸 Gallery

<div align="center">

### Video Demonstration

<video src="https://github.com/user-attachments/assets/cellwave_1.mp4" controls width="100%" style="max-width: 800px;">
  Your browser does not support the video tag. [Download the video](assets/screenshots/cellwave_1.mp4)
</video>

> **Note:** If the video doesn't play above, you can [watch it directly here](assets/screenshots/cellwave_1.mp4) or try the [live demo](https://newjordan.github.io/cellwave/demo/)!

### Animated GIFs

![Fluid Flow Animation](assets/screenshots/sq_waterflow_1.gif)

### Static Examples

<table>
  <tr>
    <td><img src="assets/screenshots/ex_1.png" alt="Example 1" width="250"/></td>
    <td><img src="assets/screenshots/ex_2.png" alt="Example 2" width="250"/></td>
    <td><img src="assets/screenshots/ex_3.png" alt="Example 3" width="250"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/ex_4.png" alt="Example 4" width="250"/></td>
    <td><img src="assets/screenshots/ex_5.png" alt="Example 5" width="250"/></td>
    <td><img src="assets/screenshots/ex_6.png" alt="Example 6" width="250"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/ex_7.png" alt="Example 7" width="250"/></td>
    <td><img src="assets/screenshots/ex_8.png" alt="Example 8" width="250"/></td>
    <td><img src="assets/screenshots/ex_9.png" alt="Example 9" width="250"/></td>
  </tr>
</table>

</div>

---

## ✨ Features

- **🔷 Dual Grid Systems**: Switch between square and hexagonal grids in real-time
- **🌀 Multiple Force Types**: Currents, emitters, obstacles, and multi-layered noise
- **📐 Hexagonal Grid Physics**: Based on academic research ([Hamilton & Torin, 2014](https://doi.org/10.1016/j.jcp.2014.01.024))
- **🎨 Real-time Visualization**: Beautiful fluid flow rendering with customizable parameters
- **🚫 Zero Dependencies**: Pure JavaScript, no external libraries required
- **⚡ Performance Optimized**: Quadtree spatial partitioning for efficient computation
- **🎮 Interactive Controls**: Click, drag, and right-click to manipulate the simulation
- **🎵 Procedural Noise**: 3D Simplex noise for natural flow patterns

---

## 🚀 Quick Start

### Try Online

**[Launch Live Demo →](https://newjordan.github.io/cellwave/demo/)**

No installation required! Try it directly in your browser.

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/newjordan/cellwave.git
cd cellwave
```

2. Start a local HTTP server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Or using npm script
npm run dev
```

3. Open your browser to:
```
http://localhost:8000/demo/
```

### Direct Usage

Simply open `demo/index.html` in your browser after starting an HTTP server (required for ES6 modules).

---

## 🎮 Controls

### Mouse Interactions
- **Click**: Create a force burst
- **Drag**: Apply directional force
- **Right-click**: Add a current flow

### UI Controls
- **Grid Type**: Switch between square and hexagonal grids
- **Grid Size**: Adjust simulation resolution (10-420 cells)
- **Visual Density**: Control rendering detail (2x-8x)
- **Physics Parameters**: Tune advection, diffusion, and visual scale
- **Force Strength**: Adjust interaction intensity

### Force Types
- **🌊 Currents**: Linear flow streams with adjustable width and taper
- **💨 Emitters**: Directional force jets with spread control
- **🚧 Obstacles**: Solid barriers that block flow
- **🎵 Noise Layers**: Procedural patterns (Simplex or Wave-based)

---

## 📚 How It Works

### Grid Systems

**Square Grid** (Traditional)
- 8-neighbor diffusion
- Standard Laplacian operator
- Fast and familiar

**Hexagonal Grid** (Advanced)
- 6-neighbor system
- Isotropic diffusion properties
- More natural flow patterns
- Based on discrete hexagonal Laplacian: `δH,Δ = (2/3h²) * Σ(neighbors - center)`

### Physics Engine

The simulation uses:
1. **Advection**: Self-advection of velocity field
2. **Diffusion**: Smoothing via Laplacian operator
3. **Force Accumulation**: Layered forces from multiple sources
4. **Boundary Conditions**: Proper handling of grid edges
5. **Noise Generation**: 3D Simplex noise for temporal variation

### Rendering Pipeline

```
Physics Update → Velocity Field → Color Mapping → Canvas Rendering
     ↓               ↓                 ↓               ↓
  10-60 FPS      Grid Cells      HSL Colors      800×800px
```

---

## 🏗️ Project Structure

```
cellwave/
├── demo/
│   └── index.html              # Interactive demo page
├── src/
│   ├── cellwave-simulator.js  # Core physics engine
│   └── cellwave-app.js         # Application controller
├── docs/                       # Documentation
├── assets/
│   └── screenshots/            # Demo images
├── .github/
│   └── ISSUE_TEMPLATE/         # GitHub issue templates
├── package.json                # Project metadata
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## 🔧 API Usage

### Basic Setup

```javascript
import { CellWaveSimulator } from './src/cellwave-simulator.js';

// Create simulator (planeSize, density)
const simulator = new CellWaveSimulator(100, 4);

// Set grid size
simulator.setGridSize(50);

// Choose grid type
simulator.setGridType(true); // true = hexagonal, false = square

// Update physics
simulator.updateFlow();

// Render to canvas
simulator.drawFlow();
const canvas = simulator.getCanvas();
```

### Adding Forces

```javascript
// Add a current
simulator.addCurrent({
  start: { x: 10, y: 10 },
  end: { x: 30, y: 30 },
  strength: 0.8,
  width: 2.0,
  taper: 1.0,
  speed: 1.0,
  curve: 0
});

// Add an emitter
simulator.addEmitter({
  x: 20,
  y: 20,
  angle: 45,
  strength: 1.0,
  length: 5.0,
  spread: 1.5,
  taper: 2.0,
  speed: 1.0,
  curve: 0
});

// Add an obstacle
simulator.addOccluder({
  type: 'rect',
  x0: 15,
  y0: 15,
  x1: 25,
  y1: 25
});

// Add a noise layer
simulator.addNoiseLayer({
  scale: 20,
  strength: 0.5,
  speed: 1.0,
  enabled: true,
  pattern: 'simplex' // or 'wave'
});
```

---

## 🎨 Customization

### Physics Parameters

```javascript
simulator.advection = 0.9;   // Self-advection strength (0.1-1.0)
simulator.diffusion = 0.1;   // Diffusion rate (0.01-0.5)
simulator.visScale = 1.0;    // Visual scaling (0.1-3.0)
```

### Grid Configuration

```javascript
simulator.setGridSize(100);   // 10-420 cells
simulator.setDensity(4);      // 2-8x rendering density
```

---

## 📊 Performance

| Grid Size | Density | Typical FPS | Notes |
|-----------|---------|-------------|-------|
| 50×50 | 4x | 60 FPS | Smooth, recommended |
| 100×100 | 4x | 45-60 FPS | Good balance |
| 200×200 | 2x | 30-45 FPS | Large scale |
| 420×420 | 2x | 15-30 FPS | Maximum detail |

Performance varies by browser and hardware. Chrome and Firefox recommended.

---

## 🧪 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires ES6 module support and Canvas API.

---

## 📖 Research & References

This implementation is based on:

- **Hexagonal Grid Theory**: Hamilton, M.J., & Torin, D.J. (2014). "Discrete differential operators on hexagonal grids." *Journal of Computational Physics*, 266, 161-179. [DOI: 10.1016/j.jcp.2014.01.024](https://doi.org/10.1016/j.jcp.2014.01.024)

- **Simplex Noise**: Perlin, K. (2001). "Noise hardware." *Real-Time Shading SIGGRAPH Course Notes*.

- **Fluid Simulation**: Stam, J. (1999). "Stable Fluids." *SIGGRAPH 99 Conference Proceedings*.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs via [GitHub Issues](https://github.com/newjordan/cellwave/issues)
- 💡 Suggest features or improvements
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🎨 Create demos and examples

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Hexagonal grid mathematics from Hamilton & Torin research
- Simplex noise algorithm by Ken Perlin
- Inspired by Jos Stam's stable fluids paper

---

## 📬 Contact & Links

- **Repository**: [github.com/newjordan/cellwave](https://github.com/newjordan/cellwave)
- **Issues**: [github.com/newjordan/cellwave/issues](https://github.com/newjordan/cellwave/issues)
- **Discussions**: [github.com/newjordan/cellwave/discussions](https://github.com/newjordan/cellwave/discussions)

---

**Made with 🌊 by the CellWave community**
