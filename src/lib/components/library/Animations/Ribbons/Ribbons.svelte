<!-- @svelte-bits
{
  "title": "Ribbons",
  "description": "Colorful spring-driven ribbon trails following the cursor, rendered with OGL polylines.",
  "dependencies": ["ogl"]
}
-->
<script lang="ts">
	import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';

	type Props = {
		colors?: string[];
		baseSpring?: number;
		baseFriction?: number;
		baseThickness?: number;
		offsetFactor?: number;
		maxAge?: number;
		pointCount?: number;
		speedMultiplier?: number;
		enableFade?: boolean;
		enableShaderEffect?: boolean;
		effectAmplitude?: number;
		backgroundColor?: number[];
	};

	let {
		colors = ['#ff9346', '#7cff67', '#ffee51', '#FF8A4C'],
		baseSpring = 0.03,
		baseFriction = 0.9,
		baseThickness = 30,
		offsetFactor = 0.05,
		maxAge = 500,
		pointCount = 50,
		speedMultiplier = 0.6,
		enableFade = false,
		enableShaderEffect = false,
		effectAmplitude = 2,
		backgroundColor = [0, 0, 0, 0]
	}: Props = $props();

	let container: HTMLDivElement;

	$effect(() => {
		if (!container) return;
		const renderer = new Renderer({ dpr: window.devicePixelRatio || 2, alpha: true });
		const gl = renderer.gl;
		if (Array.isArray(backgroundColor) && backgroundColor.length === 4)
			gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
		else gl.clearColor(0, 0, 0, 0);
		gl.canvas.style.position = 'absolute';
		gl.canvas.style.top = '0';
		gl.canvas.style.left = '0';
		gl.canvas.style.width = '100%';
		gl.canvas.style.height = '100%';
		container.appendChild(gl.canvas as HTMLCanvasElement);

		const scene = new Transform();
		const lines: any[] = [];

		const vertex = `
			precision highp float;
			attribute vec3 position;
			attribute vec3 next;
			attribute vec3 prev;
			attribute vec2 uv;
			attribute float side;
			uniform vec2 uResolution;
			uniform float uDPR;
			uniform float uThickness;
			uniform float uTime;
			uniform float uEnableShaderEffect;
			uniform float uEffectAmplitude;
			varying vec2 vUV;
			vec4 getPosition(){
				vec4 current=vec4(position,1.);
				vec2 aspect=vec2(uResolution.x/uResolution.y,1.);
				vec2 nextScreen=next.xy*aspect;
				vec2 prevScreen=prev.xy*aspect;
				vec2 tangent=normalize(nextScreen-prevScreen);
				vec2 normal=vec2(-tangent.y,tangent.x);
				normal/=aspect;
				normal*=mix(1.,.1,pow(abs(uv.y-.5)*2.,2.));
				float dist=length(nextScreen-prevScreen);
				normal*=smoothstep(0.,.02,dist);
				float pixelWidthRatio=1./(uResolution.y/uDPR);
				float pixelWidth=current.w*pixelWidthRatio;
				normal*=pixelWidth*uThickness;
				current.xy-=normal*side;
				if(uEnableShaderEffect>.5){current.xy+=normal*sin(uTime+current.x*10.)*uEffectAmplitude;}
				return current;
			}
			void main(){vUV=uv;gl_Position=getPosition();}`;
		const fragment = `
			precision highp float;
			uniform vec3 uColor;
			uniform float uOpacity;
			uniform float uEnableFade;
			varying vec2 vUV;
			void main(){
				float fadeFactor=1.;
				if(uEnableFade>.5){fadeFactor=1.-smoothstep(0.,1.,vUV.y);}
				gl_FragColor=vec4(uColor,uOpacity*fadeFactor);
			}`;

		const resize = () => {
			renderer.setSize(container.clientWidth, container.clientHeight);
			lines.forEach((l) => l.polyline.resize());
		};
		window.addEventListener('resize', resize);

		const center = (colors.length - 1) / 2;
		colors.forEach((color, index) => {
			const spring = baseSpring + (Math.random() - 0.5) * 0.05;
			const friction = baseFriction + (Math.random() - 0.5) * 0.05;
			const thickness = baseThickness + (Math.random() - 0.5) * 3;
			const mouseOffset = new Vec3(
				(index - center) * offsetFactor + (Math.random() - 0.5) * 0.01,
				(Math.random() - 0.5) * 0.1,
				0
			);
			const points: Vec3[] = [];
			for (let i = 0; i < pointCount; i++) points.push(new Vec3());
			const polyline = new Polyline(gl, {
				points,
				vertex,
				fragment,
				uniforms: {
					uColor: { value: new Color(color) },
					uThickness: { value: thickness },
					uOpacity: { value: 1.0 },
					uTime: { value: 0.0 },
					uEnableShaderEffect: { value: enableShaderEffect ? 1.0 : 0.0 },
					uEffectAmplitude: { value: effectAmplitude },
					uEnableFade: { value: enableFade ? 1.0 : 0.0 }
				}
			});
			polyline.mesh.setParent(scene);
			lines.push({ spring, friction, mouseVelocity: new Vec3(), mouseOffset, points, polyline });
		});

		resize();

		const mouse = new Vec3();
		const updateMouse = (e: MouseEvent | TouchEvent) => {
			let x: number, y: number;
			const rect = container.getBoundingClientRect();
			if ('changedTouches' in e && e.changedTouches.length) {
				x = e.changedTouches[0].clientX - rect.left;
				y = e.changedTouches[0].clientY - rect.top;
			} else if (e instanceof MouseEvent) {
				x = e.clientX - rect.left;
				y = e.clientY - rect.top;
			} else {
				x = 0;
				y = 0;
			}
			mouse.set((x / container.clientWidth) * 2 - 1, (y / container.clientHeight) * -2 + 1, 0);
		};
		container.addEventListener('mousemove', updateMouse);
		container.addEventListener('touchstart', updateMouse);
		container.addEventListener('touchmove', updateMouse);

		const tmp = new Vec3();
		let raf = 0;
		let lastTime = performance.now();
		const update = () => {
			raf = requestAnimationFrame(update);
			const now = performance.now();
			const dt = now - lastTime;
			lastTime = now;
			lines.forEach((line) => {
				tmp.copy(mouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
				line.mouseVelocity.add(tmp).multiply(line.friction);
				line.points[0].add(line.mouseVelocity);
				for (let i = 1; i < line.points.length; i++) {
					if (isFinite(maxAge) && maxAge > 0) {
						const segDelay = maxAge / (line.points.length - 1);
						const alpha = Math.min(1, (dt * speedMultiplier) / segDelay);
						line.points[i].lerp(line.points[i - 1], alpha);
					} else {
						line.points[i].lerp(line.points[i - 1], 0.9);
					}
				}
				if (line.polyline.mesh.program.uniforms.uTime)
					line.polyline.mesh.program.uniforms.uTime.value = now * 0.001;
				line.polyline.updateGeometry();
			});
			renderer.render({ scene });
		};
		update();

		return () => {
			window.removeEventListener('resize', resize);
			container.removeEventListener('mousemove', updateMouse);
			container.removeEventListener('touchstart', updateMouse);
			container.removeEventListener('touchmove', updateMouse);
			cancelAnimationFrame(raf);
			if (gl.canvas && gl.canvas.parentNode === container)
				container.removeChild(gl.canvas as HTMLCanvasElement);
		};
	});
</script>

<div bind:this={container} class="absolute inset-0"></div>
