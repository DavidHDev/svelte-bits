// Proper 3D Simplex Noise implementation
function createNoise3D() {
    // Simplex noise constants
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;
    
    // Permutation table
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Shuffle the permutation table
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    
    // Extend the permutation table
    for (let i = 0; i < 256; i++) p[256 + i] = p[i];
    
    // 3D gradient vectors
    const grad3 = [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    
    function dot(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }
    
    return function noise3D(xin, yin, zin) {
        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin + zin) * F3;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const k = Math.floor(zin + s);
        
        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        const z0 = zin - Z0;
        
        // Determine which simplex we are in
        let i1, j1, k1, i2, j2, k2;
        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        
        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0 * G3;
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        const x3 = x0 - 1.0 + 3.0 * G3;
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;
        
        // Hash coordinates of the four corners
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = p[ii + p[jj + p[kk]]] % 12;
        const gi1 = p[ii + i1 + p[jj + j1 + p[kk + k1]]] % 12;
        const gi2 = p[ii + i2 + p[jj + j2 + p[kk + k2]]] % 12;
        const gi3 = p[ii + 1 + p[jj + 1 + p[kk + 1]]] % 12;
        
        // Calculate the contribution from the four corners
        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        let n0 = t0 < 0 ? 0 : Math.pow(t0, 4) * dot(grad3[gi0], x0, y0, z0);
        
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        let n1 = t1 < 0 ? 0 : Math.pow(t1, 4) * dot(grad3[gi1], x1, y1, z1);
        
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        let n2 = t2 < 0 ? 0 : Math.pow(t2, 4) * dot(grad3[gi2], x2, y2, z2);
        
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        let n3 = t3 < 0 ? 0 : Math.pow(t3, 4) * dot(grad3[gi3], x3, y3, z3);
        
        // Add contributions from each corner to get the final noise value
        return 32.0 * (n0 + n1 + n2 + n3);
    };
}

const noise3D = createNoise3D();

/**
 * CellWave - Interactive Fluid Dynamics Simulator
 * A pure JavaScript implementation of fluid dynamics with support for
 * both square and hexagonal grid systems.
 *
 * @author CellWave Contributors
 * @license MIT
 */

// Hexagonal Grid System
class HexGrid {
    constructor(width, height, spacing) {
        this.h = spacing;
        this.width = width;
        this.height = height;
        
        // Hexagonal basis vectors
        this.basisX = [1, -0.5];
        this.basisY = [0, Math.sqrt(3)/2];
        
        // Pre-calculate neighbor offsets for 6-connected hexagonal grid
        this.neighborOffsets = [
            [1, 0],      // East
            [-1, 0],     // West  
            [0, 1],      // Northeast
            [-1, 1],     // Northwest
            [1, -1],     // Southeast
            [0, -1]      // Southwest
        ];
    }
    
    // Convert hex coordinates to screen coordinates
    hexToScreen(hexX, hexY) {
        const screenX = this.h * (hexX * this.basisX[0] + hexY * this.basisX[1]);
        const screenY = this.h * (hexX * this.basisY[0] + hexY * this.basisY[1]);
        return { x: screenX, y: screenY };
    }
    
    // Convert screen coordinates to hex coordinates (approximate)
    screenToHex(screenX, screenY) {
        const x = screenX / this.h;
        const y = screenY / this.h;
        
        // Inverse transformation matrix
        const det = this.basisX[0] * this.basisY[1] - this.basisX[1] * this.basisY[0];
        const hexX = (this.basisY[1] * x - this.basisX[1] * y) / det;
        const hexY = (-this.basisY[0] * x + this.basisX[0] * y) / det;
        
        return { x: Math.round(hexX), y: Math.round(hexY) };
    }
    
    // Get the 6 neighbors of a hex cell
    getNeighbors(hexX, hexY) {
        return this.neighborOffsets.map(([dx, dy]) => [hexX + dx, hexY + dy]);
    }
    
    // Check if hex coordinates are valid within grid bounds
    isValidHex(hexX, hexY) {
        return hexX >= 0 && hexX < this.width && hexY >= 0 && hexY < this.height;
    }
    
    // Convert 2D hex coordinates to 1D array index
    hexToIndex(hexX, hexY) {
        return hexY * this.width + hexX;
    }
    
    // Convert 1D array index to 2D hex coordinates
    indexToHex(index) {
        const hexY = Math.floor(index / this.width);
        const hexX = index % this.width;
        return { x: hexX, y: hexY };
    }
}

export class CellWaveSimulator {
    constructor(planeSize, density = 3) {
        this.density = density;
        this.planeSize = planeSize;
        this.gridSize = 85; // resolution cells
        this.cellSize = this.planeSize / this.gridSize;

        // Grid system configuration - hexagonal by default for better isotropy
        this.useHexGrid = true; // Toggle between square and hexagonal grids
        this.hexGrid = new HexGrid(this.gridSize, this.gridSize, this.cellSize);

        // Physics parameters
        this.advection = 0.15;
        this.diffusion = 0.04;
        this.visScale = 0.8; // velocity magnitude that maps to pure black
        
        // Arrays for storing forces and objects
        this.occluders = [];
        this.noiseLayers = [];
        this.currents = [];
        this.emitters = [];
        this.quadCells = [];
        this.quadLOD = 2; // Maximum quadtree depth
        this.noiseTime = 0;
        
        // Low-resolution canvas (gridSize × gridSize) — one pixel per simulation cell
        this.simCanvas = document.createElement('canvas');
        this.simCanvas.width = this.gridSize;
        this.simCanvas.height = this.gridSize;
        this.simCtx = this.simCanvas.getContext('2d');

        // High-resolution canvas that will be uploaded to the GPU as a texture
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.gridSize * this.density;
        this.canvas.height = this.gridSize * this.density;
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize velocity grid (works for both square and hex)
        this.velocity = {
            velX: Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0)),
            velY: Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0))
        };
        
        this.initializeVelocityField();

        // Build initial quadtree
        this.rebuildQuadCells();
    }

    // Grid system methods
    initializeVelocityField() {
        // Basic initial flow: gentle random flow across the whole grid
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.velocity.velX[y][x] = (Math.random() - 0.5) * 0.2;
                this.velocity.velY[y][x] = (Math.random() - 0.5) * 0.2;
            }
        }
    }
    
    // Get neighbors based on current grid system
    getNeighbors(x, y) {
        if (this.useHexGrid) {
            return this.hexGrid.getNeighbors(x, y).filter(([nx, ny]) => 
                this.hexGrid.isValidHex(nx, ny)
            );
        } else {
            // Square grid 8-neighbor system
            const neighbors = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                        neighbors.push([nx, ny]);
                    }
                }
            }
            return neighbors;
        }
    }
    
    // Toggle between square and hexagonal grids
    setGridType(useHex) {
        this.useHexGrid = useHex;
        this.hexGrid = new HexGrid(this.gridSize, this.gridSize, this.cellSize);
    }
    
    // Apply diffusion using appropriate Laplacian operator
    applyDiffusion(x, y, newVelX, newVelY) {
        if (this.useHexGrid) {
            // Hexagonal Laplacian: δH,Δ = (2/3h²) * Σ(neighbors - center)
            const neighbors = this.getNeighbors(x, y);
            let avgX = 0, avgY = 0;
            
            for (const [nx, ny] of neighbors) {
                avgX += this.velocity.velX[ny][nx];
                avgY += this.velocity.velY[ny][nx];
            }
            
            if (neighbors.length > 0) {
                // Hexagonal Laplacian with proper weight
                const laplacianWeight = (2.0 / 3.0) / (this.cellSize * this.cellSize);
                const centerWeight = neighbors.length; // Should be 6 for interior cells
                
                newVelX[y][x] += (avgX - centerWeight * this.velocity.velX[y][x]) * laplacianWeight * this.diffusion;
                newVelY[y][x] += (avgY - centerWeight * this.velocity.velY[y][x]) * laplacianWeight * this.diffusion;
            }
        } else {
            // Square grid diffusion (original implementation)
            let avgX = 0, avgY = 0, count = 0;
            const neighbors = this.getNeighbors(x, y);
            
            for (const [nx, ny] of neighbors) {
                avgX += this.velocity.velX[ny][nx];
                avgY += this.velocity.velY[ny][nx];
                count++;
            }
            
            if (count > 0) {
                newVelX[y][x] += (avgX / count) * this.diffusion;
                newVelY[y][x] += (avgY / count) * this.diffusion;
            }
        }
    }
    
    getCanvas() {
        return this.canvas;
    }

    // Whirlpool system removed - was too rigid

    // Noise layer management
    addNoiseLayer(layer) {
        this.noiseLayers.push(layer);
    }

    removeNoiseLayer(layer) {
        const index = this.noiseLayers.indexOf(layer);
        if (index > -1) {
            this.noiseLayers.splice(index, 1);
        }
    }

    // Current management
    addCurrent(current) {
        this.currents.push(current);
    }

    removeCurrent(current) {
        const idx = this.currents.indexOf(current);
        if (idx > -1) {
            this.currents.splice(idx, 1);
        }
    }

    // Emitter management
    addEmitter(emitter) {
        this.emitters.push(emitter);
    }

    removeEmitter(emitter) {
        const idx = this.emitters.indexOf(emitter);
        if (idx > -1) {
            this.emitters.splice(idx, 1);
        }
    }

    // Occluder management
    addOccluder(occluder) {
        this.occluders.push(occluder);
        this.rebuildQuadCells();
    }

    removeOccluder(occluder) {
        const idx = this.occluders.indexOf(occluder);
        if (idx > -1) {
            this.occluders.splice(idx, 1);
            this.rebuildQuadCells();
        }
    }

    updateFlow() {
        const newVelX = this.velocity.velX.map(row => row.slice());
        const newVelY = this.velocity.velY.map(row => row.slice());
        
        this.noiseTime += 0.005; // Base increment for noise animation

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Check for occluders (solid objects)
                let blocked = false;
                for (const occ of this.occluders) {
                    if (occ.type === 'rect') {
                        if (x >= occ.x0 && x <= occ.x1 && y >= occ.y0 && y <= occ.y1) {
                            blocked = true;
                            break;
                        }
                    }
                }
                if (blocked) {
                    newVelX[y][x] = 0;
                    newVelY[y][x] = 0;
                    continue;
                }

                // Advection
                let srcX = Math.floor(x - this.velocity.velX[y][x]);
                let srcY = Math.floor(y - this.velocity.velY[y][x]);
                srcX = Math.max(0, Math.min(this.gridSize - 1, srcX));
                srcY = Math.max(0, Math.min(this.gridSize - 1, srcY));
                newVelX[y][x] = this.velocity.velX[srcY][srcX] * this.advection;
                newVelY[y][x] = this.velocity.velY[srcY][srcX] * this.advection;
                
                // Diffusion using appropriate grid system
                this.applyDiffusion(x, y, newVelX, newVelY);

                // Apply noise layers
                for (const layer of this.noiseLayers) {
                    if (!layer.enabled) continue;

                    const pattern = layer.pattern || 'simplex';
                    const phase = this.noiseTime * layer.speed;

                    if (pattern === 'simplex') {
                        const nx = x / layer.scale;
                        const ny = y / layer.scale;

                        // 3-D simplex noise for evolving patterns
                        const nX = noise3D(nx, ny, phase);
                        const nY = noise3D(nx + 100, ny + 100, phase);

                        newVelX[y][x] += nX * layer.strength;
                        newVelY[y][x] += nY * layer.strength;

                    } else if (pattern === 'wave') {
                        const angRad = (layer.angle || 0) * Math.PI / 180;
                        const dirX = Math.cos(angRad);
                        const dirY = Math.sin(angRad);
                        
                        // Use scale parameter consistently (convert to wavelength)
                        const lambda = layer.scale || 10;

                        const s = Math.sin(
                            2 * Math.PI * ((x * dirX + y * dirY) / lambda + phase)
                        );

                        newVelX[y][x] += dirX * s * layer.strength;
                        newVelY[y][x] += dirY * s * layer.strength;
                    }
                }

                // Whirlpool forces removed - too rigid for natural flow
                
                // Apply current forces
                for (const cur of this.currents) {
                    const segDX = cur.end.x - cur.start.x;
                    const segDY = cur.end.y - cur.start.y;
                    const segLen = Math.hypot(segDX, segDY);
                    if (segLen === 0) continue;

                    const nx = segDX / segLen;
                    const ny = segDY / segLen;

                    const relX = x - cur.start.x;
                    const relY = y - cur.start.y;

                    const along = relX * nx + relY * ny;
                    if (along < 0 || along > segLen) continue;

                    const perp = Math.abs(relX * ny - relY * nx);
                    const lateralFall = Math.exp(-0.5 * Math.pow(perp / cur.width, 2));

                    const longFrac = along / segLen;
                    const longFall = 1 - longFrac;

                    const force = cur.strength * cur.speed * lateralFall * Math.pow(longFall, cur.taper);

                    newVelX[y][x] += nx * force;
                    newVelY[y][x] += ny * force;
                }

                // Apply emitter forces
                for (const em of this.emitters) {
                    const vx = x - em.x;
                    const vy = y - em.y;

                    const dirRad = em.angle * Math.PI / 180;
                    const ex = Math.cos(dirRad);
                    const ey = Math.sin(dirRad);

                    const along = vx * ex + vy * ey;
                    if (along < 0 || along > em.length) continue;

                    const perp = Math.abs(vx * ey - vy * ex);
                    if (perp > em.spread) continue;

                    const fallLong = 1 - along / em.length;
                    const fallLat = 1 - perp / em.spread;
                    const fall = Math.pow(fallLong * fallLat, em.taper);

                    newVelX[y][x] += ex * em.strength * em.speed * fall;
                    newVelY[y][x] += ey * em.strength * em.speed * fall;
                }
            }
        }
        
        this.velocity.velX = newVelX;
        this.velocity.velY = newVelY;
    }

    drawFlow() {
        // 1 – render each simulation cell to the low-res canvas (one pixel per cell)
        this.simCtx.clearRect(0, 0, this.gridSize, this.gridSize);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const speed = Math.hypot(this.velocity.velX[y][x], this.velocity.velY[y][x]);
                let grey = Math.floor(255 * (1 - Math.tanh(speed / this.visScale)));

                // Clean velocity-based rendering only

                this.simCtx.fillStyle = `rgb(${grey},${grey},${grey})`;
                this.simCtx.fillRect(x, y, 1, 1);
            }
        }

        // Overlay occluder blocks with higher-detail quadtree
        for (const cell of this.quadCells) {
            if (!cell.blocked) continue;
            this.simCtx.fillStyle = 'rgb(20,20,20)';
            this.simCtx.fillRect(cell.x, cell.y, cell.size, cell.size);
        }

        // 2 – smoothly upscale the low-res canvas onto the high-res texture canvas
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            this.simCanvas,
            0, 0, this.gridSize, this.gridSize,
            0, 0, this.canvas.width, this.canvas.height
        );
        
        // 3 – Add hexagonal grid overlay for debugging when in hex mode
        if (this.useHexGrid && this.gridSize <= 50) { // Only show for reasonable grid sizes
            this.drawHexGridOverlay();
        }
    }
    
    // Draw hexagonal grid overlay for visual debugging
    drawHexGridOverlay() {
        const scale = this.canvas.width / this.planeSize;
        const radius = this.hexGrid.h * scale * 0.45;
        
        // Skip if hexagons would be too small to see clearly
        if (radius < 3) return;
        
        this.ctx.strokeStyle = 'rgba(0, 170, 255, 0.3)';
        this.ctx.lineWidth = Math.max(1, radius / 10);
        
        // For larger grids, sample every nth cell to reduce drawing overhead
        const step = this.gridSize > 30 ? Math.ceil(this.gridSize / 30) : 1;
        
        for (let y = 0; y < this.gridSize; y += step) {
            for (let x = 0; x < this.gridSize; x += step) {
                const screenPos = this.hexGrid.hexToScreen(x, y);
                const centerX = screenPos.x * scale;
                const centerY = screenPos.y * scale;
                
                // Skip if hexagon center is outside visible area
                if (centerX < -radius || centerX > this.canvas.width + radius ||
                    centerY < -radius || centerY > this.canvas.height + radius) {
                    continue;
                }
                
                // Draw hexagon
                this.ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const px = centerX + radius * Math.cos(angle);
                    const py = centerY + radius * Math.sin(angle);
                    
                    if (i === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }
                this.ctx.closePath();
                this.ctx.stroke();
                
                // Optional: Draw coordinate labels for very small grids
                if (this.gridSize <= 15 && step === 1) {
                    this.ctx.fillStyle = 'rgba(0, 170, 255, 0.7)';
                    this.ctx.font = '8px monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`${x},${y}`, centerX, centerY + 2);
                }
            }
        }
    }

    // Configuration methods
    setDensity(d) {
        this.density = Math.max(1, Math.floor(d));
        this.canvas.width = this.gridSize * this.density;
        this.canvas.height = this.gridSize * this.density;
        this.rebuildQuadCells();
    }

    setGridSize(size) {
        const newSize = Math.max(2, Math.floor(size));
        if (newSize === this.gridSize) return;

        this.gridSize = newSize;
        this.cellSize = this.planeSize / this.gridSize;

        // Rebuild hexagonal grid with new size
        this.hexGrid = new HexGrid(this.gridSize, this.gridSize, this.cellSize);

        // rebuild velocity arrays
        this.velocity = {
            velX: Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0)),
            velY: Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0))
        };
        
        this.initializeVelocityField();

        // resize canvases
        this.simCanvas.width = this.gridSize;
        this.simCanvas.height = this.gridSize;
        this.canvas.width = this.gridSize * this.density;
        this.canvas.height = this.gridSize * this.density;
    }

    setPlaneSize(size) {
        this.planeSize = Math.max(1, size);
        this.cellSize = this.planeSize / this.gridSize;
    }

    setOccluderLOD(depth) {
        this.quadLOD = Math.max(0, Math.floor(depth));
        this.rebuildQuadCells();
    }

    getGridSize() {
        return this.gridSize;
    }

    // Adaptive quadtree helper
    rebuildQuadCells() {
        const cells = [];
        const maxDepth = this.quadLOD;
        const occs = this.occluders;
        const grid = this.gridSize;

        const cellState = (cx, cy, size) => {
            let partial = false;
            for (const occ of occs) {
                if (occ.type !== 'rect') continue;

                // Outside rectangle
                if (cx + size - 1 < occ.x0 || cx > occ.x1 || cy + size - 1 < occ.y0 || cy > occ.y1) {
                    continue;
                }

                // Fully inside rectangle
                if (cx >= occ.x0 && cx + size - 1 <= occ.x1 && cy >= occ.y0 && cy + size - 1 <= occ.y1) {
                    return 1; // blocked
                }

                // Partial overlap
                partial = true;
            }
            return partial ? 2 : 0; // 0 = clear, 1 = blocked, 2 = partial
        };

        const recurse = (cx, cy, size, depth) => {
            const state = cellState(cx, cy, size);
            if (state === 2 && depth < maxDepth && size > 1) {
                const half = Math.floor(size / 2);
                if (half < 1) {
                    cells.push({ x: cx, y: cy, size, blocked: false });
                    return;
                }
                recurse(cx, cy, half, depth + 1);
                recurse(cx + half, cy, half, depth + 1);
                recurse(cx, cy + half, half, depth + 1);
                recurse(cx + half, cy + half, half, depth + 1);
            } else {
                cells.push({ x: cx, y: cy, size, blocked: state === 1 });
            }
        };

        recurse(0, 0, grid, 0);
        this.quadCells = cells;
    }
}