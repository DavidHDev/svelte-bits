<!-- @svelte-bits
{
  "title": "Meta Balls",
  "description": "Animated metaballs (gooey blob field) with cursor interaction, rendered with OGL shader.",
  "dependencies": ["ogl"]
}
-->
<script module lang="ts">
	function parseHexColor(hex: string): [number, number, number] {
		const c = hex.replace('#', '');
		return [
			parseInt(c.substring(0, 2), 16) / 255,
			parseInt(c.substring(2, 4), 16) / 255,
			parseInt(c.substring(4, 6), 16) / 255
		];
	}
	const fract = (x: number) => x - Math.floor(x);
	function hash31(p: number) {
		const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
		const ryzx = [r[1], r[2], r[0]];
		const dot = r[0] * (ryzx[0] + 33.33) + r[1] * (ryzx[1] + 33.33) + r[2] * (ryzx[2] + 33.33);
		for (let i = 0; i < 3; i++) r[i] = fract(r[i] + dot);
		return r;
	}
	function hash33(v: number[]) {
		const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
		const pyxz = [p[1], p[0], p[2]];
		const dot = p[0] * (pyxz[0] + 33.33) + p[1] * (pyxz[1] + 33.33) + p[2] * (pyxz[2] + 33.33);
		for (let i = 0; i < 3; i++) p[i] = fract(p[i] + dot);
		const pxxy = [p[0], p[0], p[1]];
		const pyxx = [p[1], p[0], p[0]];
		const pzyx = [p[2], p[1], p[0]];
		const r: number[] = [];
		for (let i = 0; i < 3; i++) r[i] = fract((pxxy[i] + pyxx[i]) * pzyx[i]);
		return r;
	}
</script>

<script lang="ts">
	import { Renderer, Program, Mesh, Triangle, Transform, Vec3, Camera } from 'ogl';

	type Props = {
		color?: string;
		speed?: number;
		enableMouseInteraction?: boolean;
		hoverSmoothness?: number;
		animationSize?: number;
		ballCount?: number;
		clumpFactor?: number;
		cursorBallSize?: number;
		cursorBallColor?: string;
		enableTransparency?: boolean;
	};

	let {
		color = '#ffffff',
		speed = 0.3,
		enableMouseInteraction = true,
		hoverSmoothness = 0.05,
		animationSize = 30,
		ballCount = 15,
		clumpFactor = 1,
		cursorBallSize = 3,
		cursorBallColor = '#ffffff',
		enableTransparency = false
	}: Props = $props();

	let container: HTMLDivElement;

	$effect(() => {
		if (!container) return;
		const dpr = 1;
		const renderer = new Renderer({ dpr, alpha: true, premultipliedAlpha: false });
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, enableTransparency ? 0 : 1);
		container.appendChild(gl.canvas as HTMLCanvasElement);

		const camera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 });
		camera.position.z = 1;

		const geometry = new Triangle(gl);
		const [r1, g1, b1] = parseHexColor(color);
		const [r2, g2, b2] = parseHexColor(cursorBallColor);
		const metaBallsUniform: Vec3[] = [];
		for (let i = 0; i < 50; i++) metaBallsUniform.push(new Vec3(0, 0, 0));

		const vertex = `#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 position;\nvoid main(){gl_Position=vec4(position,0.,1.);}`;
		const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform float iAnimationSize;
uniform int iBallCount;
uniform float iCursorBallSize;
uniform vec3 iMetaBalls[50];
uniform float iClumpFactor;
uniform bool enableTransparency;
out vec4 outColor;
float getMetaBallValue(vec2 c,float r,vec2 p){vec2 d=p-c;float dist2=dot(d,d);return (r*r)/dist2;}
void main(){
  vec2 fc=gl_FragCoord.xy;
  float scale=iAnimationSize/iResolution.y;
  vec2 coord=(fc-iResolution.xy*.5)*scale;
  vec2 mouseW=(iMouse.xy-iResolution.xy*.5)*scale;
  float m1=0.;
  for(int i=0;i<50;i++){if(i>=iBallCount)break;m1+=getMetaBallValue(iMetaBalls[i].xy,iMetaBalls[i].z,coord);}
  float m2=getMetaBallValue(mouseW,iCursorBallSize,coord);
  float total=m1+m2;
  float f=smoothstep(-1.,1.,(total-1.3)/min(1.,fwidth(total)));
  vec3 cFinal=vec3(0.);
  if(total>0.){float a1=m1/total;float a2=m2/total;cFinal=iColor*a1+iCursorColor*a2;}
  outColor=vec4(cFinal*f,enableTransparency?f:1.);
}`;

		const program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				iTime: { value: 0 },
				iResolution: { value: new Vec3(0, 0, 0) },
				iMouse: { value: new Vec3(0, 0, 0) },
				iColor: { value: new Vec3(r1, g1, b1) },
				iCursorColor: { value: new Vec3(r2, g2, b2) },
				iAnimationSize: { value: animationSize },
				iBallCount: { value: ballCount },
				iCursorBallSize: { value: cursorBallSize },
				iMetaBalls: { value: metaBallsUniform },
				iClumpFactor: { value: clumpFactor },
				enableTransparency: { value: enableTransparency }
			}
		});
		const mesh = new Mesh(gl, { geometry, program });
		const scene = new Transform();
		mesh.setParent(scene);

		const effective = Math.min(ballCount, 50);
		const ballParams: { st: number; dtFactor: number; baseScale: number; toggle: number; radius: number }[] = [];
		for (let i = 0; i < effective; i++) {
			const h1 = hash31(i + 1);
			const st = h1[0] * (2 * Math.PI);
			const dtFactor = 0.1 * Math.PI + h1[1] * (0.4 * Math.PI - 0.1 * Math.PI);
			const baseScale = 5 + h1[1] * 5;
			const h2 = hash33(h1);
			const toggle = Math.floor(h2[0] * 2);
			const radius = 0.5 + h2[2] * 1.5;
			ballParams.push({ st, dtFactor, baseScale, toggle, radius });
		}

		const mouseBallPos = { x: 0, y: 0 };
		let pointerInside = false;
		let pointerX = 0;
		let pointerY = 0;

		const resize = () => {
			const w = container.clientWidth;
			const h = container.clientHeight;
			renderer.setSize(w * dpr, h * dpr);
			(gl.canvas as HTMLCanvasElement).style.width = `${w}px`;
			(gl.canvas as HTMLCanvasElement).style.height = `${h}px`;
			(program.uniforms.iResolution.value as Vec3).set(gl.canvas.width, gl.canvas.height, 0);
		};
		window.addEventListener('resize', resize);
		resize();

		const onMove = (e: PointerEvent) => {
			if (!enableMouseInteraction) return;
			const rect = container.getBoundingClientRect();
			const px = e.clientX - rect.left;
			const py = e.clientY - rect.top;
			pointerX = (px / rect.width) * gl.canvas.width;
			pointerY = (1 - py / rect.height) * gl.canvas.height;
		};
		const onEnter = () => {
			if (enableMouseInteraction) pointerInside = true;
		};
		const onLeave = () => {
			if (enableMouseInteraction) pointerInside = false;
		};
		container.addEventListener('pointermove', onMove);
		container.addEventListener('pointerenter', onEnter);
		container.addEventListener('pointerleave', onLeave);

		const start = performance.now();
		let raf = 0;
		const update = (t: number) => {
			raf = requestAnimationFrame(update);
			const elapsed = (t - start) * 0.001;
			program.uniforms.iTime.value = elapsed;
			for (let i = 0; i < effective; i++) {
				const p = ballParams[i];
				const dt = elapsed * speed * p.dtFactor;
				const th = p.st + dt;
				const x = Math.cos(th);
				const y = Math.sin(th + dt * p.toggle);
				metaBallsUniform[i].set(x * p.baseScale * clumpFactor, y * p.baseScale * clumpFactor, p.radius);
			}
			let tx: number, ty: number;
			if (pointerInside) {
				tx = pointerX;
				ty = pointerY;
			} else {
				const cx = gl.canvas.width * 0.5;
				const cy = gl.canvas.height * 0.5;
				tx = cx + Math.cos(elapsed * speed) * gl.canvas.width * 0.15;
				ty = cy + Math.sin(elapsed * speed) * gl.canvas.height * 0.15;
			}
			mouseBallPos.x += (tx - mouseBallPos.x) * hoverSmoothness;
			mouseBallPos.y += (ty - mouseBallPos.y) * hoverSmoothness;
			(program.uniforms.iMouse.value as Vec3).set(mouseBallPos.x, mouseBallPos.y, 0);
			renderer.render({ scene, camera });
		};
		raf = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			container.removeEventListener('pointermove', onMove);
			container.removeEventListener('pointerenter', onEnter);
			container.removeEventListener('pointerleave', onLeave);
			if ((gl.canvas as HTMLCanvasElement).parentNode === container)
				container.removeChild(gl.canvas as HTMLCanvasElement);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div bind:this={container} class="absolute inset-0"></div>
