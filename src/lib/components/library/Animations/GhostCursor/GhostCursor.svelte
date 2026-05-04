<!-- @svelte-bits
{
  "title": "Ghost Cursor",
  "description": "WebGL ghostly cursor trail rendered with three.js + bloom + film grain post-processing.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

	type Props = {
		class?: string;
		style?: string;
		trailLength?: number;
		inertia?: number;
		grainIntensity?: number;
		bloomStrength?: number;
		bloomRadius?: number;
		bloomThreshold?: number;
		brightness?: number;
		color?: string;
		mixBlendMode?: string;
		edgeIntensity?: number;
		maxDevicePixelRatio?: number;
		targetPixels?: number;
		fadeDelayMs?: number;
		fadeDurationMs?: number;
		zIndex?: number;
	};

	let {
		class: className = '',
		style = '',
		trailLength = 50,
		inertia = 0.5,
		grainIntensity = 0.05,
		bloomStrength = 0.1,
		bloomRadius = 1.0,
		bloomThreshold = 0.025,
		brightness = 1,
		color = '#B497CF',
		mixBlendMode = 'screen',
		edgeIntensity = 0,
		maxDevicePixelRatio = 0.5,
		targetPixels,
		fadeDelayMs,
		fadeDurationMs,
		zIndex = 10
	}: Props = $props();

	let host: HTMLDivElement;

	$effect(() => {
		const parent = host?.parentElement;
		if (!host || !parent) return;
		let active = true;

		const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		const pixelBudget = targetPixels ?? (isTouch ? 0.9e6 : 1.3e6);
		const fadeDelay = fadeDelayMs ?? (isTouch ? 500 : 1000);
		const fadeDuration = fadeDurationMs ?? (isTouch ? 1000 : 1500);

		const prevParentPos = parent.style.position;
		if (!prevParentPos || prevParentPos === 'static') parent.style.position = 'relative';

		const renderer = new THREE.WebGLRenderer({
			antialias: !isTouch,
			alpha: true,
			depth: false,
			stencil: false,
			powerPreference: isTouch ? 'low-power' : 'high-performance',
			premultipliedAlpha: false,
			preserveDrawingBuffer: false
		});
		renderer.setClearColor(0x000000, 0);
		renderer.domElement.style.pointerEvents = 'none';
		if (mixBlendMode) renderer.domElement.style.mixBlendMode = String(mixBlendMode);
		renderer.domElement.style.display = 'block';
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.background = 'transparent';
		host.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const geom = new THREE.PlaneGeometry(2, 2);

		const maxTrail = Math.max(1, Math.floor(trailLength));
		const trailBuf = Array.from({ length: maxTrail }, () => new THREE.Vector2(0.5, 0.5));
		let head = 0;

		const baseColor = new THREE.Color(color);

		const baseVertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;
		const fragment = `
			uniform float iTime;
			uniform vec3 iResolution;
			uniform vec2 iMouse;
			uniform vec2 iPrevMouse[MAX_TRAIL_LENGTH];
			uniform float iOpacity;
			uniform float iScale;
			uniform vec3 iBaseColor;
			uniform float iBrightness;
			uniform float iEdgeIntensity;
			varying vec2 vUv;
			float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
			float noise(vec2 p){vec2 i=floor(p),f=fract(p);f*=f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
			float fbm(vec2 p){float v=0.;float a=.5;mat2 m=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));for(int i=0;i<5;i++){v+=a*noise(p);p=m*p*2.;a*=.5;}return v;}
			vec3 tint1(vec3 b){return mix(b,vec3(1.),.15);}
			vec3 tint2(vec3 b){return mix(b,vec3(.8,.9,1.),.25);}
			vec4 blob(vec2 p,vec2 mp,float intensity,float activity){
				vec2 q=vec2(fbm(p*iScale+iTime*.1),fbm(p*iScale+vec2(5.2,1.3)+iTime*.1));
				vec2 r=vec2(fbm(p*iScale+q*1.5+iTime*.15),fbm(p*iScale+q*1.5+vec2(8.3,2.8)+iTime*.15));
				float smoke=fbm(p*iScale+r*.8);
				float radius=.5+.3*(1./iScale);
				float distFactor=1.-smoothstep(0.,radius*activity,length(p-mp));
				float alpha=pow(smoke,2.5)*distFactor;
				vec3 c1=tint1(iBaseColor);
				vec3 c2=tint2(iBaseColor);
				vec3 col=mix(c1,c2,sin(iTime*.5)*.5+.5);
				return vec4(col*alpha*intensity,alpha*intensity);
			}
			void main(){
				vec2 uv=(gl_FragCoord.xy/iResolution.xy*2.-1.)*vec2(iResolution.x/iResolution.y,1.);
				vec2 mouse=(iMouse*2.-1.)*vec2(iResolution.x/iResolution.y,1.);
				vec3 colorAcc=vec3(0.);float alphaAcc=0.;
				vec4 b=blob(uv,mouse,1.,iOpacity);colorAcc+=b.rgb;alphaAcc+=b.a;
				for(int i=0;i<MAX_TRAIL_LENGTH;i++){
					vec2 pm=(iPrevMouse[i]*2.-1.)*vec2(iResolution.x/iResolution.y,1.);
					float t=1.-float(i)/float(MAX_TRAIL_LENGTH);t=pow(t,2.);
					if(t>.01){vec4 bt=blob(uv,pm,t*.8,iOpacity);colorAcc+=bt.rgb;alphaAcc+=bt.a;}
				}
				colorAcc*=iBrightness;
				vec2 uv01=gl_FragCoord.xy/iResolution.xy;
				float edgeDist=min(min(uv01.x,1.-uv01.x),min(uv01.y,1.-uv01.y));
				float distFromEdge=clamp(edgeDist*2.,0.,1.);
				float k=clamp(iEdgeIntensity,0.,1.);
				float edgeMask=mix(1.-k,1.,distFromEdge);
				float outAlpha=clamp(alphaAcc*iOpacity*edgeMask,0.,1.);
				gl_FragColor=vec4(colorAcc,outAlpha);
			}`;

		const material = new THREE.ShaderMaterial({
			defines: { MAX_TRAIL_LENGTH: maxTrail },
			uniforms: {
				iTime: { value: 0 },
				iResolution: { value: new THREE.Vector3(1, 1, 1) },
				iMouse: { value: new THREE.Vector2(0.5, 0.5) },
				iPrevMouse: { value: trailBuf.map((v) => v.clone()) },
				iOpacity: { value: 1.0 },
				iScale: { value: 1.0 },
				iBaseColor: { value: new THREE.Vector3(baseColor.r, baseColor.g, baseColor.b) },
				iBrightness: { value: brightness },
				iEdgeIntensity: { value: edgeIntensity }
			},
			vertexShader: baseVertex,
			fragmentShader: fragment,
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		const mesh = new THREE.Mesh(geom, material);
		scene.add(mesh);

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(1, 1),
			bloomStrength,
			bloomRadius,
			bloomThreshold
		);
		composer.addPass(bloomPass);

		const filmPass = new ShaderPass({
			uniforms: {
				tDiffuse: { value: null },
				iTime: { value: 0 },
				intensity: { value: grainIntensity }
			},
			vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
			fragmentShader: `uniform sampler2D tDiffuse;uniform float iTime;uniform float intensity;varying vec2 vUv;float hash1(float n){return fract(sin(n)*43758.5453);}void main(){vec4 c=texture2D(tDiffuse,vUv);float n=hash1(vUv.x*1000.+vUv.y*2000.+iTime)*2.-1.;c.rgb+=n*intensity*c.rgb;gl_FragColor=c;}`
		});
		composer.addPass(filmPass);

		const unpremultiplyPass = new ShaderPass({
			uniforms: { tDiffuse: { value: null } },
			vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
			fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float a=max(c.a,1e-5);vec3 s=c.rgb/a;gl_FragColor=vec4(clamp(s,0.,1.),c.a);}`
		});
		composer.addPass(unpremultiplyPass);

		const calcScale = (el: HTMLElement) => {
			const r = el.getBoundingClientRect();
			const current = Math.min(Math.max(1, r.width), Math.max(1, r.height));
			return Math.max(0.5, Math.min(2.0, current / 600));
		};

		let hasValidSize = false;
		const resize = () => {
			if (!active) return;
			const rect = host.getBoundingClientRect();
			const cssW = Math.floor(rect.width);
			const cssH = Math.floor(rect.height);
			if (cssW <= 0 || cssH <= 0) {
				hasValidSize = false;
				return;
			}
			const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
			const need = cssW * cssH * dpr * dpr;
			const scl =
				need <= pixelBudget
					? 1
					: Math.max(0.5, Math.min(1, Math.sqrt(pixelBudget / Math.max(1, need))));
			const pr = dpr * scl;
			renderer.setPixelRatio(pr);
			renderer.setSize(cssW, cssH, false);
			composer.setPixelRatio?.(pr);
			composer.setSize(cssW, cssH);
			const wpx = Math.max(1, Math.floor(cssW * pr));
			const hpx = Math.max(1, Math.floor(cssH * pr));
			material.uniforms.iResolution.value.set(wpx, hpx, 1);
			material.uniforms.iScale.value = calcScale(host);
			bloomPass.setSize(wpx, hpx);
			hasValidSize = true;
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(parent);
		ro.observe(host);

		const start = performance.now();
		const currentMouse = new THREE.Vector2(0.5, 0.5);
		const velocity = new THREE.Vector2(0, 0);
		let fadeOpacity = 1;
		let lastMoveTime = performance.now();
		let pointerActive = false;
		let running = false;
		let raf: number | null = null;

		const animate = () => {
			if (!active) return;
			if (!hasValidSize) {
				raf = requestAnimationFrame(animate);
				return;
			}
			const now = performance.now();
			const t = (now - start) / 1000;
			if (pointerActive) {
				velocity.set(
					currentMouse.x - material.uniforms.iMouse.value.x,
					currentMouse.y - material.uniforms.iMouse.value.y
				);
				material.uniforms.iMouse.value.copy(currentMouse);
				fadeOpacity = 1;
			} else {
				velocity.multiplyScalar(inertia);
				if (velocity.lengthSq() > 1e-6) material.uniforms.iMouse.value.add(velocity);
				const dt = now - lastMoveTime;
				if (dt > fadeDelay) {
					const k = Math.min(1, (dt - fadeDelay) / fadeDuration);
					fadeOpacity = Math.max(0, 1 - k);
				}
			}
			const N = trailBuf.length;
			head = (head + 1) % N;
			trailBuf[head].copy(material.uniforms.iMouse.value);
			const arr = material.uniforms.iPrevMouse.value as THREE.Vector2[];
			for (let i = 0; i < N; i++) {
				const srcIdx = (head - i + N) % N;
				arr[i].copy(trailBuf[srcIdx]);
			}
			material.uniforms.iOpacity.value = fadeOpacity;
			material.uniforms.iTime.value = t;
			filmPass.uniforms.iTime.value = t;
			composer.render();
			if (!pointerActive && fadeOpacity <= 0.001) {
				running = false;
				raf = null;
				return;
			}
			raf = requestAnimationFrame(animate);
		};
		const ensureLoop = () => {
			if (!running) {
				running = true;
				raf = requestAnimationFrame(animate);
			}
		};

		const onMove = (e: PointerEvent) => {
			const rect = parent.getBoundingClientRect();
			const x = THREE.MathUtils.clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
			const y = THREE.MathUtils.clamp(
				1 - (e.clientY - rect.top) / Math.max(1, rect.height),
				0,
				1
			);
			currentMouse.set(x, y);
			pointerActive = true;
			lastMoveTime = performance.now();
			ensureLoop();
		};
		const onEnter = () => {
			pointerActive = true;
			ensureLoop();
		};
		const onLeave = () => {
			pointerActive = false;
			lastMoveTime = performance.now();
			ensureLoop();
		};
		parent.addEventListener('pointermove', onMove, { passive: true });
		parent.addEventListener('pointerenter', onEnter, { passive: true });
		parent.addEventListener('pointerleave', onLeave, { passive: true });
		ensureLoop();

		return () => {
			active = false;
			if (raf) cancelAnimationFrame(raf);
			parent.removeEventListener('pointermove', onMove);
			parent.removeEventListener('pointerenter', onEnter);
			parent.removeEventListener('pointerleave', onLeave);
			ro.disconnect();
			scene.clear();
			geom.dispose();
			material.dispose();
			composer.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentElement)
				renderer.domElement.parentElement.removeChild(renderer.domElement);
			if (!prevParentPos || prevParentPos === 'static') parent.style.position = prevParentPos;
		};
	});
</script>

<div
	bind:this={host}
	class="pointer-events-none absolute inset-0 {className}"
	style="z-index:{zIndex};{style}"
></div>
