<!-- @svelte-bits
{
  "title": "Infinite Menu",
  "description": "Spherical icosahedron menu rendered with WebGL2 + instanced disc atlas, dragged via arcball physics.",
  "dependencies": ["gl-matrix"]
}
-->
<script module lang="ts">
	export interface InfiniteMenuItem {
		image: string;
		link: string;
		title: string;
		description: string;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { mat4, quat, vec2, vec3 } from 'gl-matrix';

	type Props = {
		items?: InfiniteMenuItem[];
		scale?: number;
	};
	let { items = [], scale = 1.0 }: Props = $props();

	let canvasEl: HTMLCanvasElement;
	let activeItem = $state<InfiniteMenuItem | null>(null);
	let isMoving = $state(false);

	const defaultItems: InfiniteMenuItem[] = [
		{ image: 'https://picsum.photos/900/900?grayscale', link: 'https://google.com/', title: '', description: '' }
	];

	const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
#define PI 3.141593
void main() {
	vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
	vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
	float radius = length(centerPos.xyz);
	if (gl_VertexID > 0) {
		vec3 rotationAxis = uRotationAxisVelocity.xyz;
		float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
		vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
		vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
		float strength = dot(stretchDir, relativeVertexPos);
		float invAbsStrength = min(0., abs(strength) - 1.);
		strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
		worldPosition.xyz += stretchDir * strength;
	}
	worldPosition.xyz = radius * normalize(worldPosition.xyz);
	gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
	vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
	vUvs = aModelUvs;
	vInstanceId = gl_InstanceID;
}`;

	const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
	int itemIndex = vInstanceId % uItemCount;
	int cellsPerRow = uAtlasSize;
	int cellX = itemIndex % cellsPerRow;
	int cellY = itemIndex / cellsPerRow;
	vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
	vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
	ivec2 texSize = textureSize(uTex, 0);
	float imageAspect = float(texSize.x) / float(texSize.y);
	float containerAspect = 1.0;
	float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);
	vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
	st = (st - 0.5) * scale + 0.5;
	st = clamp(st, 0.0, 1.0);
	st = st * cellSize + cellOffset;
	outColor = texture(uTex, st);
	outColor.a *= vAlpha;
}`;

	onMount(() => {
		const liveItems: InfiniteMenuItem[] = items.length ? items : defaultItems;

		// ============ Geometry classes (inlined) ============
		class Face {
			a: number; b: number; c: number;
			constructor(a: number, b: number, c: number) { this.a = a; this.b = b; this.c = c; }
		}
		class Vertex {
			position: vec3; normal: vec3; uv: vec2;
			constructor(x: number, y: number, z: number) {
				this.position = vec3.fromValues(x, y, z);
				this.normal = vec3.create();
				this.uv = vec2.create();
			}
		}
		class Geometry {
			vertices: Vertex[] = [];
			faces: Face[] = [];
			addVertex(...args: number[]): this {
				for (let i = 0; i < args.length; i += 3) this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
				return this;
			}
			addFace(...args: number[]): this {
				for (let i = 0; i < args.length; i += 3) this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
				return this;
			}
			get lastVertex(): Vertex { return this.vertices[this.vertices.length - 1]; }
			subdivide(divisions = 1): this {
				const cache: Record<string, number> = {};
				let f = this.faces;
				for (let div = 0; div < divisions; ++div) {
					const newFaces = new Array<Face>(f.length * 4);
					f.forEach((face, ndx) => {
						const mAB = this.getMidPoint(face.a, face.b, cache);
						const mBC = this.getMidPoint(face.b, face.c, cache);
						const mCA = this.getMidPoint(face.c, face.a, cache);
						const i = ndx * 4;
						newFaces[i + 0] = new Face(face.a, mAB, mCA);
						newFaces[i + 1] = new Face(face.b, mBC, mAB);
						newFaces[i + 2] = new Face(face.c, mCA, mBC);
						newFaces[i + 3] = new Face(mAB, mBC, mCA);
					});
					f = newFaces;
				}
				this.faces = f;
				return this;
			}
			spherize(radius = 1): this {
				this.vertices.forEach((v) => {
					vec3.normalize(v.normal, v.position);
					vec3.scale(v.position, v.normal, radius);
				});
				return this;
			}
			get vertexData(): Float32Array { return new Float32Array(this.vertices.flatMap((v) => Array.from(v.position))); }
			get normalData(): Float32Array { return new Float32Array(this.vertices.flatMap((v) => Array.from(v.normal))); }
			get uvData(): Float32Array { return new Float32Array(this.vertices.flatMap((v) => Array.from(v.uv))); }
			get indexData(): Uint16Array { return new Uint16Array(this.faces.flatMap((f) => [f.a, f.b, f.c])); }
			get data() { return { vertices: this.vertexData, indices: this.indexData, normals: this.normalData, uvs: this.uvData }; }
			getMidPoint(ndxA: number, ndxB: number, cache: Record<string, number>): number {
				const key = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
				if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
				const a = this.vertices[ndxA].position;
				const b = this.vertices[ndxB].position;
				const ndx = this.vertices.length;
				cache[key] = ndx;
				this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
				return ndx;
			}
		}
		class IcosahedronGeometry extends Geometry {
			constructor() {
				super();
				const t = Math.sqrt(5) * 0.5 + 0.5;
				this.addVertex(
					-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
					0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
					t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
				).addFace(
					0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
					1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
					3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
					4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
				);
			}
		}
		class DiscGeometry extends Geometry {
			constructor(steps = 4, radius = 1) {
				super();
				const safeSteps = Math.max(4, steps);
				const alpha = (2 * Math.PI) / safeSteps;
				this.addVertex(0, 0, 0);
				this.lastVertex.uv[0] = 0.5; this.lastVertex.uv[1] = 0.5;
				for (let i = 0; i < safeSteps; ++i) {
					const x = Math.cos(alpha * i);
					const y = Math.sin(alpha * i);
					this.addVertex(radius * x, radius * y, 0);
					this.lastVertex.uv[0] = x * 0.5 + 0.5;
					this.lastVertex.uv[1] = y * 0.5 + 0.5;
					if (i > 0) this.addFace(0, i, i + 1);
				}
				this.addFace(0, safeSteps, 1);
			}
		}

		// ============ GL helpers ============
		function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
			const sh = gl.createShader(type);
			if (!sh) return null;
			gl.shaderSource(sh, source);
			gl.compileShader(sh);
			if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
			console.error(gl.getShaderInfoLog(sh));
			gl.deleteShader(sh);
			return null;
		}
		function createProgram(gl: WebGL2RenderingContext, sources: [string, string], attribs?: Record<string, number>) {
			const p = gl.createProgram();
			if (!p) return null;
			[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((t, i) => {
				const sh = createShader(gl, t, sources[i]);
				if (sh) gl.attachShader(p, sh);
			});
			if (attribs) for (const a in attribs) gl.bindAttribLocation(p, attribs[a], a);
			gl.linkProgram(p);
			if (gl.getProgramParameter(p, gl.LINK_STATUS)) return p;
			console.error(gl.getProgramInfoLog(p));
			gl.deleteProgram(p);
			return null;
		}
		function makeBuffer(gl: WebGL2RenderingContext, data: ArrayBufferView, usage: number) {
			const b = gl.createBuffer();
			if (!b) throw new Error('buffer fail');
			gl.bindBuffer(gl.ARRAY_BUFFER, b);
			gl.bufferData(gl.ARRAY_BUFFER, data, usage);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			return b;
		}
		function makeVAO(gl: WebGL2RenderingContext, pairs: Array<[WebGLBuffer, number, number]>, indices?: Uint16Array) {
			const va = gl.createVertexArray();
			if (!va) return null;
			gl.bindVertexArray(va);
			for (const [buf, loc, n] of pairs) {
				if (loc === -1) continue;
				gl.bindBuffer(gl.ARRAY_BUFFER, buf);
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
			}
			if (indices) {
				const ib = gl.createBuffer();
				if (ib) {
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
				}
			}
			gl.bindVertexArray(null);
			return va;
		}
		function resizeCanvas(canvas: HTMLCanvasElement) {
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const dw = Math.round(canvas.clientWidth * dpr);
			const dh = Math.round(canvas.clientHeight * dpr);
			const need = canvas.width !== dw || canvas.height !== dh;
			if (need) { canvas.width = dw; canvas.height = dh; }
			return need;
		}
		function makeTexture(gl: WebGL2RenderingContext) {
			const t = gl.createTexture();
			if (!t) throw new Error('tex fail');
			gl.bindTexture(gl.TEXTURE_2D, t);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			return t;
		}

		// ============ ArcballControl ============
		const canvas = canvasEl;
		canvas.style.touchAction = 'none';
		const arc = {
			isPointerDown: false,
			orientation: quat.create(),
			pointerRotation: quat.create(),
			rotationVelocity: 0,
			rotationAxis: vec3.fromValues(1, 0, 0) as vec3,
			snapDirection: vec3.fromValues(0, 0, -1) as vec3,
			snapTargetDirection: null as vec3 | null,
			pointerPos: vec2.create(),
			previousPointerPos: vec2.create(),
			_rotationVelocity: 0,
			_combinedQuat: quat.create(),
			EPSILON: 0.1,
			IDENTITY_QUAT: quat.create()
		};

		const onPointerDown = (e: PointerEvent) => {
			vec2.set(arc.pointerPos, e.clientX, e.clientY);
			vec2.copy(arc.previousPointerPos, arc.pointerPos);
			arc.isPointerDown = true;
		};
		const onPointerUp = () => { arc.isPointerDown = false; };
		const onPointerLeave = () => { arc.isPointerDown = false; };
		const onPointerMove = (e: PointerEvent) => {
			if (arc.isPointerDown) vec2.set(arc.pointerPos, e.clientX, e.clientY);
		};
		canvas.addEventListener('pointerdown', onPointerDown);
		canvas.addEventListener('pointerup', onPointerUp);
		canvas.addEventListener('pointerleave', onPointerLeave);
		canvas.addEventListener('pointermove', onPointerMove);

		function projectArc(pos: vec2): vec3 {
			const r = 2;
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;
			const s = Math.max(w, h) - 1;
			const x = (2 * pos[0] - w - 1) / s;
			const y = (2 * pos[1] - h - 1) / s;
			let z = 0;
			const xySq = x * x + y * y;
			const rSq = r * r;
			if (xySq <= rSq / 2.0) z = Math.sqrt(rSq - xySq);
			else z = rSq / Math.sqrt(xySq);
			return vec3.fromValues(-x, y, z);
		}
		function quatFromVectors(a: vec3, b: vec3, out: quat, angleFactor = 1) {
			const axis = vec3.cross(vec3.create(), a, b);
			vec3.normalize(axis, axis);
			const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
			const angle = Math.acos(d) * angleFactor;
			quat.setAxisAngle(out, axis, angle);
		}
		function arcUpdate(deltaTime: number, targetFrameDuration = 16) {
			const timeScale = deltaTime / targetFrameDuration + 0.00001;
			let angleFactor = timeScale;
			const snapRotation = quat.create();
			if (arc.isPointerDown) {
				const INTENSITY = 0.3 * timeScale;
				const ANGLE_AMPLIFICATION = 5 / timeScale;
				const mid = vec2.sub(vec2.create(), arc.pointerPos, arc.previousPointerPos);
				vec2.scale(mid, mid, INTENSITY);
				if (vec2.sqrLen(mid) > arc.EPSILON) {
					vec2.add(mid, arc.previousPointerPos, mid);
					const p = projectArc(mid);
					const q = projectArc(arc.previousPointerPos);
					const a = vec3.normalize(vec3.create(), p);
					const b = vec3.normalize(vec3.create(), q);
					vec2.copy(arc.previousPointerPos, mid);
					angleFactor *= ANGLE_AMPLIFICATION;
					quatFromVectors(a, b, arc.pointerRotation, angleFactor);
				} else {
					quat.slerp(arc.pointerRotation, arc.pointerRotation, arc.IDENTITY_QUAT, INTENSITY);
				}
			} else {
				const INTENSITY = 0.1 * timeScale;
				quat.slerp(arc.pointerRotation, arc.pointerRotation, arc.IDENTITY_QUAT, INTENSITY);
				if (arc.snapTargetDirection) {
					const SNAPPING_INTENSITY = 0.2;
					const a = arc.snapTargetDirection;
					const b = arc.snapDirection;
					const sqrDist = vec3.squaredDistance(a, b);
					const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
					angleFactor *= SNAPPING_INTENSITY * distanceFactor;
					quatFromVectors(a, b, snapRotation, angleFactor);
				}
			}
			const combined = quat.multiply(quat.create(), snapRotation, arc.pointerRotation);
			arc.orientation = quat.multiply(quat.create(), combined, arc.orientation);
			quat.normalize(arc.orientation, arc.orientation);

			const RA_INTENSITY = 0.8 * timeScale;
			quat.slerp(arc._combinedQuat, arc._combinedQuat, combined, RA_INTENSITY);
			quat.normalize(arc._combinedQuat, arc._combinedQuat);
			const rad = Math.acos(arc._combinedQuat[3]) * 2.0;
			const s = Math.sin(rad / 2.0);
			let rv = 0;
			if (s > 0.000001) {
				rv = rad / (2 * Math.PI);
				arc.rotationAxis[0] = arc._combinedQuat[0] / s;
				arc.rotationAxis[1] = arc._combinedQuat[1] / s;
				arc.rotationAxis[2] = arc._combinedQuat[2] / s;
			}
			const RV_INTENSITY = 0.5 * timeScale;
			arc._rotationVelocity += (rv - arc._rotationVelocity) * RV_INTENSITY;
			arc.rotationVelocity = arc._rotationVelocity / timeScale;
		}

		// ============ InfiniteGridMenu instance ============
		const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
		if (!gl) {
			console.warn('WebGL2 unavailable');
			return;
		}

		const SPHERE_RADIUS = 2;
		const TARGET_FRAME_DURATION = 1000 / 60;
		const camera = {
			matrix: mat4.create(),
			near: 0.1,
			far: 40,
			fov: Math.PI / 4,
			aspect: 1,
			position: vec3.fromValues(0, 0, 3 * scale) as vec3,
			up: vec3.fromValues(0, 1, 0) as vec3,
			matrices: { view: mat4.create(), projection: mat4.create(), inversProjection: mat4.create() }
		};

		const discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], {
			aModelPosition: 0, aModelNormal: 1, aModelUvs: 2, aInstanceMatrix: 3
		});
		if (!discProgram) return;

		const discLocations = {
			aModelPosition: gl.getAttribLocation(discProgram, 'aModelPosition'),
			aModelUvs: gl.getAttribLocation(discProgram, 'aModelUvs'),
			aInstanceMatrix: gl.getAttribLocation(discProgram, 'aInstanceMatrix'),
			uWorldMatrix: gl.getUniformLocation(discProgram, 'uWorldMatrix'),
			uViewMatrix: gl.getUniformLocation(discProgram, 'uViewMatrix'),
			uProjectionMatrix: gl.getUniformLocation(discProgram, 'uProjectionMatrix'),
			uCameraPosition: gl.getUniformLocation(discProgram, 'uCameraPosition'),
			uScaleFactor: gl.getUniformLocation(discProgram, 'uScaleFactor'),
			uRotationAxisVelocity: gl.getUniformLocation(discProgram, 'uRotationAxisVelocity'),
			uTex: gl.getUniformLocation(discProgram, 'uTex'),
			uFrames: gl.getUniformLocation(discProgram, 'uFrames'),
			uItemCount: gl.getUniformLocation(discProgram, 'uItemCount'),
			uAtlasSize: gl.getUniformLocation(discProgram, 'uAtlasSize')
		};

		const discGeo = new DiscGeometry(56, 1);
		const discBuffers = discGeo.data;
		const discVAO = makeVAO(
			gl,
			[
				[makeBuffer(gl, discBuffers.vertices, gl.STATIC_DRAW), discLocations.aModelPosition, 3],
				[makeBuffer(gl, discBuffers.uvs, gl.STATIC_DRAW), discLocations.aModelUvs, 2]
			],
			discBuffers.indices
		);

		const icoGeo = new IcosahedronGeometry();
		icoGeo.subdivide(1).spherize(SPHERE_RADIUS);
		const instancePositions: vec3[] = icoGeo.vertices.map((v) => v.position);
		const DISC_INSTANCE_COUNT = icoGeo.vertices.length;

		// instances buffer
		const matricesArray = new Float32Array(DISC_INSTANCE_COUNT * 16);
		const matrices: Float32Array[] = [];
		for (let i = 0; i < DISC_INSTANCE_COUNT; ++i) {
			const m = new Float32Array(matricesArray.buffer, i * 16 * 4, 16);
			mat4.identity(m as unknown as mat4);
			matrices.push(m);
		}
		const instanceBuffer = gl.createBuffer();
		gl.bindVertexArray(discVAO);
		gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, matricesArray.byteLength, gl.DYNAMIC_DRAW);
		const bytesPerMatrix = 16 * 4;
		for (let j = 0; j < 4; ++j) {
			const loc = discLocations.aInstanceMatrix + j;
			gl.enableVertexAttribArray(loc);
			gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
			gl.vertexAttribDivisor(loc, 1);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindVertexArray(null);

		// texture atlas
		const tex = makeTexture(gl);
		const itemCount = Math.max(1, liveItems.length);
		const atlasSize = Math.ceil(Math.sqrt(itemCount));
		{
			const cellSize = 512;
			const off = document.createElement('canvas');
			off.width = atlasSize * cellSize;
			off.height = atlasSize * cellSize;
			const ctx = off.getContext('2d');
			if (ctx) {
				Promise.all(
					liveItems.map(
						(it) =>
							new Promise<HTMLImageElement>((resolve) => {
								const img = new Image();
								img.crossOrigin = 'anonymous';
								img.onload = () => resolve(img);
								img.onerror = () => resolve(img);
								img.src = it.image;
							})
					)
				).then((imgs) => {
					imgs.forEach((img, i) => {
						const x = (i % atlasSize) * cellSize;
						const y = Math.floor(i / atlasSize) * cellSize;
						try { ctx.drawImage(img, x, y, cellSize, cellSize); } catch { /* ignore */ }
					});
					gl.bindTexture(gl.TEXTURE_2D, tex);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
					gl.generateMipmap(gl.TEXTURE_2D);
				});
			}
		}

		// state
		const worldMatrix = mat4.create();
		let _time = 0, _deltaTime = 0, _deltaFrames = 0, _frames = 0;
		let smoothRotationVelocity = 0;
		let movementActive = false;

		function updateCameraMatrix() {
			mat4.targetTo(camera.matrix, camera.position, [0, 0, 0], camera.up);
			mat4.invert(camera.matrices.view, camera.matrix);
		}
		function updateProjectionMatrix() {
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			const height = SPHERE_RADIUS * 0.35;
			const distance = camera.position[2];
			if (camera.aspect > 1) camera.fov = 2 * Math.atan(height / distance);
			else camera.fov = 2 * Math.atan(height / camera.aspect / distance);
			mat4.perspective(camera.matrices.projection, camera.fov, camera.aspect, camera.near, camera.far);
			mat4.invert(camera.matrices.inversProjection, camera.matrices.projection);
		}
		function findNearestVertexIndex(): number {
			const n = arc.snapDirection;
			const inv = quat.conjugate(quat.create(), arc.orientation);
			const nt = vec3.transformQuat(vec3.create(), n, inv);
			let maxD = -1, idx = 0;
			for (let i = 0; i < instancePositions.length; ++i) {
				const d = vec3.dot(nt, instancePositions[i]);
				if (d > maxD) { maxD = d; idx = i; }
			}
			return idx;
		}
		function getVertexWorldPosition(index: number): vec3 {
			return vec3.transformQuat(vec3.create(), instancePositions[index], arc.orientation);
		}
		function onControlUpdate(deltaTime: number) {
			const timeScale = deltaTime / TARGET_FRAME_DURATION + 0.0001;
			let damping = 5 / timeScale;
			let cameraTargetZ = 3 * scale;
			const moving = arc.isPointerDown || Math.abs(smoothRotationVelocity) > 0.01;
			if (moving !== movementActive) {
				movementActive = moving;
				isMoving = moving;
			}
			if (!arc.isPointerDown) {
				const idx = findNearestVertexIndex();
				const itemIdx = idx % Math.max(1, liveItems.length);
				activeItem = liveItems[itemIdx];
				const dir = vec3.normalize(vec3.create(), getVertexWorldPosition(idx));
				arc.snapTargetDirection = dir;
			} else {
				cameraTargetZ += arc.rotationVelocity * 80 + 2.5;
				damping = 7 / timeScale;
			}
			camera.position[2] += (cameraTargetZ - camera.position[2]) / damping;
			updateCameraMatrix();
		}

		function resize() {
			const need = resizeCanvas(canvas);
			if (need) gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
			updateProjectionMatrix();
		}

		function animate(deltaTime: number) {
			arcUpdate(deltaTime, TARGET_FRAME_DURATION);
			onControlUpdate(deltaTime);
			const SCALE_INTENSITY = 0.6;
			const baseScale = 0.25;
			const positions = instancePositions.map((p) => vec3.transformQuat(vec3.create(), p, arc.orientation));
			positions.forEach((p, ndx) => {
				const s = (Math.abs(p[2]) / SPHERE_RADIUS) * SCALE_INTENSITY + (1 - SCALE_INTENSITY);
				const finalScale = s * baseScale;
				const m = mat4.create();
				mat4.multiply(m, m, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), p)));
				mat4.multiply(m, m, mat4.targetTo(mat4.create(), [0, 0, 0], p, [0, 1, 0]));
				mat4.multiply(m, m, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]));
				mat4.multiply(m, m, mat4.fromTranslation(mat4.create(), [0, 0, -SPHERE_RADIUS]));
				mat4.copy(matrices[ndx], m);
			});
			gl!.bindBuffer(gl!.ARRAY_BUFFER, instanceBuffer);
			gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, matricesArray);
			gl!.bindBuffer(gl!.ARRAY_BUFFER, null);
			smoothRotationVelocity = arc.rotationVelocity;
		}

		function render() {
			gl!.useProgram(discProgram!);
			gl!.enable(gl!.CULL_FACE);
			gl!.enable(gl!.DEPTH_TEST);
			gl!.clearColor(0, 0, 0, 0);
			gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
			gl!.uniformMatrix4fv(discLocations.uWorldMatrix, false, worldMatrix);
			gl!.uniformMatrix4fv(discLocations.uViewMatrix, false, camera.matrices.view);
			gl!.uniformMatrix4fv(discLocations.uProjectionMatrix, false, camera.matrices.projection);
			gl!.uniform3f(discLocations.uCameraPosition, camera.position[0], camera.position[1], camera.position[2]);
			gl!.uniform4f(
				discLocations.uRotationAxisVelocity,
				arc.rotationAxis[0], arc.rotationAxis[1], arc.rotationAxis[2],
				smoothRotationVelocity * 1.1
			);
			gl!.uniform1i(discLocations.uItemCount, liveItems.length);
			gl!.uniform1i(discLocations.uAtlasSize, atlasSize);
			gl!.uniform1f(discLocations.uFrames, _frames);
			gl!.uniform1f(discLocations.uScaleFactor, scale);
			gl!.uniform1i(discLocations.uTex, 0);
			gl!.activeTexture(gl!.TEXTURE0);
			gl!.bindTexture(gl!.TEXTURE_2D, tex);
			gl!.bindVertexArray(discVAO);
			gl!.drawElementsInstanced(gl!.TRIANGLES, discBuffers.indices.length, gl!.UNSIGNED_SHORT, 0, DISC_INSTANCE_COUNT);
			gl!.bindVertexArray(null);
		}

		let raf = 0;
		let stopped = false;
		function loop(time = 0) {
			if (stopped) return;
			_deltaTime = Math.min(32, time - _time);
			_time = time;
			_deltaFrames = _deltaTime / TARGET_FRAME_DURATION;
			_frames += _deltaFrames;
			animate(_deltaTime);
			render();
			raf = requestAnimationFrame(loop);
		}

		updateCameraMatrix();
		updateProjectionMatrix();
		resize();
		const onResize = () => resize();
		window.addEventListener('resize', onResize);
		loop();

		return () => {
			stopped = true;
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
			canvas.removeEventListener('pointerdown', onPointerDown);
			canvas.removeEventListener('pointerup', onPointerUp);
			canvas.removeEventListener('pointerleave', onPointerLeave);
			canvas.removeEventListener('pointermove', onPointerMove);
		};
	});

	function handleButtonClick() {
		if (!activeItem?.link) return;
		if (activeItem.link.startsWith('http')) window.open(activeItem.link, '_blank');
		else console.log('Internal route:', activeItem.link);
	}
</script>

<div class="relative w-full h-full">
	<canvas
		bind:this={canvasEl}
		id="infinite-grid-menu-canvas"
		class="cursor-grab w-full h-full overflow-hidden relative outline-none active:cursor-grabbing"
	></canvas>

	{#if activeItem}
		<h2
			class="select-none absolute font-black [font-size:4rem] left-[1.6em] top-1/2 transform translate-x-[20%] -translate-y-1/2 transition-all ease-[cubic-bezier(0.25,0.1,0.25,1.0)] {isMoving
				? 'opacity-0 pointer-events-none duration-[100ms]'
				: 'opacity-100 pointer-events-auto duration-[500ms]'}"
		>{activeItem.title}</h2>

		<p
			class="select-none absolute max-w-[10ch] text-[1.5rem] top-1/2 right-[1%] transition-all ease-[cubic-bezier(0.25,0.1,0.25,1.0)] {isMoving
				? 'opacity-0 pointer-events-none duration-[100ms] translate-x-[-60%] -translate-y-1/2'
				: 'opacity-100 pointer-events-auto duration-[500ms] translate-x-[-90%] -translate-y-1/2'}"
		>{activeItem.description}</p>

		<button
			type="button"
			onclick={handleButtonClick}
			aria-label="Open"
			class="absolute left-1/2 z-10 w-[60px] h-[60px] grid place-items-center bg-[#FF8A4C] border-[5px] border-black rounded-full cursor-pointer transition-all ease-[cubic-bezier(0.25,0.1,0.25,1.0)] {isMoving
				? 'bottom-[-80px] opacity-0 pointer-events-none duration-[100ms] scale-0 -translate-x-1/2'
				: 'bottom-[3.8em] opacity-100 pointer-events-auto duration-[500ms] scale-100 -translate-x-1/2'}"
		>
			<span class="select-none relative text-[#120F17] top-[2px] text-[26px]">&#x2197;</span>
		</button>
	{/if}
</div>
