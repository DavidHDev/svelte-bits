<!-- @svelte-bits {"title":"Grid Scan","description":"Animated 3D grid scan with bloom and chromatic aberration. Optional face tracking via face-api.js.","dependencies":["three","postprocessing","face-api.js"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
	import * as faceapi from 'face-api.js';

	type Props = {
		enableWebcam?: boolean;
		showPreview?: boolean;
		modelsPath?: string;
		sensitivity?: number;
		lineThickness?: number;
		linesColor?: string;
		gridScale?: number;
		lineStyle?: 'solid' | 'dashed' | 'dotted';
		lineJitter?: number;
		enablePost?: boolean;
		bloomIntensity?: number;
		bloomThreshold?: number;
		bloomSmoothing?: number;
		chromaticAberration?: number;
		noiseIntensity?: number;
		scanColor?: string;
		scanOpacity?: number;
		scanDirection?: 'forward' | 'backward' | 'pingpong';
		scanSoftness?: number;
		scanGlow?: number;
		scanPhaseTaper?: number;
		scanDuration?: number;
		scanDelay?: number;
		enableGyro?: boolean;
		scanOnClick?: boolean;
		snapBackDelay?: number;
		class?: string;
	};

	let {
		enableWebcam = false,
		showPreview = false,
		modelsPath = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights',
		sensitivity = 0.55,
		lineThickness = 1,
		linesColor = '#222222',
		scanColor = '#ff8a3d',
		scanOpacity = 0.4,
		gridScale = 0.1,
		lineStyle = 'solid',
		lineJitter = 0.1,
		scanDirection = 'pingpong',
		enablePost = true,
		bloomIntensity = 0,
		bloomThreshold = 0,
		bloomSmoothing = 0,
		chromaticAberration = 0.002,
		noiseIntensity = 0.01,
		scanGlow = 0.5,
		scanSoftness = 2,
		scanPhaseTaper = 0.9,
		scanDuration = 2.0,
		scanDelay = 2.0,
		enableGyro = false,
		scanOnClick = false,
		snapBackDelay = 250,
		class: className = ''
	}: Props = $props();

	const current = $derived({
		lineThickness, linesColor, scanColor, scanOpacity, gridScale, lineStyle, lineJitter,
		scanDirection, bloomIntensity, bloomThreshold, bloomSmoothing, chromaticAberration,
		noiseIntensity, scanGlow, scanSoftness, scanPhaseTaper, scanDuration, scanDelay,
		enableGyro, scanOnClick, snapBackDelay, sensitivity
	});

	let containerRef: HTMLDivElement;
	let videoRef: HTMLVideoElement;
	let modelsReady = $state(false);
	let uiFaceActive = $state(false);

	const vert = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

	const frag = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;
uniform float uScanStarts[8];
uniform float uScanCount;
const int MAX_SCANS = 8;
float smoother01(float a, float b, float x){ float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0); return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(p, 2.0));
  float cR = cos(uTilt), sR = sin(uTilt);
  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;
  float cY = cos(uYaw), sY = sin(uYaw);
  rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;
  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
  rd.xy += skew * rd.z;
  vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  float fadeStrength = 2.0;
  vec2 gridUV = vec2(0.0);
  float hitIsY = 1.0;
  for (int i = 0; i < 4; i++) {
    float isY = float(i < 2);
    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
    float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
    float den = isY * rd.y + (1.0 - isY) * rd.x;
    float t = num / den;
    vec3 h = ro + rd * t;
    float depthBoost = smoothstep(0.0, 3.0, h.z);
    h.xy += skew * 0.15 * depthBoost;
    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }
  vec3 hit = ro + rd * minT;
  float dist = length(hit - ro);
  float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
  if (jitterAmt > 0.0) {
    vec2 j = vec2(sin(gridUV.y * 2.7 + iTime * 1.8), cos(gridUV.x * 2.3 - iTime * 1.6)) * (0.15 * jitterAmt);
    gridUV += j;
  }
  float fx = fract(gridUV.x); float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx); float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x); float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;
  float tx = halfPx * wx; float ty = halfPx * wy;
  float aax = wx; float aay = wy;
  float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
  float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
  if (uLineStyle > 0.5) {
    float dashRepeat = 4.0; float dashDuty = 0.5;
    float vy = fract(gridUV.y * dashRepeat); float vx = fract(gridUV.x * dashRepeat);
    float dashMaskY = step(vy, dashDuty); float dashMaskX = step(vx, dashDuty);
    if (uLineStyle < 1.5) { lineX *= dashMaskY; lineY *= dashMaskX; }
    else {
      float dotRepeat = 6.0; float dotWidth = 0.18;
      float cy = abs(fract(gridUV.y * dotRepeat) - 0.5); float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
      float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
      float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
      lineX *= dotMaskY; lineY *= dotMaskX;
    }
  }
  float primaryMask = max(lineX, lineY);
  vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
  if (jitterAmt > 0.0) {
    vec2 j2 = vec2(cos(gridUV2.y * 2.1 - iTime * 1.4), sin(gridUV2.x * 2.5 + iTime * 1.7)) * (0.15 * jitterAmt);
    gridUV2 += j2;
  }
  float fx2 = fract(gridUV2.x); float fy2 = fract(gridUV2.y);
  float ax2 = min(fx2, 1.0 - fx2); float ay2 = min(fy2, 1.0 - fy2);
  float wx2 = fwidth(gridUV2.x); float wy2 = fwidth(gridUV2.y);
  float tx2 = halfPx * wx2; float ty2 = halfPx * wy2;
  float aax2 = wx2; float aay2 = wy2;
  float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
  float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
  if (uLineStyle > 0.5) {
    float dashRepeat2 = 4.0; float dashDuty2 = 0.5;
    float vy2m = fract(gridUV2.y * dashRepeat2); float vx2m = fract(gridUV2.x * dashRepeat2);
    float dashMaskY2 = step(vy2m, dashDuty2); float dashMaskX2 = step(vx2m, dashDuty2);
    if (uLineStyle < 1.5) { lineX2 *= dashMaskY2; lineY2 *= dashMaskX2; }
    else {
      float dotRepeat2 = 6.0; float dotWidth2 = 0.18;
      float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5); float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
      float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
      float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
      lineX2 *= dotMaskY2; lineY2 *= dotMaskX2;
    }
  }
  float altMask = max(lineX2, lineY2);
  float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
  float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
  float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
  float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
  altMask *= edgeGate;
  float lineMask = max(primaryMask, altMask);
  float fade = exp(-dist * fadeStrength);
  float dur = max(0.05, uScanDuration);
  float del = max(0.0, uScanDelay);
  float scanZMax = 2.0;
  float widthScale = max(0.1, uScanGlow);
  float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
  float sigmaA = sigma * 2.0;
  float combinedPulse = 0.0; float combinedAura = 0.0;
  float cycle = dur + del; float tCycle = mod(iTime, cycle);
  float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
  float phase = scanPhase;
  if (uScanDirection > 0.5 && uScanDirection < 1.5) phase = 1.0 - phase;
  else if (uScanDirection > 1.5) {
    float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
    phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
  }
  float scanZ = phase * scanZMax;
  float dz = abs(hit.z - scanZ);
  float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
  float taper = clamp(uPhaseTaper, 0.0, 0.49);
  float headW = taper; float tailW = taper;
  float headFade = smoother01(0.0, headW, phase);
  float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
  float phaseWindow = headFade * tailFade;
  float pulseBase = lineBand * phaseWindow;
  combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
  float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
  combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);
  for (int i = 0; i < MAX_SCANS; i++) {
    if (float(i) >= uScanCount) break;
    float tActiveI = iTime - uScanStarts[i];
    float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
    if (uScanDirection > 0.5 && uScanDirection < 1.5) phaseI = 1.0 - phaseI;
    else if (uScanDirection > 1.5) phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
    float scanZI = phaseI * scanZMax;
    float dzI = abs(hit.z - scanZI);
    float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
    float headFadeI = smoother01(0.0, headW, phaseI);
    float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
    float phaseWindowI = headFadeI * tailFadeI;
    combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
    float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
    combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
  }
  float lineVis = lineMask;
  vec3 gridCol = uLinesColor * lineVis * fade;
  vec3 scanCol = uScanColor * combinedPulse;
  vec3 scanAura = uScanColor * combinedAura;
  color = gridCol + scanCol + scanAura;
  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);
  float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
  float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
  float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
  float halo = max(gx, gy) * fade;
  alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));
  fragColor = vec4(color, alpha);
}
void main(){ vec4 c; mainImage(c, vUv * iResolution.xy); gl_FragColor = c; }
`;

	function srgbColor(hex: string) {
		return new THREE.Color(hex).convertSRGBToLinear();
	}

	function smoothDampVec2(curr: THREE.Vector2, target: THREE.Vector2, vel: THREE.Vector2, smoothTime: number, deltaTime: number) {
		smoothTime = Math.max(0.0001, smoothTime);
		const omega = 2 / smoothTime;
		const x = omega * deltaTime;
		const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
		const change = curr.clone().sub(target);
		const originalTo = target.clone();
		const newTarget = curr.clone().sub(change);
		const temp = vel.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);
		vel.sub(temp.clone().multiplyScalar(omega));
		vel.multiplyScalar(exp);
		const out = newTarget.clone().add(change.add(temp).multiplyScalar(exp));
		const origMinusCurr = originalTo.clone().sub(curr);
		const outMinusOrig = out.clone().sub(originalTo);
		if (origMinusCurr.dot(outMinusOrig) > 0) { out.copy(originalTo); vel.set(0, 0); }
		return out;
	}

	function smoothDampFloat(curr: number, target: number, velRef: { v: number }, smoothTime: number, deltaTime: number) {
		smoothTime = Math.max(0.0001, smoothTime);
		const omega = 2 / smoothTime;
		const x = omega * deltaTime;
		const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
		const change = curr - target;
		const originalTo = target;
		const newTarget = curr - change;
		const temp = (velRef.v + omega * change) * deltaTime;
		velRef.v = (velRef.v - omega * temp) * exp;
		let out = newTarget + (change + temp) * exp;
		if ((originalTo - curr) * (out - originalTo) > 0) { out = originalTo; velRef.v = 0; }
		return out;
	}

	function medianPush(buf: number[], v: number, maxLen: number) { buf.push(v); if (buf.length > maxLen) buf.shift(); }
	function median(buf: number[]) {
		if (buf.length === 0) return 0;
		const a = [...buf].sort((x, y) => x - y);
		const mid = Math.floor(a.length / 2);
		return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) * 0.5;
	}
	function centroid(pts: { x: number; y: number }[]) { let x = 0, y = 0; const n = pts.length || 1; for (const p of pts) { x += p.x; y += p.y; } return { x: x / n, y: y / n }; }
	function dist2(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }

	onMount(() => {
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.NoToneMapping;
		renderer.autoClear = false;
		renderer.setClearColor(0x000000, 0);
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(renderer.domElement);

		const MAX_SCANS = 8;
		const uniforms: Record<string, { value: unknown }> = {
			iResolution: { value: new THREE.Vector3(containerRef.clientWidth, containerRef.clientHeight, renderer.getPixelRatio()) },
			iTime: { value: 0 },
			uSkew: { value: new THREE.Vector2(0, 0) },
			uTilt: { value: 0 },
			uYaw: { value: 0 },
			uLineThickness: { value: lineThickness },
			uLinesColor: { value: srgbColor(linesColor) },
			uScanColor: { value: srgbColor(scanColor) },
			uGridScale: { value: gridScale },
			uLineStyle: { value: lineStyle === 'dashed' ? 1 : lineStyle === 'dotted' ? 2 : 0 },
			uLineJitter: { value: Math.max(0, Math.min(1, lineJitter || 0)) },
			uScanOpacity: { value: scanOpacity },
			uNoise: { value: noiseIntensity },
			uBloomOpacity: { value: bloomIntensity },
			uScanGlow: { value: scanGlow },
			uScanSoftness: { value: scanSoftness },
			uPhaseTaper: { value: scanPhaseTaper },
			uScanDuration: { value: scanDuration },
			uScanDelay: { value: scanDelay },
			uScanDirection: { value: scanDirection === 'backward' ? 1 : scanDirection === 'pingpong' ? 2 : 0 },
			uScanStarts: { value: new Array(MAX_SCANS).fill(0) },
			uScanCount: { value: 0 }
		};

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: vert,
			fragmentShader: frag,
			transparent: true,
			depthWrite: false,
			depthTest: false
		});

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
		scene.add(quad);

		let composer: EffectComposer | null = null;
		let bloom: BloomEffect | null = null;
		let chroma: ChromaticAberrationEffect | null = null;
		if (enablePost) {
			composer = new EffectComposer(renderer);
			composer.addPass(new RenderPass(scene, camera));
			bloom = new BloomEffect({ intensity: 1.0, luminanceThreshold: bloomThreshold, luminanceSmoothing: bloomSmoothing });
			bloom.blendMode.opacity.value = Math.max(0, bloomIntensity);
			chroma = new ChromaticAberrationEffect({
				offset: new THREE.Vector2(chromaticAberration, chromaticAberration),
				radialModulation: true,
				modulationOffset: 0.0
			});
			const ep = new EffectPass(camera, bloom, chroma);
			ep.renderToScreen = true;
			composer.addPass(ep);
		}

		const onResize = () => {
			const w = containerRef.clientWidth, h = containerRef.clientHeight;
			renderer.setSize(w, h);
			(uniforms.iResolution.value as THREE.Vector3).set(w, h, renderer.getPixelRatio());
			composer?.setSize(w, h);
		};
		window.addEventListener('resize', onResize);

		const lookTarget = new THREE.Vector2(0, 0);
		const lookCurrent = new THREE.Vector2(0, 0);
		const lookVel = new THREE.Vector2(0, 0);
		let tiltTarget = 0, tiltCurrent = 0; const tiltVel = { v: 0 };
		let yawTarget = 0, yawCurrent = 0; const yawVel = { v: 0 };
		const scanStarts: number[] = [];
		let leaveTimer: number | null = null;

		const pushScan = (t: number) => {
			if (scanStarts.length >= MAX_SCANS) scanStarts.shift();
			scanStarts.push(t);
			const buf = new Array(MAX_SCANS).fill(0);
			for (let i = 0; i < scanStarts.length; i++) buf[i] = scanStarts[i];
			uniforms.uScanStarts.value = buf;
			uniforms.uScanCount.value = scanStarts.length;
		};

		const onMove = (e: MouseEvent) => {
			if (uiFaceActive) return;
			if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
			const rect = containerRef.getBoundingClientRect();
			const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
			lookTarget.set(nx, ny);
		};
		const onClick = async () => {
			const nowSec = performance.now() / 1000;
			if (current.scanOnClick) pushScan(nowSec);
			if (current.enableGyro && typeof window !== 'undefined') {
				const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
				if (D?.requestPermission) { try { await D.requestPermission(); } catch { /* noop */ } }
			}
		};
		const onEnter = () => { if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; } };
		const onLeave = () => {
			if (uiFaceActive) return;
			if (leaveTimer) clearTimeout(leaveTimer);
			leaveTimer = window.setTimeout(() => {
				lookTarget.set(0, 0); tiltTarget = 0; yawTarget = 0;
			}, Math.max(0, current.snapBackDelay || 0));
		};
		containerRef.addEventListener('mousemove', onMove);
		containerRef.addEventListener('mouseenter', onEnter);
		containerRef.addEventListener('mouseleave', onLeave);
		containerRef.addEventListener('click', onClick);

		const gyroHandler = (e: DeviceOrientationEvent) => {
			if (!current.enableGyro || uiFaceActive) return;
			const gamma = e.gamma ?? 0;
			const beta = e.beta ?? 0;
			const nx = THREE.MathUtils.clamp(gamma / 45, -1, 1);
			const ny = THREE.MathUtils.clamp(-beta / 30, -1, 1);
			lookTarget.set(nx, ny);
			tiltTarget = THREE.MathUtils.degToRad(gamma) * 0.4;
		};
		window.addEventListener('deviceorientation', gyroHandler);

		// Face-api.js path
		let modelsCanceled = false;
		(async () => {
			if (!enableWebcam) return;
			try {
				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
					faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath)
				]);
				if (!modelsCanceled) modelsReady = true;
			} catch { /* noop */ }
		})();

		let stopFace = false;
		let faceStream: MediaStream | null = null;
		const bufX: number[] = [], bufY: number[] = [], bufT: number[] = [], bufYaw: number[] = [];
		(async function startFace() {
			while (!modelsReady && enableWebcam && !stopFace) await new Promise((r) => setTimeout(r, 100));
			if (!enableWebcam || stopFace || !videoRef) return;
			try {
				faceStream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
					audio: false
				});
				videoRef.srcObject = faceStream;
				await videoRef.play();
			} catch { return; }
			const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
			let lastDetect = 0;
			const detect = async (ts: number) => {
				if (stopFace) return;
				if (ts - lastDetect >= 33) {
					lastDetect = ts;
					try {
						const res = await faceapi.detectSingleFace(videoRef, opts).withFaceLandmarks(true);
						if (res && res.detection) {
							const det = res.detection;
							const box = det.box;
							const vw = videoRef.videoWidth || 1;
							const vh = videoRef.videoHeight || 1;
							const cx = box.x + box.width * 0.5;
							const cy = box.y + box.height * 0.5;
							const nx = (cx / vw) * 2 - 1;
							const ny = (cy / vh) * 2 - 1;
							medianPush(bufX, nx, 5);
							medianPush(bufY, ny, 5);
							const nxm = median(bufX); const nym = median(bufY);
							const look = new THREE.Vector2(Math.tanh(nxm), Math.tanh(nym));
							const sNorm = THREE.MathUtils.clamp(current.sensitivity, 0, 1);
							const depthResponse = THREE.MathUtils.lerp(0.25, 0.45, sNorm);
							const faceSize = Math.min(1, Math.hypot(box.width / vw, box.height / vh));
							const depthScale = 1 + depthResponse * (faceSize - 0.25);
							lookTarget.copy(look.multiplyScalar(depthScale));
							const lc = centroid(res.landmarks.getLeftEye());
							const rc = centroid(res.landmarks.getRightEye());
							const tilt = Math.atan2(rc.y - lc.y, rc.x - lc.x);
							medianPush(bufT, tilt, 5);
							tiltTarget = median(bufT);
							const nose = res.landmarks.getNose();
							const tip = nose[nose.length - 1] || nose[Math.floor(nose.length / 2)];
							const jaw = res.landmarks.getJawOutline();
							const leftCheek = jaw[3] || jaw[2];
							const rightCheek = jaw[13] || jaw[14];
							const dL = dist2(tip, leftCheek);
							const dR = dist2(tip, rightCheek);
							const eyeDist = Math.hypot(rc.x - lc.x, rc.y - lc.y) + 1e-6;
							let yawSig = THREE.MathUtils.clamp((dR - dL) / (eyeDist * 1.6), -1, 1);
							yawSig = Math.tanh(yawSig);
							medianPush(bufYaw, yawSig, 5);
							yawTarget = median(bufYaw);
							uiFaceActive = true;
						} else {
							uiFaceActive = false;
						}
					} catch { uiFaceActive = false; }
				}
				const v = videoRef as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => void };
				if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(() => detect(performance.now()));
				else requestAnimationFrame(detect);
			};
			requestAnimationFrame(detect);
		})();

		let last = performance.now();
		let raf = 0;
		const tick = () => {
			const now = performance.now();
			const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
			last = now;

			const sNorm = THREE.MathUtils.clamp(current.sensitivity, 0, 1);
			const skewScale = THREE.MathUtils.lerp(0.06, 0.2, sNorm);
			const tiltScale = THREE.MathUtils.lerp(0.12, 0.3, sNorm);
			const yawScale = THREE.MathUtils.lerp(0.1, 0.28, sNorm);
			const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, sNorm);
			const yBoost = THREE.MathUtils.lerp(1.2, 1.6, sNorm);

			lookCurrent.copy(smoothDampVec2(lookCurrent, lookTarget, lookVel, smoothTime, dt));
			tiltCurrent = smoothDampFloat(tiltCurrent, tiltTarget, tiltVel, smoothTime, dt);
			yawCurrent = smoothDampFloat(yawCurrent, yawTarget, yawVel, smoothTime, dt);

			(uniforms.uSkew.value as THREE.Vector2).set(lookCurrent.x * skewScale, -lookCurrent.y * yBoost * skewScale);
			uniforms.uTilt.value = tiltCurrent * tiltScale;
			uniforms.uYaw.value = THREE.MathUtils.clamp(yawCurrent * yawScale, -0.6, 0.6);
			uniforms.iTime.value = now / 1000;

			uniforms.uLineThickness.value = current.lineThickness;
			(uniforms.uLinesColor.value as THREE.Color).copy(srgbColor(current.linesColor));
			(uniforms.uScanColor.value as THREE.Color).copy(srgbColor(current.scanColor));
			uniforms.uGridScale.value = current.gridScale;
			uniforms.uLineStyle.value = current.lineStyle === 'dashed' ? 1 : current.lineStyle === 'dotted' ? 2 : 0;
			uniforms.uLineJitter.value = Math.max(0, Math.min(1, current.lineJitter || 0));
			uniforms.uBloomOpacity.value = Math.max(0, current.bloomIntensity);
			uniforms.uNoise.value = Math.max(0, current.noiseIntensity);
			uniforms.uScanGlow.value = current.scanGlow;
			uniforms.uScanOpacity.value = Math.max(0, Math.min(1, current.scanOpacity));
			uniforms.uScanDirection.value = current.scanDirection === 'backward' ? 1 : current.scanDirection === 'pingpong' ? 2 : 0;
			uniforms.uScanSoftness.value = current.scanSoftness;
			uniforms.uPhaseTaper.value = current.scanPhaseTaper;
			uniforms.uScanDuration.value = Math.max(0.05, current.scanDuration);
			uniforms.uScanDelay.value = Math.max(0, current.scanDelay);

			if (bloom) {
				bloom.blendMode.opacity.value = Math.max(0, current.bloomIntensity);
				const bm = bloom as unknown as { luminanceMaterial: { threshold: number; smoothing: number } };
				bm.luminanceMaterial.threshold = current.bloomThreshold;
				bm.luminanceMaterial.smoothing = current.bloomSmoothing;
			}
			if (chroma) chroma.offset.set(current.chromaticAberration, current.chromaticAberration);

			renderer.clear(true, true, true);
			if (composer) composer.render(dt); else renderer.render(scene, camera);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('deviceorientation', gyroHandler);
			containerRef.removeEventListener('mousemove', onMove);
			containerRef.removeEventListener('mouseenter', onEnter);
			containerRef.removeEventListener('mouseleave', onLeave);
			containerRef.removeEventListener('click', onClick);
			if (leaveTimer) clearTimeout(leaveTimer);
			modelsCanceled = true;
			stopFace = true;
			if (faceStream) faceStream.getTracks().forEach((t) => t.stop());
			if (videoRef) { videoRef.pause(); videoRef.srcObject = null; }
			material.dispose();
			(quad.geometry as THREE.BufferGeometry).dispose();
			composer?.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full overflow-hidden {className}">
	{#if showPreview}
		<div class="pointer-events-none absolute right-3 bottom-3 h-[132px] w-[220px] overflow-hidden rounded-lg border border-white/25 bg-black font-sans text-[12px] leading-[1.2] text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video bind:this={videoRef} muted playsinline autoplay class="h-full w-full -scale-x-100 object-cover"></video>
			<div class="absolute top-2 left-2 rounded-[6px] bg-black/50 px-[6px] py-[2px] backdrop-blur-[4px]">
				{enableWebcam ? (modelsReady ? (uiFaceActive ? 'Face: tracking' : 'Face: searching') : 'Loading models') : 'Webcam disabled'}
			</div>
		</div>
	{/if}
</div>
