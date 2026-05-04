import { CellWaveSimulator } from './cellwave-simulator.js';

class CellWaveApp {
    constructor() {
        this.simulator = null;
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.animationId = null;
        
        // Interaction state
        this.isMouseDown = false;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.forceStrength = 0.8;
        
        // Force tracking for UI
        this.forceCounter = 0;
        this.activeForcesMap = new Map();
        
        // Performance tracking
        this.performanceMetrics = {
            updateTime: 0,
            renderTime: 0,
            frameCount: 0,
            avgUpdateTime: 0,
            avgRenderTime: 0
        };

        // Auto-evolve mode
        this.autoEvolve = true;
        this.evolveTime = 0;
        this.evolveSpeed = 0.0005; // How fast parameters change

        this.init();
    }
    
    async init() {
        try {
            // Get canvas
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');

            // Initialize simulator with optimized settings
            this.simulator = new CellWaveSimulator(130, 2);
            
            // Add some initial demo content
            this.addDemoContent();
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupMouseInteraction();
            
            // Start the simulation
            this.start();
            
            this.updateStats();
            this.log('CellWave simulation initialized successfully!');
            
        } catch (error) {
            this.log('Error initializing simulation: ' + error.message);
            console.error('Initialization error:', error);
        }
    }
    
    addDemoContent() {
        // Add primary simplex layer for base flow
        const noiseLayer = {
            scale: 20,
            strength: 0.6,
            speed: 0.6,
            enabled: true,
            pattern: 'simplex'
        };
        this.simulator.addNoiseLayer(noiseLayer);
        this.trackForce('noise', noiseLayer, 'Simplex Base');

        // Add secondary simplex layer for detail
        const detailLayer = {
            scale: 35,
            strength: 0.7,
            speed: 0.5,
            enabled: true,
            pattern: 'simplex'
        };
        this.simulator.addNoiseLayer(detailLayer);
        this.trackForce('noise', detailLayer, 'Simplex Detail');

        // Add tertiary wave layer with medium scale
        const waveLayer1 = {
            scale: 28,
            strength: 0.5,
            speed: 0.8,
            enabled: true,
            pattern: 'wave',
            angle: 135
        };
        this.simulator.addNoiseLayer(waveLayer1);
        this.trackForce('noise', waveLayer1, 'Wave Flow 1');

        // Add quaternary wave layer with fine detail
        const waveLayer2 = {
            scale: 25,
            strength: 0.4,
            speed: 0.7,
            enabled: true,
            pattern: 'wave',
            angle: 60
        };
        this.simulator.addNoiseLayer(waveLayer2);
        this.trackForce('noise', waveLayer2, 'Wave Flow 2');
    }
    
    setupEventListeners() {
        // Control bindings
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Force buttons
        document.getElementById('addCurrentBtn').addEventListener('click', () => this.addRandomCurrent());
        document.getElementById('addEmitterBtn').addEventListener('click', () => this.addRandomEmitter());
        document.getElementById('addOccluderBtn').addEventListener('click', () => this.addRandomOccluder());
        document.getElementById('addNoiseBtn').addEventListener('click', () => this.addNoiseLayer());
        document.getElementById('clearNoiseBtn').addEventListener('click', () => this.clearNoiseLayers());
        
        // Grid type selector
        document.getElementById('gridType').addEventListener('change', (e) => {
            const useHex = e.target.value === 'hexagonal';
            this.simulator.setGridType(useHex);
            this.log(`Switched to ${useHex ? 'hexagonal' : 'square'} grid system`);
            this.updateStats();
        });
        
        // Parameter controls
        this.bindSlider('gridSize', (value) => {
            const size = parseInt(value);
            this.simulator.setGridSize(size);
            
            // Auto-adjust density for large grids to prevent memory issues
            if (size > 100) {
                const densitySlider = document.getElementById('density');
                const maxDensity = Math.max(2, Math.floor(400 / size)); // Keep total pixels reasonable
                if (parseInt(densitySlider.value) > maxDensity) {
                    densitySlider.value = maxDensity;
                    this.simulator.setDensity(maxDensity);
                    document.getElementById('densityValue').textContent = maxDensity;
                }
                densitySlider.max = maxDensity;
            } else {
                document.getElementById('density').max = 8; // Reset to normal max
            }
            
            this.updateStats();
            
            // Performance warning for very large grids
            if (size > 200) {
                this.log(`Large grid (${size}×${size}) - performance may be impacted`);
            }
        });
        
        this.bindSlider('density', (value) => {
            this.simulator.setDensity(parseInt(value));
            this.updateStats();
        });
        
        this.bindSlider('advection', (value) => {
            this.simulator.advection = parseFloat(value);
        });
        
        this.bindSlider('diffusion', (value) => {
            this.simulator.diffusion = parseFloat(value);
        });
        
        this.bindSlider('visScale', (value) => {
            this.simulator.visScale = parseFloat(value);
        });
        
        this.bindSlider('forceStrength', (value) => {
            this.forceStrength = parseFloat(value);
        });
        
        // Noise parameter bindings
        this.bindSlider('noiseScale');
        this.bindSlider('noiseStrength');
        this.bindSlider('noiseSpeed');

        // Auto-evolve toggle
        document.getElementById('autoEvolve').addEventListener('change', (e) => {
            this.autoEvolve = e.target.checked;
            this.log(`Auto-evolve mode ${this.autoEvolve ? 'enabled' : 'disabled'}`);
        });
    }
    
    bindSlider(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        const updateValue = () => {
            const value = slider.value;
            valueDisplay.textContent = value;
            if (callback) callback(value);
        };
        
        slider.addEventListener('input', updateValue);
        updateValue(); // Set initial value
    }
    
    setupMouseInteraction() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.isDragging = false;
            const coords = this.getGridCoordinates(e);
            this.lastMouseX = coords.x;
            this.lastMouseY = coords.y;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDragging) {
                // Click to add temporary emitter burst
                const coords = this.getGridCoordinates(e);
                this.addEmitterBurstAt(coords.x, coords.y);
            }
            this.isMouseDown = false;
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const coords = this.getGridCoordinates(e);
            this.addCurrentAt(coords.x, coords.y);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;
            
            this.isDragging = true;
            const coords = this.getGridCoordinates(e);
            
            // Apply force in the direction of mouse movement
            const dx = coords.x - this.lastMouseX;
            const dy = coords.y - this.lastMouseY;
            
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                // Add temporary emitter in direction of movement
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                const emitter = {
                    x: coords.x,
                    y: coords.y,
                    angle: angle,
                    strength: this.forceStrength * 0.5,
                    length: 3,
                    spread: 1,
                    taper: 2,
                    speed: 1,
                    curve: 0
                };
                
                this.simulator.addEmitter(emitter);
                // Remove after a short time
                setTimeout(() => {
                    this.simulator.removeEmitter(emitter);
                }, 100);
            }
            
            this.lastMouseX = coords.x;
            this.lastMouseY = coords.y;
        });
    }
    
    getGridCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = (e.clientX - rect.left) / rect.width * this.simulator.planeSize;
        const screenY = (e.clientY - rect.top) / rect.height * this.simulator.planeSize;
        
        if (this.simulator.useHexGrid) {
            // Convert screen coordinates to hex coordinates
            const hexCoords = this.simulator.hexGrid.screenToHex(screenX, screenY);
            return { 
                x: Math.max(0, Math.min(this.simulator.getGridSize() - 1, hexCoords.x)), 
                y: Math.max(0, Math.min(this.simulator.getGridSize() - 1, hexCoords.y)) 
            };
        } else {
            // Square grid coordinates (original)
            const x = screenX / this.simulator.cellSize;
            const y = screenY / this.simulator.cellSize;
            return { 
                x: Math.max(0, Math.min(this.simulator.getGridSize() - 1, x)), 
                y: Math.max(0, Math.min(this.simulator.getGridSize() - 1, y)) 
            };
        }
    }
    
    addEmitterBurstAt(x, y) {
        // Create multiple short-lived emitters in random directions
        const burstCount = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < burstCount; i++) {
            const angle = (360 / burstCount) * i + Math.random() * 45;
            const emitter = {
                x: x,
                y: y,
                angle: angle,
                strength: this.forceStrength * (0.5 + Math.random() * 0.5),
                length: 2 + Math.random() * 3,
                spread: 0.8 + Math.random() * 0.4,
                taper: 1.5 + Math.random(),
                speed: 1,
                curve: 0
            };
            
            this.simulator.addEmitter(emitter);
            // Remove after a short burst
            setTimeout(() => {
                this.simulator.removeEmitter(emitter);
            }, 200 + Math.random() * 300);
        }
    }
    
    addCurrentAt(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const length = 5 + Math.random() * 10;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        const current = {
            start: { x: x, y: y },
            end: { 
                x: Math.max(0, Math.min(this.simulator.getGridSize() - 1, endX)), 
                y: Math.max(0, Math.min(this.simulator.getGridSize() - 1, endY)) 
            },
            strength: this.forceStrength * 0.8,
            width: 1.5 + Math.random(),
            taper: 1 + Math.random(),
            speed: 1.0,
            curve: 0
        };
        
        this.simulator.addCurrent(current);
        this.trackForce('current', current, `Stream ${this.forceCounter}`);
    }
    
    // Whirlpool system removed

    addRandomOccluder() {
        const gridSize = this.simulator.getGridSize();
        const size = 2 + Math.floor(Math.random() * 5); // 2-6 cells
        const x0 = Math.floor(Math.random() * (gridSize - size));
        const y0 = Math.floor(Math.random() * (gridSize - size));

        const occluder = {
            type: 'rect',
            x0: x0,
            y0: y0,
            x1: x0 + size,
            y1: y0 + size
        };

        this.simulator.addOccluder(occluder);
        this.trackForce('occluder', occluder, `Obstacle ${this.forceCounter}`);
        this.log(`Added obstacle at (${x0},${y0}) size ${size}×${size}`);
    }

    addRandomCurrent() {
        const x = Math.random() * this.simulator.getGridSize();
        const y = Math.random() * this.simulator.getGridSize();
        this.addCurrentAt(x, y);
    }
    
    addRandomEmitter() {
        const emitter = {
            x: Math.random() * this.simulator.getGridSize(),
            y: Math.random() * this.simulator.getGridSize(),
            angle: Math.random() * 360,
            strength: this.forceStrength,
            length: 4 + Math.random() * 6,
            spread: 1 + Math.random() * 2,
            taper: 1 + Math.random() * 2,
            speed: 1.0,
            curve: 0
        };
        
        this.simulator.addEmitter(emitter);
        this.trackForce('emitter', emitter, `Jet ${this.forceCounter}`);
    }
    
    addNoiseLayer() {
        const pattern = document.getElementById('noisePattern').value;
        const scale = parseFloat(document.getElementById('noiseScale').value);
        const strength = parseFloat(document.getElementById('noiseStrength').value);
        const speed = parseFloat(document.getElementById('noiseSpeed').value);
        
        const layer = {
            scale: scale,
            strength: strength,
            speed: speed,
            enabled: true,
            pattern: pattern
        };
        
        if (pattern === 'wave') {
            layer.angle = Math.random() * 360;
            // Scale parameter now controls wavelength for waves
        }
        
        this.simulator.addNoiseLayer(layer);
        this.trackForce('noise', layer, `${pattern} layer`);
    }
    
    clearNoiseLayers() {
        // Remove all noise layers
        for (const [id, force] of this.activeForcesMap) {
            if (force.type === 'noise') {
                this.simulator.removeNoiseLayer(force.object);
                this.activeForcesMap.delete(id);
            }
        }
        this.updateLayerList();
    }
    
    trackForce(type, object, name) {
        const id = ++this.forceCounter;
        this.activeForcesMap.set(id, { type, object, name, id });
        this.updateLayerList();
    }
    
    removeForce(id) {
        const force = this.activeForcesMap.get(id);
        if (!force) return;

        switch (force.type) {
            case 'current':
                this.simulator.removeCurrent(force.object);
                break;
            case 'emitter':
                this.simulator.removeEmitter(force.object);
                break;
            case 'noise':
                this.simulator.removeNoiseLayer(force.object);
                break;
            case 'occluder':
                this.simulator.removeOccluder(force.object);
                break;
        }

        this.activeForcesMap.delete(id);
        this.updateLayerList();
    }
    
    updateLayerList() {
        const layerList = document.getElementById('layerList');
        
        if (this.activeForcesMap.size === 0) {
            layerList.innerHTML = '<div style="text-align: center; color: #666; font-size: 10px; padding: 20px;">No active layers</div>';
            return;
        }
        
        layerList.innerHTML = '';
        for (const [id, force] of this.activeForcesMap) {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.innerHTML = this.createLayerControls(force);
            layerList.appendChild(item);
        }
    }
    
    createLayerControls(force) {
        const { id, type, object, name } = force;
        
        if (type === 'noise') {
            return `
                <div class="layer-header">
                    <span class="layer-name">${name}</span>
                    <div class="layer-toggle">
                        <div class="toggle-switch ${object.enabled ? 'active' : ''}" 
                             onclick="app.toggleLayer(${id})"></div>
                    </div>
                    <button onclick="app.removeForce(${id})" style="padding: 2px 6px; font-size: 8px;">✕</button>
                </div>
                <div class="layer-controls">
                    <div class="layer-control">
                        <label>Scale</label>
                        <input type="range" min="5" max="50" value="${object.scale}" 
                               onchange="app.updateLayerProperty(${id}, 'scale', this.value)">
                        <div class="value">${object.scale}</div>
                    </div>
                    <div class="layer-control">
                        <label>Strength</label>
                        <input type="range" min="0.1" max="2.0" value="${object.strength}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'strength', this.value)">
                        <div class="value">${object.strength}</div>
                    </div>
                    <div class="layer-control">
                        <label>Speed</label>
                        <input type="range" min="0.1" max="3.0" value="${object.speed}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'speed', this.value)">
                        <div class="value">${object.speed}</div>
                    </div>
                    <div class="layer-control">
                        <label>Pattern</label>
                        <select onchange="app.updateLayerProperty(${id}, 'pattern', this.value)">
                            <option value="simplex" ${object.pattern === 'simplex' ? 'selected' : ''}>Simplex</option>
                            <option value="wave" ${object.pattern === 'wave' ? 'selected' : ''}>Wave</option>
                        </select>
                    </div>
                    ${object.pattern === 'wave' ? `
                    <div class="layer-control">
                        <label>Angle</label>
                        <input type="range" min="0" max="360" value="${object.angle || 0}" step="15"
                               onchange="app.updateLayerProperty(${id}, 'angle', this.value)">
                        <div class="value">${object.angle || 0}°</div>
                    </div>` : ''}
                </div>
            `;
        } else if (type === 'current') {
            const gridSize = this.simulator.getGridSize();
            return `
                <div class="layer-header">
                    <span class="layer-name">🌊 ${name}</span>
                    <button onclick="app.removeForce(${id})" style="padding: 2px 6px; font-size: 8px;">✕</button>
                </div>
                <div class="layer-controls">
                    <div class="layer-control">
                        <label>Start X</label>
                        <input type="range" min="0" max="${gridSize}" value="${object.start.x}" step="0.5"
                               onchange="app.updateCurrentPosition(${id}, 'startX', this.value)">
                        <div class="value">${object.start.x.toFixed(1)}</div>
                    </div>
                    <div class="layer-control">
                        <label>Start Y</label>
                        <input type="range" min="0" max="${gridSize}" value="${object.start.y}" step="0.5"
                               onchange="app.updateCurrentPosition(${id}, 'startY', this.value)">
                        <div class="value">${object.start.y.toFixed(1)}</div>
                    </div>
                    <div class="layer-control">
                        <label>End X</label>
                        <input type="range" min="0" max="${gridSize}" value="${object.end.x}" step="0.5"
                               onchange="app.updateCurrentPosition(${id}, 'endX', this.value)">
                        <div class="value">${object.end.x.toFixed(1)}</div>
                    </div>
                    <div class="layer-control">
                        <label>End Y</label>
                        <input type="range" min="0" max="${gridSize}" value="${object.end.y}" step="0.5"
                               onchange="app.updateCurrentPosition(${id}, 'endY', this.value)">
                        <div class="value">${object.end.y.toFixed(1)}</div>
                    </div>
                    <div class="layer-control">
                        <label>Strength</label>
                        <input type="range" min="0.1" max="2.0" value="${object.strength}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'strength', this.value)">
                        <div class="value">${object.strength}</div>
                    </div>
                    <div class="layer-control">
                        <label>Width</label>
                        <input type="range" min="0.5" max="5.0" value="${object.width}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'width', this.value)">
                        <div class="value">${object.width}</div>
                    </div>
                    <div class="layer-control">
                        <label>Taper</label>
                        <input type="range" min="0.5" max="3.0" value="${object.taper}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'taper', this.value)">
                        <div class="value">${object.taper}</div>
                    </div>
                    <div class="layer-control">
                        <label>Speed</label>
                        <input type="range" min="0.1" max="2.0" value="${object.speed}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'speed', this.value)">
                        <div class="value">${object.speed}</div>
                    </div>
                </div>
            `;
        } else if (type === 'emitter') {
            const gridSize = this.simulator.getGridSize();
            return `
                <div class="layer-header">
                    <span class="layer-name">💨 ${name}</span>
                    <button onclick="app.removeForce(${id})" style="padding: 2px 6px; font-size: 8px;">✕</button>
                </div>
                <div class="layer-controls">
                    <div class="layer-control">
                        <label>Position X</label>
                        <input type="range" min="0" max="${gridSize}" value="${object.x}" step="0.5"
                               onchange="app.updateLayerProperty(${id}, 'x', this.value)">
                        <div class="value">${object.x.toFixed(1)}</div>
                    </div>
                    <div class="layer-control">
                        <label>Position Y</label>
                        <input type="range" min="0" max="${gridSize}" value="${object.y}" step="0.5"
                               onchange="app.updateLayerProperty(${id}, 'y', this.value)">
                        <div class="value">${object.y.toFixed(1)}</div>
                    </div>
                    <div class="layer-control">
                        <label>Angle</label>
                        <input type="range" min="0" max="360" value="${object.angle}" step="5"
                               onchange="app.updateLayerProperty(${id}, 'angle', this.value)">
                        <div class="value">${object.angle}°</div>
                    </div>
                    <div class="layer-control">
                        <label>Strength</label>
                        <input type="range" min="0.1" max="3.0" value="${object.strength}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'strength', this.value)">
                        <div class="value">${object.strength}</div>
                    </div>
                    <div class="layer-control">
                        <label>Length</label>
                        <input type="range" min="1" max="10" value="${object.length}" step="0.5"
                               onchange="app.updateLayerProperty(${id}, 'length', this.value)">
                        <div class="value">${object.length}</div>
                    </div>
                    <div class="layer-control">
                        <label>Spread</label>
                        <input type="range" min="0.2" max="3.0" value="${object.spread}" step="0.1"
                               onchange="app.updateLayerProperty(${id}, 'spread', this.value)">
                        <div class="value">${object.spread}</div>
                    </div>
                </div>
            `;
        } else if (type === 'occluder') {
            const gridSize = this.simulator.getGridSize();
            const width = object.x1 - object.x0;
            const height = object.y1 - object.y0;
            return `
                <div class="layer-header">
                    <span class="layer-name">🚧 ${name}</span>
                    <button onclick="app.removeForce(${id})" style="padding: 2px 6px; font-size: 8px;">✕</button>
                </div>
                <div class="layer-controls">
                    <div class="layer-control">
                        <label>Position X</label>
                        <input type="range" min="0" max="${gridSize - width}" value="${object.x0}" step="1"
                               onchange="app.updateOccluderPosition(${id}, 'x', this.value)">
                        <div class="value">${Math.round(object.x0)}</div>
                    </div>
                    <div class="layer-control">
                        <label>Position Y</label>
                        <input type="range" min="0" max="${gridSize - height}" value="${object.y0}" step="1"
                               onchange="app.updateOccluderPosition(${id}, 'y', this.value)">
                        <div class="value">${Math.round(object.y0)}</div>
                    </div>
                    <div class="layer-control">
                        <label>Width</label>
                        <input type="range" min="2" max="${Math.min(20, gridSize - object.x0)}" value="${width}" step="1"
                               onchange="app.updateOccluderSize(${id}, 'width', this.value)">
                        <div class="value">${width}</div>
                    </div>
                    <div class="layer-control">
                        <label>Height</label>
                        <input type="range" min="2" max="${Math.min(20, gridSize - object.y0)}" value="${height}" step="1"
                               onchange="app.updateOccluderSize(${id}, 'height', this.value)">
                        <div class="value">${height}</div>
                    </div>
                </div>
            `;
        }

        return `<div>Unknown layer type: ${type}</div>`;
    }
    
    toggleLayer(id) {
        const force = this.activeForcesMap.get(id);
        if (!force || force.type !== 'noise') return;
        
        force.object.enabled = !force.object.enabled;
        this.updateLayerList();
    }
    
    updateLayerProperty(id, property, value) {
        const force = this.activeForcesMap.get(id);
        if (!force) return;

        // Convert value to appropriate type
        if (property === 'pattern') {
            force.object[property] = value;
            // Initialize angle for wave pattern, or ensure it exists
            if (value === 'wave' && !force.object.hasOwnProperty('angle')) {
                force.object.angle = Math.random() * 360;
            }
            // Refresh the entire layer list to show/hide angle control
            this.updateLayerList();
            return;
        } else {
            force.object[property] = parseFloat(value);
        }

        // Update the display value in the UI (only for range inputs, not select dropdowns)
        const layerItem = event.target.closest('.layer-item');
        if (layerItem && event.target.type === 'range') {
            const valueDisplay = layerItem.querySelector(`input[onchange*="${property}"]`).nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('value')) {
                valueDisplay.textContent = property === 'angle' ? `${value}°` : value;
            }
        }
    }

    updateCurrentPosition(id, coordinate, value) {
        const force = this.activeForcesMap.get(id);
        if (!force || force.type !== 'current') return;

        const val = parseFloat(value);
        switch(coordinate) {
            case 'startX':
                force.object.start.x = val;
                break;
            case 'startY':
                force.object.start.y = val;
                break;
            case 'endX':
                force.object.end.x = val;
                break;
            case 'endY':
                force.object.end.y = val;
                break;
        }

        // Update UI display
        const layerItem = event.target.closest('.layer-item');
        if (layerItem) {
            const valueDisplay = event.target.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('value')) {
                valueDisplay.textContent = val.toFixed(1);
            }
        }
    }

    updateOccluderPosition(id, axis, value) {
        const force = this.activeForcesMap.get(id);
        if (!force || force.type !== 'occluder') return;

        const val = Math.round(parseFloat(value));
        const width = force.object.x1 - force.object.x0;
        const height = force.object.y1 - force.object.y0;

        if (axis === 'x') {
            force.object.x0 = val;
            force.object.x1 = val + width;
        } else if (axis === 'y') {
            force.object.y0 = val;
            force.object.y1 = val + height;
        }

        // Rebuild quadtree after position change
        this.simulator.rebuildQuadCells();

        // Update UI display
        const layerItem = event.target.closest('.layer-item');
        if (layerItem) {
            const valueDisplay = event.target.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('value')) {
                valueDisplay.textContent = Math.round(val);
            }
        }
    }

    updateOccluderSize(id, dimension, value) {
        const force = this.activeForcesMap.get(id);
        if (!force || force.type !== 'occluder') return;

        const val = Math.round(parseFloat(value));

        if (dimension === 'width') {
            force.object.x1 = force.object.x0 + val;
        } else if (dimension === 'height') {
            force.object.y1 = force.object.y0 + val;
        }

        // Rebuild quadtree after size change
        this.simulator.rebuildQuadCells();

        // Update UI display and refresh controls (max values may have changed)
        this.updateLayerList();
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    togglePause() {
        this.isRunning = !this.isRunning;
        const btn = document.getElementById('pauseBtn');
        btn.textContent = this.isRunning ? 'Pause' : 'Resume';
        
        if (this.isRunning) {
            this.animate();
        }
    }
    
    reset() {
        // Clear all forces
        this.activeForcesMap.clear();
        this.simulator.currents = [];
        this.simulator.emitters = [];
        this.simulator.noiseLayers = [];
        this.simulator.occluders = [];
        this.simulator.rebuildQuadCells(); // Rebuild spatial structure

        // Reset velocity field
        for (let y = 0; y < this.simulator.gridSize; y++) {
            for (let x = 0; x < this.simulator.gridSize; x++) {
                this.simulator.velocity.velX[y][x] = (Math.random() - 0.5) * 0.2;
                this.simulator.velocity.velY[y][x] = (Math.random() - 0.5) * 0.2;
            }
        }

        // Re-add demo content
        this.addDemoContent();
        this.updateLayerList();
        this.log('Simulation reset');
    }
    
    clearAll() {
        this.activeForcesMap.clear();
        this.simulator.currents = [];
        this.simulator.emitters = [];
        this.simulator.noiseLayers = [];
        this.simulator.occluders = [];
        this.simulator.rebuildQuadCells(); // Rebuild spatial structure
        this.updateLayerList();
        this.log('All forces cleared');
    }
    
    animate() {
        if (!this.isRunning) return;

        try {
            // Auto-evolve noise layers
            if (this.autoEvolve) {
                this.evolveNoiseLayers();
            }

            // Measure physics update time
            const updateStart = performance.now();
            this.simulator.updateFlow();
            const updateEnd = performance.now();
            this.performanceMetrics.updateTime = updateEnd - updateStart;

            // Measure rendering time
            const renderStart = performance.now();
            this.simulator.drawFlow();

            // Copy to display canvas
            const simCanvas = this.simulator.getCanvas();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(simCanvas, 0, 0, this.canvas.width, this.canvas.height);
            const renderEnd = performance.now();
            this.performanceMetrics.renderTime = renderEnd - renderStart;

            // Update running averages
            this.performanceMetrics.frameCount++;
            const alpha = 0.1; // Smoothing factor
            this.performanceMetrics.avgUpdateTime =
                this.performanceMetrics.avgUpdateTime * (1 - alpha) +
                this.performanceMetrics.updateTime * alpha;
            this.performanceMetrics.avgRenderTime =
                this.performanceMetrics.avgRenderTime * (1 - alpha) +
                this.performanceMetrics.renderTime * alpha;

            // Update stats periodically
            if (this.performanceMetrics.frameCount % 60 === 0) { // Every 60 frames
                this.updateStats();
            }

        } catch (error) {
            console.error('Animation error:', error);
            this.isRunning = false;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    evolveNoiseLayers() {
        this.evolveTime += this.evolveSpeed;

        // Only evolve noise layers, not other force types
        for (const [id, force] of this.activeForcesMap) {
            if (force.type !== 'noise' || !force.object.enabled) continue;

            const layer = force.object;
            // Use prime number multipliers for each layer to ensure different timing
            const scaleOffset = id * 2.1;
            const strengthOffset = id * 3.7;
            const speedOffset = id * 1.9;

            // Primary evolution: Scale with wide range and varied frequencies (2x speed)
            const scaleWave1 = Math.sin(this.evolveTime * 0.8 + scaleOffset);
            const scaleWave2 = Math.sin(this.evolveTime * 0.3 + scaleOffset * 2.3);
            const scaleBase = 30 + 10 * scaleWave1 + 8 * scaleWave2;
            // Minimum scale of 10 for all patterns, maximum capped at 40
            layer.scale = Math.max(10, Math.min(40, scaleBase));

            // Secondary evolution: Strength with faster, more dramatic variation
            const strengthWave1 = Math.sin(this.evolveTime * 0.9 + strengthOffset);
            const strengthWave2 = Math.sin(this.evolveTime * 1.4 + strengthOffset * 1.6);
            const strengthWave3 = Math.sin(this.evolveTime * 0.5 + strengthOffset * 2.8);
            const strengthBase = 0.5 + 0.28 * strengthWave1 + 0.18 * strengthWave2 + 0.12 * strengthWave3;
            layer.strength = Math.max(0.15, Math.min(1.1, strengthBase));

            // Tertiary evolution: Speed with subtle changes
            const speedWave = Math.sin(this.evolveTime * 0.25 + speedOffset);
            const speedBase = 0.7 + 0.35 * speedWave;
            layer.speed = Math.max(0.4, Math.min(1.2, speedBase));

            // For wave patterns, very slow rotation (or use it for different frequency modulation)
            if (layer.pattern === 'wave' && layer.angle !== undefined) {
                // Much slower rotation - only 0.02 degrees per frame (~1 degree per second at 60fps)
                layer.angle = (layer.angle + 0.02) % 360;
            }
        }

        // Periodically update the UI (not every frame for performance)
        if (this.performanceMetrics.frameCount % 30 === 0) {
            this.updateLayerList();
        }
    }
    
    updateStats() {
        const stats = document.getElementById('stats');
        const currents = this.simulator.currents.length;
        const emitters = this.simulator.emitters.length;
        const noiseLayers = this.simulator.noiseLayers.length;
        const occluders = this.simulator.occluders.length;

        const gridType = this.simulator.useHexGrid ? 'Hexagonal' : 'Square';
        const totalCells = this.simulator.getGridSize() * this.simulator.getGridSize();
        const fps = this.performanceMetrics.avgUpdateTime > 0 ?
            Math.round(1000 / (this.performanceMetrics.avgUpdateTime + this.performanceMetrics.avgRenderTime)) : 0;

        stats.innerHTML = `
            <strong>Performance:</strong><br>
            Grid: ${this.simulator.getGridSize()}×${this.simulator.getGridSize()} (${totalCells.toLocaleString()} cells)<br>
            Type: ${gridType}<br>
            Density: ${this.simulator.density}x<br>
            FPS: ${fps}<br>
            Update: ${this.performanceMetrics.avgUpdateTime.toFixed(1)}ms<br>
            Render: ${this.performanceMetrics.avgRenderTime.toFixed(1)}ms<br>
            <br>
            <strong>Active Forces:</strong><br>
            Currents: ${currents}<br>
            Emitters: ${emitters}<br>
            Obstacles: ${occluders}<br>
            Noise Layers: ${noiseLayers}<br>
            <br>
            <strong>Physics:</strong><br>
            Advection: ${this.simulator.advection}<br>
            Diffusion: ${this.simulator.diffusion}<br>
            Visual Scale: ${this.simulator.visScale}
        `;
    }
    
    log(message) {
        console.log('🌊 CellWave:', message);
    }
}

// Global app instance for button callbacks
let app;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new CellWaveApp();
        window.app = app; // Make available for button callbacks
    });
} else {
    app = new CellWaveApp();
    window.app = app;
}