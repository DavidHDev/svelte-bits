<!-- @svelte-bits
{
  "title": "Hyperspeed",
  "description": "Three.js hyperspeed road background with bloom, SMAA, distortion presets, animated light trails, and hold-to-accelerate interaction.",
  "dependencies": ["three", "postprocessing"]
}
-->
<script module lang="ts">
	import {
		BloomEffect,
		EffectComposer,
		EffectPass,
		RenderPass,
		SMAAEffect,
		SMAAPreset
	} from 'postprocessing';
	import * as THREE from 'three';

	type Distortion = {
		uniforms: Record<string, { value: unknown }>;
		getDistortion: string;
		getJS?: (progress: number, time: number) => THREE.Vector3;
	};

	type Colors = {
		roadColor: number;
		islandColor: number;
		background: number;
		shoulderLines: number;
		brokenLines: number;
		leftCars: number[];
		rightCars: number[];
		sticks: number;
	};

	export type HyperspeedOptions = {
		onSpeedUp?: (ev: MouseEvent | TouchEvent) => void;
		onSlowDown?: (ev: MouseEvent | TouchEvent) => void;
		distortion?: string | Distortion;
		length: number;
		roadWidth: number;
		islandWidth: number;
		lanesPerRoad: number;
		fov: number;
		fovSpeedUp: number;
		speedUp: number;
		carLightsFade: number;
		totalSideLightSticks: number;
		lightPairsPerRoadWay: number;
		shoulderLinesWidthPercentage: number;
		brokenLinesWidthPercentage: number;
		brokenLinesLengthPercentage: number;
		lightStickWidth: [number, number];
		lightStickHeight: [number, number];
		movingAwaySpeed: [number, number];
		movingCloserSpeed: [number, number];
		carLightsLength: [number, number];
		carLightsRadius: [number, number];
		carWidthPercentage: [number, number];
		carShiftX: [number, number];
		carFloorSeparation: [number, number];
		colors: Colors;
		isHyper?: boolean;
	};

	export const hyperspeedPresets: Record<string, HyperspeedOptions> = {
		one: {
			onSpeedUp: () => {},
			onSlowDown: () => {},
			distortion: 'turbulentDistortion',
			length: 400,
			roadWidth: 10,
			islandWidth: 2,
			lanesPerRoad: 3,
			fov: 90,
			fovSpeedUp: 150,
			speedUp: 2,
			carLightsFade: 0.4,
			totalSideLightSticks: 20,
			lightPairsPerRoadWay: 40,
			shoulderLinesWidthPercentage: 0.05,
			brokenLinesWidthPercentage: 0.1,
			brokenLinesLengthPercentage: 0.5,
			lightStickWidth: [0.12, 0.5],
			lightStickHeight: [1.3, 1.7],
			movingAwaySpeed: [60, 80],
			movingCloserSpeed: [-120, -160],
			carLightsLength: [400 * 0.03, 400 * 0.2],
			carLightsRadius: [0.05, 0.14],
			carWidthPercentage: [0.3, 0.5],
			carShiftX: [-0.8, 0.8],
			carFloorSeparation: [0, 5],
			colors: {
				roadColor: 0x080808,
				islandColor: 0x0a0a0a,
				background: 0x000000,
				shoulderLines: 0x131318,
				brokenLines: 0x131318,
				leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
				rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
				sticks: 0x03b3c3
			}
		},
		two: {
			onSpeedUp: () => {},
			onSlowDown: () => {},
			distortion: 'mountainDistortion',
			length: 400,
			roadWidth: 9,
			islandWidth: 2,
			lanesPerRoad: 3,
			fov: 90,
			fovSpeedUp: 150,
			speedUp: 2,
			carLightsFade: 0.4,
			totalSideLightSticks: 50,
			lightPairsPerRoadWay: 50,
			shoulderLinesWidthPercentage: 0.05,
			brokenLinesWidthPercentage: 0.1,
			brokenLinesLengthPercentage: 0.5,
			lightStickWidth: [0.12, 0.5],
			lightStickHeight: [1.3, 1.7],
			movingAwaySpeed: [60, 80],
			movingCloserSpeed: [-120, -160],
			carLightsLength: [400 * 0.05, 400 * 0.15],
			carLightsRadius: [0.05, 0.14],
			carWidthPercentage: [0.3, 0.5],
			carShiftX: [-0.2, 0.2],
			carFloorSeparation: [0.05, 1],
			colors: {
				roadColor: 0x080808,
				islandColor: 0x0a0a0a,
				background: 0x000000,
				shoulderLines: 0x131318,
				brokenLines: 0x131318,
				leftCars: [0xff102a, 0xeb383e, 0xff102a],
				rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
				sticks: 0xdadafa
			}
		},
		three: {
			onSpeedUp: () => {},
			onSlowDown: () => {},
			distortion: 'xyDistortion',
			length: 400,
			roadWidth: 9,
			islandWidth: 2,
			lanesPerRoad: 3,
			fov: 90,
			fovSpeedUp: 150,
			speedUp: 3,
			carLightsFade: 0.4,
			totalSideLightSticks: 50,
			lightPairsPerRoadWay: 30,
			shoulderLinesWidthPercentage: 0.05,
			brokenLinesWidthPercentage: 0.1,
			brokenLinesLengthPercentage: 0.5,
			lightStickWidth: [0.02, 0.05],
			lightStickHeight: [0.3, 0.7],
			movingAwaySpeed: [20, 50],
			movingCloserSpeed: [-150, -230],
			carLightsLength: [400 * 0.05, 400 * 0.2],
			carLightsRadius: [0.03, 0.08],
			carWidthPercentage: [0.1, 0.5],
			carShiftX: [-0.5, 0.5],
			carFloorSeparation: [0, 0.1],
			colors: {
				roadColor: 0x080808,
				islandColor: 0x0a0a0a,
				background: 0x000000,
				shoulderLines: 0x131318,
				brokenLines: 0x131318,
				leftCars: [0x7d0d1b, 0xa90519, 0xff102a],
				rightCars: [0xf1eece, 0xe6e2b1, 0xdfd98a],
				sticks: 0xf1eece
			}
		},
		four: {
			onSpeedUp: () => {},
			onSlowDown: () => {},
			distortion: 'LongRaceDistortion',
			length: 400,
			roadWidth: 10,
			islandWidth: 5,
			lanesPerRoad: 2,
			fov: 90,
			fovSpeedUp: 150,
			speedUp: 2,
			carLightsFade: 0.4,
			totalSideLightSticks: 50,
			lightPairsPerRoadWay: 70,
			shoulderLinesWidthPercentage: 0.05,
			brokenLinesWidthPercentage: 0.1,
			brokenLinesLengthPercentage: 0.5,
			lightStickWidth: [0.12, 0.5],
			lightStickHeight: [1.3, 1.7],
			movingAwaySpeed: [60, 80],
			movingCloserSpeed: [-120, -160],
			carLightsLength: [400 * 0.05, 400 * 0.15],
			carLightsRadius: [0.05, 0.14],
			carWidthPercentage: [0.3, 0.5],
			carShiftX: [-0.2, 0.2],
			carFloorSeparation: [0.05, 1],
			colors: {
				roadColor: 0x080808,
				islandColor: 0x0a0a0a,
				background: 0x000000,
				shoulderLines: 0x131318,
				brokenLines: 0x131318,
				leftCars: [0xff5f73, 0xe74d60, 0xff102a],
				rightCars: [0xa4e3e6, 0x80d1d4, 0x53c2c6],
				sticks: 0xa4e3e6
			}
		},
		five: {
			onSpeedUp: () => {},
			onSlowDown: () => {},
			distortion: 'turbulentDistortion',
			length: 400,
			roadWidth: 9,
			islandWidth: 2,
			lanesPerRoad: 3,
			fov: 90,
			fovSpeedUp: 150,
			speedUp: 2,
			carLightsFade: 0.4,
			totalSideLightSticks: 50,
			lightPairsPerRoadWay: 50,
			shoulderLinesWidthPercentage: 0.05,
			brokenLinesWidthPercentage: 0.1,
			brokenLinesLengthPercentage: 0.5,
			lightStickWidth: [0.12, 0.5],
			lightStickHeight: [1.3, 1.7],
			movingAwaySpeed: [60, 80],
			movingCloserSpeed: [-120, -160],
			carLightsLength: [400 * 0.05, 400 * 0.15],
			carLightsRadius: [0.05, 0.14],
			carWidthPercentage: [0.3, 0.5],
			carShiftX: [-0.2, 0.2],
			carFloorSeparation: [0.05, 1],
			colors: {
				roadColor: 0x080808,
				islandColor: 0x0a0a0a,
				background: 0x000000,
				shoulderLines: 0x131318,
				brokenLines: 0x131318,
				leftCars: [0xdc5b20, 0xdca320, 0xdc2020],
				rightCars: [0x334bf7, 0xe5e6ed, 0xbfc6f3],
				sticks: 0xc5e8eb
			}
		},
		six: {
			onSpeedUp: () => {},
			onSlowDown: () => {},
			distortion: 'deepDistortion',
			length: 400,
			roadWidth: 18,
			islandWidth: 2,
			lanesPerRoad: 3,
			fov: 90,
			fovSpeedUp: 150,
			speedUp: 2,
			carLightsFade: 0.4,
			totalSideLightSticks: 50,
			lightPairsPerRoadWay: 50,
			shoulderLinesWidthPercentage: 0.05,
			brokenLinesWidthPercentage: 0.1,
			brokenLinesLengthPercentage: 0.5,
			lightStickWidth: [0.12, 0.5],
			lightStickHeight: [1.3, 1.7],
			movingAwaySpeed: [60, 80],
			movingCloserSpeed: [-120, -160],
			carLightsLength: [400 * 0.05, 400 * 0.15],
			carLightsRadius: [0.05, 0.14],
			carWidthPercentage: [0.3, 0.5],
			carShiftX: [-0.2, 0.2],
			carFloorSeparation: [0.05, 1],
			colors: {
				roadColor: 0x080808,
				islandColor: 0x0a0a0a,
				background: 0x000000,
				shoulderLines: 0x131318,
				brokenLines: 0x131318,
				leftCars: [0xff322f, 0xa33010, 0xa81508],
				rightCars: [0xfdfdf0, 0xf3dea0, 0xe2bb88],
				sticks: 0xfdfdf0
			}
		}
	};

	const defaultOptions: HyperspeedOptions = {
		onSpeedUp: () => {},
		onSlowDown: () => {},
		distortion: 'turbulentDistortion',
		length: 400,
		roadWidth: 10,
		islandWidth: 2,
		lanesPerRoad: 4,
		fov: 90,
		fovSpeedUp: 150,
		speedUp: 2,
		carLightsFade: 0.4,
		totalSideLightSticks: 20,
		lightPairsPerRoadWay: 40,
		shoulderLinesWidthPercentage: 0.05,
		brokenLinesWidthPercentage: 0.1,
		brokenLinesLengthPercentage: 0.5,
		lightStickWidth: [0.12, 0.5],
		lightStickHeight: [1.3, 1.7],
		movingAwaySpeed: [60, 80],
		movingCloserSpeed: [-120, -160],
		carLightsLength: [400 * 0.03, 400 * 0.2],
		carLightsRadius: [0.05, 0.14],
		carWidthPercentage: [0.3, 0.5],
		carShiftX: [-0.8, 0.8],
		carFloorSeparation: [0, 5],
		colors: {
			roadColor: 0x080808,
			islandColor: 0x0a0a0a,
			background: 0x000000,
			shoulderLines: 0xffffff,
			brokenLines: 0xffffff,
			leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
			rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
			sticks: 0x03b3c3
		}
	};

	function nsin(val: number) {
		return Math.sin(val) * 0.5 + 0.5;
	}

	const mountainUniforms = { uFreq: { value: new THREE.Vector3(3, 6, 10) }, uAmp: { value: new THREE.Vector3(30, 30, 20) } };
	const xyUniforms = { uFreq: { value: new THREE.Vector2(5, 2) }, uAmp: { value: new THREE.Vector2(25, 15) } };
	const LongRaceUniforms = { uFreq: { value: new THREE.Vector2(2, 3) }, uAmp: { value: new THREE.Vector2(35, 10) } };
	const turbulentUniforms = { uFreq: { value: new THREE.Vector4(4, 8, 8, 1) }, uAmp: { value: new THREE.Vector4(25, 5, 10, 10) } };
	const deepUniforms = { uFreq: { value: new THREE.Vector2(4, 8) }, uAmp: { value: new THREE.Vector2(10, 20) }, uPowY: { value: new THREE.Vector2(20, 2) } };

	const distortions: Record<string, Distortion> = {
		mountainDistortion: {
			uniforms: mountainUniforms,
			getDistortion: `
uniform vec3 uAmp;
uniform vec3 uFreq;
#define PI 3.14159265358979
float nsin(float val){
  return sin(val) * 0.5 + 0.5;
}
vec3 getDistortion(float progress){
  float movementProgressFix = 0.02;
  return vec3(
    cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
    nsin(progress * PI * uFreq.y + uTime) * uAmp.y - nsin(movementProgressFix * PI * uFreq.y + uTime) * uAmp.y,
    nsin(progress * PI * uFreq.z + uTime) * uAmp.z - nsin(movementProgressFix * PI * uFreq.z + uTime) * uAmp.z
  );
}
`,
			getJS: (progress, time) => {
				const movementProgressFix = 0.02;
				const uFreq = mountainUniforms.uFreq.value;
				const uAmp = mountainUniforms.uAmp.value;
				const distortion = new THREE.Vector3(
					Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x - Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
					nsin(progress * Math.PI * uFreq.y + time) * uAmp.y - nsin(movementProgressFix * Math.PI * uFreq.y + time) * uAmp.y,
					nsin(progress * Math.PI * uFreq.z + time) * uAmp.z - nsin(movementProgressFix * Math.PI * uFreq.z + time) * uAmp.z
				);
				return distortion.multiply(new THREE.Vector3(2, 2, 2)).add(new THREE.Vector3(0, 0, -5));
			}
		},
		xyDistortion: {
			uniforms: xyUniforms,
			getDistortion: `
uniform vec2 uFreq;
uniform vec2 uAmp;
#define PI 3.14159265358979
vec3 getDistortion(float progress){
  float movementProgressFix = 0.02;
  return vec3(
    cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
    sin(progress * PI * uFreq.y + PI/2. + uTime) * uAmp.y - sin(movementProgressFix * PI * uFreq.y + PI/2. + uTime) * uAmp.y,
    0.
  );
}
`,
			getJS: (progress, time) => {
				const movementProgressFix = 0.02;
				const uFreq = xyUniforms.uFreq.value;
				const uAmp = xyUniforms.uAmp.value;
				const distortion = new THREE.Vector3(
					Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x - Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
					Math.sin(progress * Math.PI * uFreq.y + time + Math.PI / 2) * uAmp.y - Math.sin(movementProgressFix * Math.PI * uFreq.y + time + Math.PI / 2) * uAmp.y,
					0
				);
				return distortion.multiply(new THREE.Vector3(2, 0.4, 1)).add(new THREE.Vector3(0, 0, -3));
			}
		},
		LongRaceDistortion: {
			uniforms: LongRaceUniforms,
			getDistortion: `
uniform vec2 uFreq;
uniform vec2 uAmp;
#define PI 3.14159265358979
vec3 getDistortion(float progress){
  float camProgress = 0.0125;
  return vec3(
    sin(progress * PI * uFreq.x + uTime) * uAmp.x - sin(camProgress * PI * uFreq.x + uTime) * uAmp.x,
    sin(progress * PI * uFreq.y + uTime) * uAmp.y - sin(camProgress * PI * uFreq.y + uTime) * uAmp.y,
    0.
  );
}
`,
			getJS: (progress, time) => {
				const camProgress = 0.0125;
				const uFreq = LongRaceUniforms.uFreq.value;
				const uAmp = LongRaceUniforms.uAmp.value;
				const distortion = new THREE.Vector3(
					Math.sin(progress * Math.PI * uFreq.x + time) * uAmp.x - Math.sin(camProgress * Math.PI * uFreq.x + time) * uAmp.x,
					Math.sin(progress * Math.PI * uFreq.y + time) * uAmp.y - Math.sin(camProgress * Math.PI * uFreq.y + time) * uAmp.y,
					0
				);
				return distortion.multiply(new THREE.Vector3(1, 1, 0)).add(new THREE.Vector3(0, 0, -5));
			}
		},
		turbulentDistortion: {
			uniforms: turbulentUniforms,
			getDistortion: `
uniform vec4 uFreq;
uniform vec4 uAmp;
float nsin(float val){
  return sin(val) * 0.5 + 0.5;
}
#define PI 3.14159265358979
float getDistortionX(float progress){
  return (
    cos(PI * progress * uFreq.r + uTime) * uAmp.r +
    pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2.) * uAmp.g
  );
}
float getDistortionY(float progress){
  return (
    -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
    -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
  );
}
vec3 getDistortion(float progress){
  return vec3(
    getDistortionX(progress) - getDistortionX(0.0125),
    getDistortionY(progress) - getDistortionY(0.0125),
    0.
  );
}
`,
			getJS: (progress, time) => {
				const uFreq = turbulentUniforms.uFreq.value;
				const uAmp = turbulentUniforms.uAmp.value;
				const getX = (p: number) => Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x + Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;
				const getY = (p: number) => -nsin(Math.PI * p * uFreq.z + time) * uAmp.z - Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;
				const distortion = new THREE.Vector3(getX(progress) - getX(progress + 0.007), getY(progress) - getY(progress + 0.007), 0);
				return distortion.multiply(new THREE.Vector3(-2, -5, 0)).add(new THREE.Vector3(0, 0, -10));
			}
		},
		deepDistortion: {
			uniforms: deepUniforms,
			getDistortion: `
uniform vec4 uFreq;
uniform vec4 uAmp;
uniform vec2 uPowY;
#define PI 3.14159265358979
vec3 getDistortion(float progress){
  return vec3(
    sin(progress * PI * uFreq.x + uTime) * uAmp.x - sin(0.02 * PI * uFreq.x + uTime) * uAmp.x,
    pow(abs(progress * uPowY.x), uPowY.y) + sin(progress * PI * uFreq.y + uTime) * uAmp.y - (pow(abs(0.02 * uPowY.x), uPowY.y) + sin(0.02 * PI * uFreq.y + uTime) * uAmp.y),
    0.
  );
}
`,
			getJS: (progress, time) => {
				const uFreq = deepUniforms.uFreq.value;
				const uAmp = deepUniforms.uAmp.value;
				const uPowY = deepUniforms.uPowY.value;
				const getX = (p: number) => Math.sin(p * Math.PI * uFreq.x + time) * uAmp.x;
				const getY = (p: number) => Math.pow(p * uPowY.x, uPowY.y) + Math.sin(p * Math.PI * uFreq.y + time) * uAmp.y;
				const distortion = new THREE.Vector3(getX(progress) - getX(progress + 0.01), getY(progress) - getY(progress + 0.01), 0);
				return distortion.multiply(new THREE.Vector3(-2, -4, 0)).add(new THREE.Vector3(0, 0, -10));
			}
		}
	};

	const distortionUniforms = { uDistortionX: { value: new THREE.Vector2(80, 3) }, uDistortionY: { value: new THREE.Vector2(-40, 2.5) } };
	const distortionVertex = `
#define PI 3.14159265358979
uniform vec2 uDistortionX;
uniform vec2 uDistortionY;
float nsin(float val){
  return sin(val) * 0.5 + 0.5;
}
vec3 getDistortion(float progress){
  progress = clamp(progress, 0., 1.);
  return vec3(
    uDistortionX.r * nsin(progress * PI * uDistortionX.g - PI / 2.),
    uDistortionY.r * nsin(progress * PI * uDistortionY.g - PI / 2.),
    0.
  );
}
`;

	function random(base: number | [number, number]): number {
		return Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base;
	}

	function pickRandom<T>(arr: T | T[]): T {
		return Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
	}

	function lerp(current: number, target: number, speed = 0.1, limit = 0.001): number {
		let change = (target - current) * speed;
		if (Math.abs(change) < limit) change = target - current;
		return change;
	}

	const carLightsFragment = `
#define USE_FOG;
${THREE.ShaderChunk['fog_pars_fragment']}
varying vec3 vColor;
varying vec2 vUv;
uniform vec2 uFade;
void main() {
  vec3 color = vec3(vColor);
  float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
  gl_FragColor = vec4(color, alpha);
  if (gl_FragColor.a < 0.0001) discard;
  ${THREE.ShaderChunk['fog_fragment']}
  gl_FragColor.a *= max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
}
`;
	const carLightsVertex = `
#define USE_FOG;
${THREE.ShaderChunk['fog_pars_vertex']}
attribute vec3 aOffset;
attribute vec3 aMetrics;
attribute vec3 aColor;
uniform float uTravelLength;
uniform float uTime;
varying vec2 vUv;
varying vec3 vColor;
#include <getDistortion_vertex>
void main() {
  vec3 transformed = position.xyz;
  float radius = aMetrics.r;
  float myLength = aMetrics.g;
  float speed = aMetrics.b;
  transformed.xy *= radius;
  transformed.z *= myLength;
  transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
  transformed.xy += aOffset.xy;
  float progress = abs(transformed.z / uTravelLength);
  transformed.xyz += getDistortion(progress);
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  vColor = aColor;
  ${THREE.ShaderChunk['fog_vertex']}
}
`;

	class CarLights {
		webgl: App;
		options: HyperspeedOptions;
		colors: number[] | THREE.Color;
		speed: [number, number];
		fade: THREE.Vector2;
		mesh!: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>;

		constructor(webgl: App, options: HyperspeedOptions, colors: number[] | THREE.Color, speed: [number, number], fade: THREE.Vector2) {
			this.webgl = webgl;
			this.options = options;
			this.colors = colors;
			this.speed = speed;
			this.fade = fade;
		}

		init() {
			const options = this.options;
			const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
			const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
			const instanced = new THREE.InstancedBufferGeometry().copy(
				geometry as unknown as THREE.InstancedBufferGeometry
			) as THREE.InstancedBufferGeometry;
			instanced.instanceCount = options.lightPairsPerRoadWay * 2;
			const laneWidth = options.roadWidth / options.lanesPerRoad;
			const aOffset: number[] = [];
			const aMetrics: number[] = [];
			const aColor: number[] = [];
			const colorArray = Array.isArray(this.colors) ? this.colors.map((c) => new THREE.Color(c)) : [new THREE.Color(this.colors)];

			for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
				const radius = random(options.carLightsRadius);
				const length = random(options.carLightsLength);
				const spd = random(this.speed);
				const carLane = i % options.lanesPerRoad;
				let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
				const carWidth = random(options.carWidthPercentage) * laneWidth;
				laneX += random(options.carShiftX) * laneWidth;
				const offsetY = random(options.carFloorSeparation) + radius * 1.3;
				const offsetZ = -random(options.length);
				aOffset.push(laneX - carWidth / 2, offsetY, offsetZ, laneX + carWidth / 2, offsetY, offsetZ);
				aMetrics.push(radius, length, spd, radius, length, spd);
				const color = pickRandom<THREE.Color>(colorArray);
				aColor.push(color.r, color.g, color.b, color.r, color.g, color.b);
			}

			instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false));
			instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
			instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
			const material = new THREE.ShaderMaterial({
				fragmentShader: carLightsFragment,
				vertexShader: carLightsVertex,
				transparent: true,
				uniforms: Object.assign({ uTime: { value: 0 }, uTravelLength: { value: options.length }, uFade: { value: this.fade } }, this.webgl.fogUniforms, typeof options.distortion === 'object' ? options.distortion.uniforms : {})
			});
			material.onBeforeCompile = (shader) => {
				shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', typeof options.distortion === 'object' ? options.distortion.getDistortion : '');
			};
			this.mesh = new THREE.Mesh(instanced, material);
			this.mesh.frustumCulled = false;
			this.webgl.scene.add(this.mesh);
		}

		update(time: number) {
			this.mesh.material.uniforms.uTime.value = time;
		}
	}

	const sideSticksVertex = `
#define USE_FOG;
${THREE.ShaderChunk['fog_pars_vertex']}
attribute float aOffset;
attribute vec3 aColor;
attribute vec2 aMetrics;
uniform float uTravelLength;
uniform float uTime;
varying vec3 vColor;
mat4 rotationY( in float angle ) {
  return mat4(
    cos(angle), 0, sin(angle), 0,
    0, 1.0, 0, 0,
    -sin(angle), 0, cos(angle), 0,
    0, 0, 0, 1
  );
}
#include <getDistortion_vertex>
void main(){
  vec3 transformed = position.xyz;
  float width = aMetrics.x;
  float height = aMetrics.y;
  transformed.xy *= vec2(width, height);
  float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
  transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
  transformed.z += - uTravelLength + time;
  float progress = abs(transformed.z / uTravelLength);
  transformed.xyz += getDistortion(progress);
  transformed.y += height / 2.;
  transformed.x += -width / 2.;
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
  gl_Position = projectionMatrix * mvPosition;
  vColor = aColor;
  ${THREE.ShaderChunk['fog_vertex']}
}
`;
	const sideSticksFragment = `
#define USE_FOG;
${THREE.ShaderChunk['fog_pars_fragment']}
varying vec3 vColor;
void main(){
  vec3 color = vec3(vColor);
  gl_FragColor = vec4(color,1.);
  ${THREE.ShaderChunk['fog_fragment']}
  gl_FragColor.a = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
}
`;

	class LightsSticks {
		webgl: App;
		options: HyperspeedOptions;
		mesh!: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>;

		constructor(webgl: App, options: HyperspeedOptions) {
			this.webgl = webgl;
			this.options = options;
		}

		init() {
			const options = this.options;
			const geometry = new THREE.PlaneGeometry(1, 1);
			const instanced = new THREE.InstancedBufferGeometry().copy(
				geometry as unknown as THREE.InstancedBufferGeometry
			) as THREE.InstancedBufferGeometry;
			const totalSticks = options.totalSideLightSticks;
			instanced.instanceCount = totalSticks;
			const stickoffset = options.length / (totalSticks - 1);
			const aOffset: number[] = [];
			const aColor: number[] = [];
			const aMetrics: number[] = [];
			const colorArray = Array.isArray(options.colors.sticks) ? options.colors.sticks.map((c) => new THREE.Color(c)) : [new THREE.Color(options.colors.sticks)];
			for (let i = 0; i < totalSticks; i++) {
				const width = random(options.lightStickWidth);
				const height = random(options.lightStickHeight);
				aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());
				const color = pickRandom<THREE.Color>(colorArray);
				aColor.push(color.r, color.g, color.b);
				aMetrics.push(width, height);
			}
			instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false));
			instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
			instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false));
			const material = new THREE.ShaderMaterial({
				fragmentShader: sideSticksFragment,
				vertexShader: sideSticksVertex,
				side: THREE.DoubleSide,
				transparent: true,
				uniforms: Object.assign({ uTravelLength: { value: options.length }, uTime: { value: 0 } }, this.webgl.fogUniforms, typeof options.distortion === 'object' ? options.distortion.uniforms : {})
			});
			material.onBeforeCompile = (shader) => {
				shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', typeof options.distortion === 'object' ? options.distortion.getDistortion : '');
			};
			this.mesh = new THREE.Mesh(instanced, material);
			this.mesh.frustumCulled = false;
			this.webgl.scene.add(this.mesh);
		}

		update(time: number) {
			this.mesh.material.uniforms.uTime.value = time;
		}
	}

	const roadMarkingsVars = `
uniform float uLanes;
uniform vec3 uBrokenLinesColor;
uniform vec3 uShoulderLinesColor;
uniform float uShoulderLinesWidthPercentage;
uniform float uBrokenLinesWidthPercentage;
uniform float uBrokenLinesLengthPercentage;
highp float random(vec2 co) {
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy, vec2(a, b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}
`;
	const roadMarkingsFragment = `
uv.y = mod(uv.y + uTime * 0.05, 1.);
float laneWidth = 1.0 / uLanes;
float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;
float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * 2.0)) * step(laneEmptySpace, fract(uv.y * 10.0));
float sideLines = step(1.0 - brokenLineWidth, fract((uv.x - laneWidth * (uLanes - 1.0)) * 2.0)) + step(brokenLineWidth, uv.x);
brokenLines = mix(brokenLines, sideLines, uv.x);
`;
	const roadBaseFragment = `
#define USE_FOG;
varying vec2 vUv;
uniform vec3 uColor;
uniform float uTime;
#include <roadMarkings_vars>
${THREE.ShaderChunk['fog_pars_fragment']}
void main() {
  vec2 uv = vUv;
  vec3 color = vec3(uColor);
  #include <roadMarkings_fragment>
  gl_FragColor = vec4(color, 1.);
  ${THREE.ShaderChunk['fog_fragment']}
  gl_FragColor.a = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
}
`;
	const islandFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>', '').replace('#include <roadMarkings_vars>', '');
	const roadFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>', roadMarkingsFragment).replace('#include <roadMarkings_vars>', roadMarkingsVars);
	const roadVertex = `
#define USE_FOG;
uniform float uTime;
${THREE.ShaderChunk['fog_pars_vertex']}
uniform float uTravelLength;
varying vec2 vUv;
#include <getDistortion_vertex>
void main() {
  vec3 transformed = position.xyz;
  vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
  transformed.x += distortion.x;
  transformed.z += distortion.y;
  transformed.y += -1. * distortion.z;
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  ${THREE.ShaderChunk['fog_vertex']}
}
`;

	class Road {
		webgl: App;
		options: HyperspeedOptions;
		uTime = { value: 0 };
		leftRoadWay!: THREE.Mesh;
		rightRoadWay!: THREE.Mesh;
		island!: THREE.Mesh;

		constructor(webgl: App, options: HyperspeedOptions) {
			this.webgl = webgl;
			this.options = options;
		}

		createPlane(side: number, isRoad: boolean) {
			const options = this.options;
			const geometry = new THREE.PlaneGeometry(isRoad ? options.roadWidth : options.islandWidth, options.length, 20, 100);
			let uniforms: Record<string, { value: unknown }> = { uTravelLength: { value: options.length }, uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) }, uTime: this.uTime };
			if (isRoad) {
				uniforms = Object.assign(uniforms, {
					uLanes: { value: options.lanesPerRoad },
					uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
					uShoulderLinesColor: { value: new THREE.Color(options.colors.shoulderLines) },
					uShoulderLinesWidthPercentage: { value: options.shoulderLinesWidthPercentage },
					uBrokenLinesLengthPercentage: { value: options.brokenLinesLengthPercentage },
					uBrokenLinesWidthPercentage: { value: options.brokenLinesWidthPercentage }
				});
			}
			const material = new THREE.ShaderMaterial({
				fragmentShader: isRoad ? roadFragment : islandFragment,
				vertexShader: roadVertex,
				side: THREE.DoubleSide,
				transparent: true,
				uniforms: Object.assign(uniforms, this.webgl.fogUniforms, typeof options.distortion === 'object' ? options.distortion.uniforms : {})
			});
			material.onBeforeCompile = (shader) => {
				shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', typeof options.distortion === 'object' ? options.distortion.getDistortion : '');
			};
			const mesh = new THREE.Mesh(geometry, material);
			mesh.rotation.x = -Math.PI / 2;
			mesh.position.z = -options.length / 2;
			mesh.position.x += (options.islandWidth / 2 + options.roadWidth / 2) * side;
			this.webgl.scene.add(mesh);
			return mesh;
		}

		init() {
			this.leftRoadWay = this.createPlane(-1, true);
			this.rightRoadWay = this.createPlane(1, true);
			this.island = this.createPlane(0, false);
		}

		update(time: number) {
			this.uTime.value = time;
		}
	}

	function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer, setSize: (width: number, height: number, updateStyle: boolean) => void) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (width <= 0 || height <= 0) return false;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) setSize(width, height, false);
		return needResize;
	}

	class App {
		container: HTMLElement;
		options: HyperspeedOptions;
		renderer: THREE.WebGLRenderer;
		composer: EffectComposer;
		camera: THREE.PerspectiveCamera;
		scene: THREE.Scene;
		renderPass!: RenderPass;
		bloomPass!: EffectPass;
		clock = new THREE.Clock();
		assets: Record<string, unknown> = {};
		disposed = false;
		road: Road;
		leftCarLights: CarLights;
		rightCarLights: CarLights;
		leftSticks: LightsSticks;
		fogUniforms: Record<string, { value: unknown }>;
		fovTarget: number;
		speedUpTarget = 0;
		speedUp = 0;
		timeOffset = 0;
		hasValidSize: boolean;

		constructor(container: HTMLElement, options: HyperspeedOptions) {
			this.options = options;
			if (!this.options.distortion) this.options.distortion = { uniforms: distortionUniforms, getDistortion: distortionVertex };
			this.container = container;
			this.hasValidSize = false;
			const initW = Math.max(1, container.offsetWidth);
			const initH = Math.max(1, container.offsetHeight);
			this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
			this.renderer.setClearColor(0x000000, 0);
			this.renderer.setSize(initW, initH, false);
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.domElement.style.position = 'absolute';
			this.renderer.domElement.style.inset = '0';
			this.renderer.domElement.style.width = '100%';
			this.renderer.domElement.style.height = '100%';
			this.renderer.domElement.style.display = 'block';
			this.composer = new EffectComposer(this.renderer);
			container.appendChild(this.renderer.domElement);
			this.camera = new THREE.PerspectiveCamera(options.fov, initW / initH, 0.1, 10000);
			this.camera.position.set(0, 8, -5);
			this.scene = new THREE.Scene();
			this.scene.background = null;
			const fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500);
			this.scene.fog = fog;
			this.fogUniforms = { fogColor: { value: fog.color }, fogNear: { value: fog.near }, fogFar: { value: fog.far } };
			this.road = new Road(this, options);
			this.leftCarLights = new CarLights(this, options, options.colors.leftCars, options.movingAwaySpeed, new THREE.Vector2(0, 1 - options.carLightsFade));
			this.rightCarLights = new CarLights(this, options, options.colors.rightCars, options.movingCloserSpeed, new THREE.Vector2(1, options.carLightsFade));
			this.leftSticks = new LightsSticks(this, options);
			this.fovTarget = options.fov;
			window.addEventListener('resize', this.onWindowResize);
			if (container.offsetWidth > 0 && container.offsetHeight > 0) this.hasValidSize = true;
		}

		onWindowResize = () => {
			const width = this.container.offsetWidth;
			const height = this.container.offsetHeight;
			if (width <= 0 || height <= 0) {
				this.hasValidSize = false;
				return;
			}
			this.renderer.setSize(width, height);
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.composer.setSize(width, height);
			this.hasValidSize = true;
		};

		initPasses() {
			this.renderPass = new RenderPass(this.scene, this.camera);
			this.bloomPass = new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 }));
			const smaaPass = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM }));
			this.renderPass.renderToScreen = false;
			this.bloomPass.renderToScreen = false;
			smaaPass.renderToScreen = true;
			this.composer.addPass(this.renderPass);
			this.composer.addPass(this.bloomPass);
			this.composer.addPass(smaaPass);
		}

		loadAssets(): Promise<void> {
			const assets = this.assets as Record<string, Record<string, HTMLImageElement>>;
			return new Promise((resolve) => {
				const manager = new THREE.LoadingManager(resolve);
				const searchImage = new Image();
				const areaImage = new Image();
				assets.smaa = {};
				searchImage.addEventListener('load', function () { assets.smaa.search = this as HTMLImageElement; manager.itemEnd('smaa-search'); });
				areaImage.addEventListener('load', function () { assets.smaa.area = this as HTMLImageElement; manager.itemEnd('smaa-area'); });
				manager.itemStart('smaa-search');
				manager.itemStart('smaa-area');
				searchImage.src = SMAAEffect.searchImageDataURL;
				areaImage.src = SMAAEffect.areaImageDataURL;
			});
		}

		init() {
			this.initPasses();
			const options = this.options;
			this.road.init();
			this.leftCarLights.init();
			this.leftCarLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2);
			this.rightCarLights.init();
			this.rightCarLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2);
			this.leftSticks.init();
			this.leftSticks.mesh.position.setX(-(options.roadWidth + options.islandWidth / 2));
			this.container.addEventListener('mousedown', this.onMouseDown);
			this.container.addEventListener('mouseup', this.onMouseUp);
			this.container.addEventListener('mouseout', this.onMouseUp);
			this.container.addEventListener('touchstart', this.onTouchStart, { passive: true });
			this.container.addEventListener('touchend', this.onTouchEnd, { passive: true });
			this.container.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
			this.container.addEventListener('contextmenu', this.onContextMenu);
			this.tick();
		}

		onMouseDown = (ev: MouseEvent) => { this.options.onSpeedUp?.(ev); this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp; };
		onMouseUp = (ev: MouseEvent) => { this.options.onSlowDown?.(ev); this.fovTarget = this.options.fov; this.speedUpTarget = 0; };
		onTouchStart = (ev: TouchEvent) => { this.options.onSpeedUp?.(ev); this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp; };
		onTouchEnd = (ev: TouchEvent) => { this.options.onSlowDown?.(ev); this.fovTarget = this.options.fov; this.speedUpTarget = 0; };
		onContextMenu = (ev: MouseEvent) => ev.preventDefault();

		update(delta: number) {
			const lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
			this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
			this.timeOffset += this.speedUp * delta;
			const time = this.clock.elapsedTime + this.timeOffset;
			this.rightCarLights.update(time);
			this.leftCarLights.update(time);
			this.leftSticks.update(time);
			this.road.update(time);
			let updateCamera = false;
			const fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
			if (fovChange !== 0) {
				this.camera.fov += fovChange * delta * 6;
				updateCamera = true;
			}
			if (typeof this.options.distortion === 'object' && this.options.distortion.getJS) {
				const distortion = this.options.distortion.getJS(0.025, time);
				this.camera.lookAt(new THREE.Vector3(this.camera.position.x + distortion.x, this.camera.position.y + distortion.y, this.camera.position.z + distortion.z));
				updateCamera = true;
			}
			if (updateCamera) this.camera.updateProjectionMatrix();
		}

		dispose() {
			this.disposed = true;
			this.scene.traverse((object) => {
				const obj = object as THREE.Mesh;
				if (!obj.isMesh) return;
				obj.geometry?.dispose();
				if (Array.isArray(obj.material)) obj.material.forEach((material) => material.dispose());
				else obj.material?.dispose();
			});
			this.scene.clear();
			this.renderer.dispose();
			this.renderer.forceContextLoss();
			this.renderer.domElement.parentNode?.removeChild(this.renderer.domElement);
			this.composer.dispose();
			window.removeEventListener('resize', this.onWindowResize);
			this.container.removeEventListener('mousedown', this.onMouseDown);
			this.container.removeEventListener('mouseup', this.onMouseUp);
			this.container.removeEventListener('mouseout', this.onMouseUp);
			this.container.removeEventListener('touchstart', this.onTouchStart);
			this.container.removeEventListener('touchend', this.onTouchEnd);
			this.container.removeEventListener('touchcancel', this.onTouchEnd);
			this.container.removeEventListener('contextmenu', this.onContextMenu);
		}

		setSize = (width: number, height: number, updateStyles: boolean) => this.composer.setSize(width, height, updateStyles);

		tick = () => {
			if (this.disposed) return;
			if (!this.hasValidSize) {
				const w = this.container.offsetWidth;
				const h = this.container.offsetHeight;
				if (w > 0 && h > 0) {
					this.renderer.setSize(w, h, false);
					this.camera.aspect = w / h;
					this.camera.updateProjectionMatrix();
					this.composer.setSize(w, h);
					this.hasValidSize = true;
				} else {
					requestAnimationFrame(this.tick);
					return;
				}
			}
			if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
				const canvas = this.renderer.domElement;
				if (this.hasValidSize) {
					this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
					this.camera.updateProjectionMatrix();
				}
			}
			if (this.hasValidSize) {
				const delta = this.clock.getDelta();
				this.composer.render(delta);
				this.update(delta);
			}
			requestAnimationFrame(this.tick);
		};
	}

	function resolveOptions(effectOptions: Partial<HyperspeedOptions>): HyperspeedOptions {
		const options = { ...defaultOptions, ...effectOptions, colors: { ...defaultOptions.colors, ...effectOptions.colors } } as HyperspeedOptions;
		if (typeof options.distortion === 'string') options.distortion = distortions[options.distortion];
		return options;
	}
</script>

<script lang="ts">
	type Props = {
		effectOptions?: Partial<HyperspeedOptions>;
		class?: string;
	};

	let { effectOptions = {}, class: className = '' }: Props = $props();
	let container: HTMLDivElement;

	$effect(() => {
		const currentContainer = container;
		if (!currentContainer) return;
		while (currentContainer.firstChild) currentContainer.removeChild(currentContainer.firstChild);

		const app = new App(currentContainer, resolveOptions(effectOptions));
		let cancelled = false;
		app.loadAssets().then(() => {
			if (!cancelled) app.init();
		});

		return () => {
			cancelled = true;
			app.dispose();
			while (currentContainer.firstChild) currentContainer.removeChild(currentContainer.firstChild);
		};
	});
</script>

<div bind:this={container} class="relative h-full w-full overflow-hidden {className}"></div>
