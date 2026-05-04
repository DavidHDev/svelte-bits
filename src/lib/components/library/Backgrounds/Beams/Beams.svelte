<!-- @svelte-bits {"title":"Beams","description":"Light beams animated with noise displacement.","dependencies":["three"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type Props = {
		beamWidth?: number;
		beamHeight?: number;
		beamNumber?: number;
		lightColor?: string;
		speed?: number;
		noiseIntensity?: number;
		scale?: number;
		rotation?: number;
	};

	let {
		beamWidth = 2,
		beamHeight = 15,
		beamNumber = 12,
		lightColor = '#ffffff',
		speed = 2,
		noiseIntensity = 1.75,
		scale = 0.2,
		rotation = 0
	}: Props = $props();

	let containerRef: HTMLDivElement;

	const noiseGLSL = `
float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }
float noise (in vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5; gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5; gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  return 2.2 * mix(n_yz.x,n_yz.y,fade_xyz.x);
}
`;

	function hexToNormalizedRGB(hex: string): [number, number, number] {
		const c = hex.replace('#', '');
		return [parseInt(c.substring(0, 2), 16) / 255, parseInt(c.substring(2, 4), 16) / 255, parseInt(c.substring(4, 6), 16) / 255];
	}

	function createStackedPlanesBufferGeometry(n: number, width: number, height: number, spacing: number, heightSegments: number) {
		const geometry = new THREE.BufferGeometry();
		const numVertices = n * (heightSegments + 1) * 2;
		const numFaces = n * heightSegments * 2;
		const positions = new Float32Array(numVertices * 3);
		const indices = new Uint32Array(numFaces * 3);
		const uvs = new Float32Array(numVertices * 2);
		let vO = 0, iO = 0, uO = 0;
		const totalWidth = n * width + (n - 1) * spacing;
		const xOffsetBase = -totalWidth / 2;
		for (let i = 0; i < n; i++) {
			const xOffset = xOffsetBase + i * (width + spacing);
			const uvX = Math.random() * 300;
			const uvY = Math.random() * 300;
			for (let j = 0; j <= heightSegments; j++) {
				const y = height * (j / heightSegments - 0.5);
				positions.set([xOffset, y, 0, xOffset + width, y, 0], vO * 3);
				const uvYy = j / heightSegments;
				uvs.set([uvX, uvYy + uvY, uvX + 1, uvYy + uvY], uO);
				if (j < heightSegments) {
					const a = vO, b = vO + 1, c = vO + 2, d = vO + 3;
					indices.set([a, b, c, c, b, d], iO);
					iO += 6;
				}
				vO += 2;
				uO += 4;
			}
		}
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		geometry.computeVertexNormals();
		return geometry;
	}

	function makeMaterial(speedV: number, noiseIntensityV: number, scaleV: number) {
		const physical = THREE.ShaderLib.physical as THREE.ShaderLibShader & { defines?: Record<string, unknown> };
		const baseUniforms = THREE.UniformsUtils.clone(physical.uniforms);
		const defaults = new THREE.MeshStandardMaterial();
		baseUniforms.diffuse.value = new THREE.Color(0, 0, 0);
		baseUniforms.roughness.value = 0.3;
		baseUniforms.metalness.value = 0.3;
		baseUniforms.envMapIntensity.value = 10;

		const uniforms = {
			...baseUniforms,
			time: { value: 0 },
			uSpeed: { value: speedV },
			uNoiseIntensity: { value: noiseIntensityV },
			uScale: { value: scaleV }
		};

		const header = `
varying vec3 vEye;
varying float vNoise;
uniform float time;
uniform float uSpeed;
uniform float uNoiseIntensity;
uniform float uScale;
${noiseGLSL}`;

		const vertexHeader = `
float getPos(vec3 pos) {
  vec3 noisePos = vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
  return cnoise(noisePos);
}
vec3 getCurrentPos(vec3 pos) {
  vec3 newpos = pos;
  newpos.z += getPos(pos);
  return newpos;
}
vec3 getNormal(vec3 pos) {
  vec3 curpos = getCurrentPos(pos);
  vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
  vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
  vec3 tangentX = normalize(nextposX - curpos);
  vec3 tangentZ = normalize(nextposZ - curpos);
  return normalize(cross(tangentZ, tangentX));
}`;

		let vert = `${header}\n${vertexHeader}\n${physical.vertexShader}`;
		vert = vert.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed.z += getPos(transformed.xyz);`);
		vert = vert.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\nobjectNormal = getNormal(position.xyz);`);

		let frag = `${header}\n${physical.fragmentShader}`;
		frag = frag.replace('#include <dithering_fragment>', `#include <dithering_fragment>\nfloat randomNoise = noise(gl_FragCoord.xy);\ngl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;`);

		const defines: Record<string, unknown> = { ...((physical.defines ?? {}) as Record<string, unknown>) };
		defaults.dispose();

		return new THREE.ShaderMaterial({
			defines: defines as Record<string, string | number | boolean>,
			uniforms,
			vertexShader: vert,
			fragmentShader: frag,
			lights: true,
			fog: true
		});
	}

	onMount(() => {
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 0);
		const w0 = containerRef.clientWidth, h0 = containerRef.clientHeight;
		renderer.setSize(w0, h0);
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(30, w0 / h0, 0.1, 100);
		camera.position.set(0, 0, 20);

		const ambient = new THREE.AmbientLight(0xffffff, 1);
		scene.add(ambient);

		const dir = new THREE.DirectionalLight(lightColor, 1);
		dir.position.set(0, 3, 10);
		const cam = dir.shadow.camera as THREE.OrthographicCamera;
		cam.top = 24; cam.bottom = -24; cam.left = -24; cam.right = 24; cam.far = 64;
		dir.shadow.bias = -0.004;
		scene.add(dir);

		const group = new THREE.Group();
		group.rotation.z = (rotation * Math.PI) / 180;
		scene.add(group);

		let material = makeMaterial(speed, noiseIntensity, scale);
		let geometry = createStackedPlanesBufferGeometry(beamNumber, beamWidth, beamHeight, 0, 100);
		let mesh = new THREE.Mesh(geometry, material);
		group.add(mesh);

		let lastConfig = { beamNumber, beamWidth, beamHeight };

		const onResize = () => {
			const w = containerRef.clientWidth, h = containerRef.clientHeight;
			renderer.setSize(w, h);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		};
		const ro = new ResizeObserver(onResize);
		ro.observe(containerRef);

		const clock = new THREE.Clock();
		let raf = 0;
		const tick = () => {
			const delta = clock.getDelta();
			material.uniforms.time.value += 0.1 * delta;
			material.uniforms.uSpeed.value = speed;
			material.uniforms.uNoiseIntensity.value = noiseIntensity;
			material.uniforms.uScale.value = scale;
			(dir.color as THREE.Color).set(lightColor);
			group.rotation.z = (rotation * Math.PI) / 180;

			if (lastConfig.beamNumber !== beamNumber || lastConfig.beamWidth !== beamWidth || lastConfig.beamHeight !== beamHeight) {
				group.remove(mesh);
				geometry.dispose();
				geometry = createStackedPlanesBufferGeometry(beamNumber, beamWidth, beamHeight, 0, 100);
				mesh = new THREE.Mesh(geometry, material);
				group.add(mesh);
				lastConfig = { beamNumber, beamWidth, beamHeight };
			}

			renderer.render(scene, camera);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full"></div>
