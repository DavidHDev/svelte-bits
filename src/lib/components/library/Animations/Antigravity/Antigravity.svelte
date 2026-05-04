<!-- @svelte-bits
{
  "title": "Antigravity",
  "description": "Instanced 3D particles that orbit and react to the mouse with wave physics, rendered with three.js.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import * as THREE from 'three';

	type Props = {
		count?: number;
		magnetRadius?: number;
		ringRadius?: number;
		waveSpeed?: number;
		waveAmplitude?: number;
		particleSize?: number;
		lerpSpeed?: number;
		color?: string;
		autoAnimate?: boolean;
		particleVariance?: number;
		rotationSpeed?: number;
		depthFactor?: number;
		pulseSpeed?: number;
		particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron';
		fieldStrength?: number;
		class?: string;
	};

	let {
		count = 300,
		magnetRadius = 10,
		ringRadius = 10,
		waveSpeed = 0.4,
		waveAmplitude = 1,
		particleSize = 2,
		lerpSpeed = 0.1,
		color = '#FF9FFC',
		autoAnimate = false,
		particleVariance = 1,
		rotationSpeed = 0,
		depthFactor = 1,
		pulseSpeed = 3,
		particleShape = 'capsule',
		fieldStrength = 10,
		class: className = ''
	}: Props = $props();

	let host: HTMLDivElement;

	$effect(() => {
		if (!host) return;
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 0);
		host.appendChild(renderer.domElement);
		renderer.domElement.style.display = 'block';
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
		camera.position.set(0, 0, 50);

		let geom: THREE.BufferGeometry;
		switch (particleShape) {
			case 'sphere':
				geom = new THREE.SphereGeometry(0.2, 16, 16);
				break;
			case 'box':
				geom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
				break;
			case 'tetrahedron':
				geom = new THREE.TetrahedronGeometry(0.3);
				break;
			default:
				geom = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
		}
		const mat = new THREE.MeshBasicMaterial({ color });
		const mesh = new THREE.InstancedMesh(geom, mat, count);
		scene.add(mesh);
		const dummy = new THREE.Object3D();

		let viewportW = 100;
		let viewportH = 100;

		const computeViewport = () => {
			const dist = camera.position.z;
			const fov = (camera.fov * Math.PI) / 180;
			viewportH = 2 * Math.tan(fov / 2) * dist;
			viewportW = viewportH * camera.aspect;
		};

		const particles = Array.from({ length: count }, () => ({
			t: Math.random() * 100,
			speed: 0.01 + Math.random() / 200,
			mx: 0,
			my: 0,
			mz: 0,
			cx: 0,
			cy: 0,
			cz: 0,
			randomRadiusOffset: (Math.random() - 0.5) * 2
		}));
		const initParticles = () => {
			for (const p of particles) {
				p.mx = p.cx = (Math.random() - 0.5) * viewportW;
				p.my = p.cy = (Math.random() - 0.5) * viewportH;
				p.mz = p.cz = (Math.random() - 0.5) * 20;
			}
		};

		const resize = () => {
			const r = host.getBoundingClientRect();
			renderer.setSize(r.width, r.height, false);
			camera.aspect = r.width / r.height || 1;
			camera.updateProjectionMatrix();
			computeViewport();
		};
		resize();
		initParticles();
		const ro = new ResizeObserver(resize);
		ro.observe(host);

		const pointer = { x: 0, y: 0 };
		const lastMousePos = { x: 0, y: 0 };
		let lastMoveTime = 0;
		const virtualMouse = { x: 0, y: 0 };

		const onMove = (e: PointerEvent) => {
			const r = host.getBoundingClientRect();
			pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
			pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
		};
		host.addEventListener('pointermove', onMove);

		const clock = new THREE.Clock();
		let raf = 0;
		const tick = () => {
			const time = clock.getElapsedTime();
			const md = Math.hypot(pointer.x - lastMousePos.x, pointer.y - lastMousePos.y);
			if (md > 0.001) {
				lastMoveTime = Date.now();
				lastMousePos.x = pointer.x;
				lastMousePos.y = pointer.y;
			}
			let destX = (pointer.x * viewportW) / 2;
			let destY = (pointer.y * viewportH) / 2;
			if (autoAnimate && Date.now() - lastMoveTime > 2000) {
				destX = Math.sin(time * 0.5) * (viewportW / 4);
				destY = Math.cos(time * 1) * (viewportH / 4);
			}
			virtualMouse.x += (destX - virtualMouse.x) * 0.05;
			virtualMouse.y += (destY - virtualMouse.y) * 0.05;
			const tx = virtualMouse.x;
			const ty = virtualMouse.y;
			const globalRot = time * rotationSpeed;

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				p.t += p.speed / 2;
				const proj = 1 - p.cz / 50;
				const ptx = tx * proj;
				const pty = ty * proj;
				const dx = p.mx - ptx;
				const dy = p.my - pty;
				const dist = Math.hypot(dx, dy);
				let tpx = p.mx;
				let tpy = p.my;
				let tpz = p.mz * depthFactor;
				if (dist < magnetRadius) {
					const angle = Math.atan2(dy, dx) + globalRot;
					const wave = Math.sin(p.t * waveSpeed + angle) * (0.5 * waveAmplitude);
					const dev = p.randomRadiusOffset * (5 / (fieldStrength + 0.1));
					const cr = ringRadius + wave + dev;
					tpx = ptx + cr * Math.cos(angle);
					tpy = pty + cr * Math.sin(angle);
					tpz = p.mz * depthFactor + Math.sin(p.t) * (1 * waveAmplitude * depthFactor);
				}
				p.cx += (tpx - p.cx) * lerpSpeed;
				p.cy += (tpy - p.cy) * lerpSpeed;
				p.cz += (tpz - p.cz) * lerpSpeed;
				dummy.position.set(p.cx, p.cy, p.cz);
				dummy.lookAt(ptx, pty, p.cz);
				dummy.rotateX(Math.PI / 2);
				const cdm = Math.hypot(p.cx - ptx, p.cy - pty);
				const dfr = Math.abs(cdm - ringRadius);
				let sf = 1 - dfr / 10;
				sf = Math.max(0, Math.min(1, sf));
				const fs = sf * (0.8 + Math.sin(p.t * pulseSpeed) * 0.2 * particleVariance) * particleSize;
				dummy.scale.set(fs, fs, fs);
				dummy.updateMatrix();
				mesh.setMatrixAt(i, dummy.matrix);
			}
			mesh.instanceMatrix.needsUpdate = true;
			renderer.render(scene, camera);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			host.removeEventListener('pointermove', onMove);
			geom.dispose();
			mat.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
		};
	});
</script>

<div bind:this={host} class="w-full h-full {className}"></div>
