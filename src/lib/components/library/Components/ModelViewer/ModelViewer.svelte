<!-- @svelte-bits
{
  "title": "Model Viewer",
  "description": "Interactive GLTF/GLB/FBX/OBJ model viewer with orbit, parallax, and hover effects.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

	type Props = {
		url: string;
		width?: number | string;
		height?: number | string;
		modelXOffset?: number;
		modelYOffset?: number;
		defaultRotationX?: number;
		defaultRotationY?: number;
		defaultZoom?: number;
		minZoomDistance?: number;
		maxZoomDistance?: number;
		enableMouseParallax?: boolean;
		enableManualRotation?: boolean;
		enableHoverRotation?: boolean;
		enableManualZoom?: boolean;
		ambientIntensity?: number;
		keyLightIntensity?: number;
		fillLightIntensity?: number;
		rimLightIntensity?: number;
		environmentPreset?: 'city' | 'sunset' | 'night' | 'dawn' | 'studio' | 'apartment' | 'forest' | 'park' | 'none';
		autoFrame?: boolean;
		placeholderSrc?: string;
		showScreenshotButton?: boolean;
		fadeIn?: boolean;
		autoRotate?: boolean;
		autoRotateSpeed?: number;
		onModelLoaded?: () => void;
	};

	let {
		url,
		width = 400,
		height = 400,
		modelXOffset = 0,
		modelYOffset = 0,
		defaultRotationX = -50,
		defaultRotationY = 20,
		defaultZoom = 0.5,
		minZoomDistance = 0.5,
		maxZoomDistance = 10,
		enableMouseParallax = true,
		enableManualRotation = true,
		enableHoverRotation = true,
		enableManualZoom = true,
		ambientIntensity = 0.3,
		keyLightIntensity = 1,
		fillLightIntensity = 0.5,
		rimLightIntensity = 0.8,
		environmentPreset = 'forest',
		autoFrame = false,
		placeholderSrc,
		showScreenshotButton = true,
		fadeIn = false,
		autoRotate = false,
		autoRotateSpeed = 0.35,
		onModelLoaded
	}: Props = $props();

	let containerEl: HTMLDivElement;
	let canvasEl: HTMLCanvasElement;
	let progress = $state(0);
	let loading = $state(true);
	let renderer: THREE.WebGLRenderer | undefined;
	let scene: THREE.Scene | undefined;
	let camera: THREE.PerspectiveCamera | undefined;
	let contactShadow: THREE.Mesh | undefined;

	const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
	const deg2rad = (d: number) => (d * Math.PI) / 180;
	const DECIDE = 8;
	const ROTATE_SPEED = 0.005;
	const INERTIA = 0.925;
	const PARALLAX_MAG = 0.05;
	const PARALLAX_EASE = 0.12;
	const HOVER_MAG = deg2rad(6);
	const HOVER_EASE = 0.15;

	function takeScreenshot() {
		if (!renderer || !scene || !camera) return;
		const prevShadow = renderer.shadowMap.enabled;
		renderer.shadowMap.enabled = false;
		const restored: { l: THREE.Light; cast: boolean }[] = [];
		scene.traverse((o) => {
			const l = o as THREE.Light & { castShadow?: boolean };
			if ((l as { isLight?: boolean }).isLight && 'castShadow' in l) {
				restored.push({ l, cast: l.castShadow! });
				l.castShadow = false;
			}
		});
		if (contactShadow) contactShadow.visible = false;
		renderer.render(scene, camera);
		const urlPNG = renderer.domElement.toDataURL('image/png');
		const a = document.createElement('a');
		a.download = 'model.png';
		a.href = urlPNG;
		a.click();
		renderer.shadowMap.enabled = prevShadow;
		restored.forEach(({ l, cast }) => (l.castShadow = cast));
		if (contactShadow) contactShadow.visible = true;
	}

	onMount(() => {
		const initYaw = deg2rad(defaultRotationX);
		const initPitch = deg2rad(defaultRotationY);
		const camZ = Math.min(Math.max(defaultZoom, minZoomDistance), maxZoomDistance);

		// renderer
		renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, preserveDrawingBuffer: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		const containerW = containerEl.clientWidth;
		const containerH = containerEl.clientHeight;
		renderer.setSize(containerW, containerH, false);

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(50, containerW / containerH, 0.01, 100);
		camera.position.set(0, 0, camZ);

		// environment
		if (environmentPreset !== 'none') {
			const pmrem = new THREE.PMREMGenerator(renderer);
			const env = new RoomEnvironment();
			scene.environment = pmrem.fromScene(env, 0.04).texture;
			env.dispose?.();
			pmrem.dispose();
		}

		// lights
		scene.add(new THREE.AmbientLight(0xffffff, ambientIntensity));
		const key = new THREE.DirectionalLight(0xffffff, keyLightIntensity);
		key.position.set(5, 5, 5);
		key.castShadow = true;
		scene.add(key);
		const fill = new THREE.DirectionalLight(0xffffff, fillLightIntensity);
		fill.position.set(-5, 2, 5);
		scene.add(fill);
		const rim = new THREE.DirectionalLight(0xffffff, rimLightIntensity);
		rim.position.set(0, 4, -5);
		scene.add(rim);

		// contact shadow surrogate (simple darkened plane below model)
		const shadowGeo = new THREE.PlaneGeometry(10, 10);
		const shadowMat = new THREE.MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.18,
			depthWrite: false
		});
		contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
		contactShadow.rotation.x = -Math.PI / 2;
		contactShadow.position.y = -0.5;
		scene.add(contactShadow);

		// load model
		const ext = url.split('.').pop()!.toLowerCase();
		const manager = new THREE.LoadingManager();
		manager.onProgress = (_, loaded, total) => { progress = (loaded / Math.max(1, total)) * 100; };
		manager.onLoad = () => { loading = false; };

		const outer = new THREE.Group();
		const inner = new THREE.Group();
		outer.add(inner);
		scene.add(outer);
		const pivotW = new THREE.Vector3();

		const setupModel = (content: THREE.Object3D) => {
			inner.add(content);
			inner.updateWorldMatrix(true, true);
			const sphere = new THREE.Box3().setFromObject(inner).getBoundingSphere(new THREE.Sphere());
			const s = 1 / (sphere.radius * 2);
			inner.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
			inner.scale.setScalar(s);
			inner.traverse((o) => {
				const m = o as THREE.Mesh;
				if ((m as { isMesh?: boolean }).isMesh) {
					m.castShadow = true;
					m.receiveShadow = true;
					if (fadeIn) {
						const mat = m.material as THREE.Material;
						mat.transparent = true;
						mat.opacity = 0;
					}
				}
			});
			inner.getWorldPosition(pivotW);
			outer.rotation.set(initPitch, initYaw, 0);
			if (autoFrame && camera) {
				const fitR = sphere.radius * s;
				const d = (fitR * 1.2) / Math.sin((camera.fov * Math.PI) / 180 / 2);
				camera.position.set(pivotW.x, pivotW.y, pivotW.z + d);
				camera.near = d / 10;
				camera.far = d * 10;
				camera.updateProjectionMatrix();
			}
			if (fadeIn) {
				let t = 0;
				const id = setInterval(() => {
					t += 0.05;
					const v = Math.min(t, 1);
					inner.traverse((o) => {
						const m = o as THREE.Mesh;
						if ((m as { isMesh?: boolean }).isMesh) (m.material as THREE.Material).opacity = v;
					});
					if (v === 1) {
						clearInterval(id);
						loading = false;
						onModelLoaded?.();
					}
				}, 16);
			} else {
				loading = false;
				onModelLoaded?.();
			}
		};

		const onLoadError = (err: unknown) => { console.error('Model load failed:', err); loading = false; };

		if (ext === 'glb' || ext === 'gltf') {
			const ldr = new GLTFLoader(manager);
			ldr.load(url, (gltf) => setupModel(gltf.scene), undefined, onLoadError);
		} else if (ext === 'fbx') {
			const ldr = new FBXLoader(manager);
			ldr.load(url, (fbx) => setupModel(fbx), undefined, onLoadError);
		} else if (ext === 'obj') {
			const ldr = new OBJLoader(manager);
			ldr.load(url, (obj) => setupModel(obj), undefined, onLoadError);
		} else {
			console.error('Unsupported format:', ext);
			loading = false;
		}

		// orbit controls (zoom only, target tracks pivot)
		let controls: OrbitControls | undefined;
		if (!isTouch) {
			controls = new OrbitControls(camera, renderer.domElement);
			controls.enablePan = false;
			controls.enableRotate = false;
			controls.enableZoom = enableManualZoom;
			controls.minDistance = minZoomDistance;
			controls.maxDistance = maxZoomDistance;
		}

		// rotation/parallax/hover state
		const vel = { x: 0, y: 0 };
		const tPar = { x: 0, y: 0 };
		const cPar = { x: 0, y: 0 };
		const tHov = { x: 0, y: 0 };
		const cHov = { x: 0, y: 0 };

		// desktop manual rotation
		let drag = false, lx = 0, ly = 0;
		const onDownDesktop = (e: PointerEvent) => {
			if (!enableManualRotation || isTouch) return;
			if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
			drag = true; lx = e.clientX; ly = e.clientY;
			window.addEventListener('pointerup', onUpDesktop);
		};
		const onMoveDesktop = (e: PointerEvent) => {
			if (!drag) return;
			const dx = e.clientX - lx;
			const dy = e.clientY - ly;
			lx = e.clientX; ly = e.clientY;
			outer.rotation.y += dx * ROTATE_SPEED;
			outer.rotation.x += dy * ROTATE_SPEED;
			vel.x = dx * ROTATE_SPEED;
			vel.y = dy * ROTATE_SPEED;
		};
		const onUpDesktop = () => { drag = false; };
		canvasEl.addEventListener('pointerdown', onDownDesktop);
		canvasEl.addEventListener('pointermove', onMoveDesktop);

		// touch
		const pts = new Map<number, { x: number; y: number }>();
		type Mode = 'idle' | 'decide' | 'rotate' | 'pinch';
		let mode: Mode = 'idle';
		let sx = 0, sy = 0, tlx = 0, tly = 0, startDist = 0, startZ = 0;
		const onTouchDown = (e: PointerEvent) => {
			if (!isTouch || e.pointerType !== 'touch') return;
			pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
			if (pts.size === 1) {
				mode = 'decide';
				sx = tlx = e.clientX; sy = tly = e.clientY;
			} else if (pts.size === 2 && enableManualZoom) {
				mode = 'pinch';
				const [p1, p2] = [...pts.values()];
				startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
				startZ = camera!.position.z;
				e.preventDefault();
			}
		};
		const onTouchMove = (e: PointerEvent) => {
			const p = pts.get(e.pointerId);
			if (!p) return;
			p.x = e.clientX; p.y = e.clientY;
			if (mode === 'decide') {
				const dx = e.clientX - sx, dy = e.clientY - sy;
				if (Math.abs(dx) > DECIDE || Math.abs(dy) > DECIDE) {
					if (enableManualRotation && Math.abs(dx) > Math.abs(dy)) {
						mode = 'rotate';
						canvasEl.setPointerCapture(e.pointerId);
					} else { mode = 'idle'; pts.clear(); }
				}
			}
			if (mode === 'rotate') {
				e.preventDefault();
				const dx = e.clientX - tlx, dy = e.clientY - tly;
				tlx = e.clientX; tly = e.clientY;
				outer.rotation.y += dx * ROTATE_SPEED;
				outer.rotation.x += dy * ROTATE_SPEED;
				vel.x = dx * ROTATE_SPEED; vel.y = dy * ROTATE_SPEED;
			} else if (mode === 'pinch' && pts.size === 2 && camera) {
				e.preventDefault();
				const [p1, p2] = [...pts.values()];
				const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
				const ratio = startDist / d;
				camera.position.z = THREE.MathUtils.clamp(startZ * ratio, minZoomDistance, maxZoomDistance);
			}
		};
		const onTouchUp = (e: PointerEvent) => {
			pts.delete(e.pointerId);
			if (mode === 'rotate' && pts.size === 0) mode = 'idle';
			if (mode === 'pinch' && pts.size < 2) mode = 'idle';
		};
		if (isTouch) {
			canvasEl.addEventListener('pointerdown', onTouchDown, { passive: true });
			window.addEventListener('pointermove', onTouchMove, { passive: false });
			window.addEventListener('pointerup', onTouchUp, { passive: true });
			window.addEventListener('pointercancel', onTouchUp, { passive: true });
		}

		// parallax / hover from window
		const onMM = (e: PointerEvent) => {
			if (isTouch || e.pointerType !== 'mouse') return;
			const nx = (e.clientX / window.innerWidth) * 2 - 1;
			const ny = (e.clientY / window.innerHeight) * 2 - 1;
			if (enableMouseParallax) { tPar.x = -nx * PARALLAX_MAG; tPar.y = -ny * PARALLAX_MAG; }
			if (enableHoverRotation) { tHov.x = ny * HOVER_MAG; tHov.y = nx * HOVER_MAG; }
		};
		window.addEventListener('pointermove', onMM);

		// resize observer
		const ro = new ResizeObserver(() => {
			if (!renderer || !camera) return;
			const w = containerEl.clientWidth, h = containerEl.clientHeight;
			renderer.setSize(w, h, false);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		});
		ro.observe(containerEl);

		// loop
		let raf = 0;
		const clock = new THREE.Clock();
		const tick = () => {
			const dt = clock.getDelta();
			cPar.x += (tPar.x - cPar.x) * PARALLAX_EASE;
			cPar.y += (tPar.y - cPar.y) * PARALLAX_EASE;
			const phx = cHov.x, phy = cHov.y;
			cHov.x += (tHov.x - cHov.x) * HOVER_EASE;
			cHov.y += (tHov.y - cHov.y) * HOVER_EASE;
			if (camera) {
				const ndc = pivotW.clone().project(camera);
				ndc.x += modelXOffset + cPar.x;
				ndc.y += modelYOffset + cPar.y;
				outer.position.copy(ndc.unproject(camera));
			}
			outer.rotation.x += cHov.x - phx;
			outer.rotation.y += cHov.y - phy;
			if (autoRotate) outer.rotation.y += autoRotateSpeed * dt;
			outer.rotation.y += vel.x;
			outer.rotation.x += vel.y;
			vel.x *= INERTIA;
			vel.y *= INERTIA;
			if (controls) controls.target.copy(pivotW);
			controls?.update();
			renderer!.render(scene!, camera!);
			raf = requestAnimationFrame(tick);
		};
		tick();

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			canvasEl.removeEventListener('pointerdown', onDownDesktop);
			canvasEl.removeEventListener('pointermove', onMoveDesktop);
			window.removeEventListener('pointerup', onUpDesktop);
			if (isTouch) {
				canvasEl.removeEventListener('pointerdown', onTouchDown);
				window.removeEventListener('pointermove', onTouchMove);
				window.removeEventListener('pointerup', onTouchUp);
				window.removeEventListener('pointercancel', onTouchUp);
			}
			window.removeEventListener('pointermove', onMM);
			controls?.dispose();
			renderer?.dispose();
			scene?.traverse((o) => {
				const m = o as THREE.Mesh;
				if ((m as { isMesh?: boolean }).isMesh) {
					m.geometry?.dispose();
					const mat = m.material as THREE.Material | THREE.Material[];
					if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
					else mat?.dispose();
				}
			});
		};
	});
</script>

<div
	bind:this={containerEl}
	class="relative"
	style="width:{typeof width === 'number' ? `${width}px` : width};height:{typeof height === 'number' ? `${height}px` : height};touch-action:pan-y pinch-zoom;"
>
	{#if showScreenshotButton}
		<button
			onclick={takeScreenshot}
			class="absolute top-4 right-4 z-10 cursor-pointer px-4 py-2 border border-white rounded-xl bg-transparent text-white hover:bg-white hover:text-black transition-colors"
			type="button"
		>Take Screenshot</button>
	{/if}
	<canvas bind:this={canvasEl} style="width:100%;height:100%;display:block;touch-action:pan-y pinch-zoom;"></canvas>
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
			{#if placeholderSrc}
				<img src={placeholderSrc} width="128" height="128" alt="loading" class="rounded-lg" style="filter:blur(16px);" />
			{:else}
				<span class="text-white text-sm">{Math.round(progress)} %</span>
			{/if}
		</div>
	{/if}
</div>
