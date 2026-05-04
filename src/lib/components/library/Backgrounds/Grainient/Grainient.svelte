<!-- @svelte-bits {"title":"Grainient","description":"Animated WebGL2 grainy gradient.","dependencies":["ogl"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Triangle } from 'ogl';

	type Props = {
		timeSpeed?: number;
		colorBalance?: number;
		warpStrength?: number;
		warpFrequency?: number;
		warpSpeed?: number;
		warpAmplitude?: number;
		blendAngle?: number;
		blendSoftness?: number;
		rotationAmount?: number;
		noiseScale?: number;
		grainAmount?: number;
		grainScale?: number;
		grainAnimated?: boolean;
		contrast?: number;
		gamma?: number;
		saturation?: number;
		centerX?: number;
		centerY?: number;
		zoom?: number;
		color1?: string;
		color2?: string;
		color3?: string;
		class?: string;
	};

	let {
		timeSpeed = 0.25,
		colorBalance = 0,
		warpStrength = 1,
		warpFrequency = 5,
		warpSpeed = 2,
		warpAmplitude = 50,
		blendAngle = 0,
		blendSoftness = 0.05,
		rotationAmount = 500,
		noiseScale = 2,
		grainAmount = 0.1,
		grainScale = 2,
		grainAnimated = false,
		contrast = 1.5,
		gamma = 1,
		saturation = 1,
		centerX = 0,
		centerY = 0,
		zoom = 0.9,
		color1 = '#FF9FFC',
		color2 = '#ff8a3d',
		color3 = '#B497CF',
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;

	const current = $derived({
		timeSpeed,
		colorBalance,
		warpStrength,
		warpFrequency,
		warpSpeed,
		warpAmplitude,
		blendAngle,
		blendSoftness,
		rotationAmount,
		noiseScale,
		grainAmount,
		grainScale,
		grainAnimated,
		contrast,
		gamma,
		saturation,
		centerX,
		centerY,
		zoom,
		color1,
		color2,
		color3
	});

	function hexToRgb(hex: string): [number, number, number] {
		const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : [1, 1, 1];
	}

	onMount(() => {
		const renderer = new Renderer({
			webgl: 2,
			alpha: true,
			antialias: false,
			dpr: Math.min(window.devicePixelRatio || 1, 2)
		});
		const gl = renderer.gl;
		const canvas = gl.canvas as HTMLCanvasElement;
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.display = 'block';
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(canvas);

		const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

		const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);} 
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);
  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;
  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);
  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));
  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);} 
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;
  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  o=vec4(col,1.0);
}
void main(){ vec4 o=vec4(0.0); mainImage(o,gl_FragCoord.xy); fragColor=o; }`;

		const geometry = new Triangle(gl);
		const program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				iTime: { value: 0 },
				iResolution: { value: new Float32Array([1, 1]) },
				uTimeSpeed: { value: timeSpeed },
				uColorBalance: { value: colorBalance },
				uWarpStrength: { value: warpStrength },
				uWarpFrequency: { value: warpFrequency },
				uWarpSpeed: { value: warpSpeed },
				uWarpAmplitude: { value: warpAmplitude },
				uBlendAngle: { value: blendAngle },
				uBlendSoftness: { value: blendSoftness },
				uRotationAmount: { value: rotationAmount },
				uNoiseScale: { value: noiseScale },
				uGrainAmount: { value: grainAmount },
				uGrainScale: { value: grainScale },
				uGrainAnimated: { value: grainAnimated ? 1 : 0 },
				uContrast: { value: contrast },
				uGamma: { value: gamma },
				uSaturation: { value: saturation },
				uCenterOffset: { value: new Float32Array([centerX, centerY]) },
				uZoom: { value: zoom },
				uColor1: { value: new Float32Array(hexToRgb(color1)) },
				uColor2: { value: new Float32Array(hexToRgb(color2)) },
				uColor3: { value: new Float32Array(hexToRgb(color3)) }
			}
		});

		const mesh = new Mesh(gl, { geometry, program });

		const setSize = () => {
			const rect = containerRef.getBoundingClientRect();
			const w = Math.max(1, Math.floor(rect.width));
			const h = Math.max(1, Math.floor(rect.height));
			renderer.setSize(w, h);
			const res = (program.uniforms.iResolution as { value: Float32Array }).value;
			res[0] = gl.drawingBufferWidth;
			res[1] = gl.drawingBufferHeight;
		};
		const ro = new ResizeObserver(setSize);
		ro.observe(containerRef);
		setSize();

		let raf = 0;
		const t0 = performance.now();
		const loop = (t: number) => {
			(program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;
			(program.uniforms.uTimeSpeed as { value: number }).value = current.timeSpeed;
			(program.uniforms.uColorBalance as { value: number }).value = current.colorBalance;
			(program.uniforms.uWarpStrength as { value: number }).value = current.warpStrength;
			(program.uniforms.uWarpFrequency as { value: number }).value = current.warpFrequency;
			(program.uniforms.uWarpSpeed as { value: number }).value = current.warpSpeed;
			(program.uniforms.uWarpAmplitude as { value: number }).value = current.warpAmplitude;
			(program.uniforms.uBlendAngle as { value: number }).value = current.blendAngle;
			(program.uniforms.uBlendSoftness as { value: number }).value = current.blendSoftness;
			(program.uniforms.uRotationAmount as { value: number }).value = current.rotationAmount;
			(program.uniforms.uNoiseScale as { value: number }).value = current.noiseScale;
			(program.uniforms.uGrainAmount as { value: number }).value = current.grainAmount;
			(program.uniforms.uGrainScale as { value: number }).value = current.grainScale;
			(program.uniforms.uGrainAnimated as { value: number }).value = current.grainAnimated ? 1 : 0;
			(program.uniforms.uContrast as { value: number }).value = current.contrast;
			(program.uniforms.uGamma as { value: number }).value = current.gamma;
			(program.uniforms.uSaturation as { value: number }).value = current.saturation;
			(program.uniforms.uZoom as { value: number }).value = current.zoom;
			const co = (program.uniforms.uCenterOffset as { value: Float32Array }).value;
			co[0] = current.centerX;
			co[1] = current.centerY;
			(program.uniforms.uColor1 as { value: Float32Array }).value.set(hexToRgb(current.color1));
			(program.uniforms.uColor2 as { value: Float32Array }).value.set(hexToRgb(current.color2));
			(program.uniforms.uColor3 as { value: Float32Array }).value.set(hexToRgb(current.color3));
			renderer.render({ scene: mesh });
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full overflow-hidden {className}"></div>
