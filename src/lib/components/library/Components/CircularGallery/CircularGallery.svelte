<!-- @svelte-bits
{
  "title": "Circular Gallery",
  "description": "WebGL bent gallery with momentum scroll, picture-frame distortion, and titles.",
  "dependencies": ["ogl"]
}
-->
<script module lang="ts">
	import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

	type GL = Renderer['gl'];
	export type CircularGalleryItem = { image: string; text: string };

	function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number) {
		let t: number;
		return function (this: unknown, ...args: Parameters<T>) {
			window.clearTimeout(t);
			t = window.setTimeout(() => fn.apply(this, args), wait);
		};
	}
	function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
	function getFontSize(font: string) { const m = font.match(/(\d+)px/); return m ? parseInt(m[1], 10) : 30; }

	function createTextTexture(gl: GL, text: string, font = 'bold 30px monospace', color = 'black') {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		ctx.font = font;
		const m = ctx.measureText(text);
		const tw = Math.ceil(m.width);
		const fs = getFontSize(font);
		const th = Math.ceil(fs * 1.2);
		canvas.width = tw + 20;
		canvas.height = th + 20;
		ctx.font = font;
		ctx.fillStyle = color;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
		const texture = new Texture(gl, { generateMipmaps: false });
		texture.image = canvas;
		return { texture, width: canvas.width, height: canvas.height };
	}

	class Title {
		mesh!: Mesh;
		constructor(opts: { gl: GL; plane: Mesh; text: string; textColor: string; font: string }) {
			const { gl, plane, text, textColor, font } = opts;
			const { texture, width, height } = createTextTexture(gl, text, font, textColor);
			const geometry = new Plane(gl);
			const program = new Program(gl, {
				vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
				fragment: `precision highp float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 c=texture2D(tMap,vUv);if(c.a<0.1)discard;gl_FragColor=c;}`,
				uniforms: { tMap: { value: texture } },
				transparent: true
			});
			this.mesh = new Mesh(gl, { geometry, program });
			const aspect = width / height;
			const th = plane.scale.y * 0.15;
			const tw = th * aspect;
			this.mesh.scale.set(tw, th, 1);
			this.mesh.position.y = -plane.scale.y * 0.5 - th * 0.5 - 0.05;
			this.mesh.setParent(plane);
		}
	}

	class Media {
		extra = 0;
		speed = 0;
		isBefore = false;
		isAfter = false;
		program!: Program;
		plane!: Mesh;
		title!: Title;
		scale!: number;
		padding!: number;
		width!: number;
		widthTotal!: number;
		x!: number;
		geometry: Plane;
		gl: GL;
		image: string;
		index: number;
		length: number;
		scene: Transform;
		screen: { width: number; height: number };
		text: string;
		viewport: { width: number; height: number };
		bend: number;
		textColor: string;
		borderRadius: number;
		font: string;
		constructor(
			geometry: Plane,
			gl: GL,
			image: string,
			index: number,
			length: number,
			scene: Transform,
			screen: { width: number; height: number },
			text: string,
			viewport: { width: number; height: number },
			bend: number,
			textColor: string,
			borderRadius: number,
			font: string
		) {
			this.geometry = geometry;
			this.gl = gl;
			this.image = image;
			this.index = index;
			this.length = length;
			this.scene = scene;
			this.screen = screen;
			this.text = text;
			this.viewport = viewport;
			this.bend = bend;
			this.textColor = textColor;
			this.borderRadius = borderRadius;
			this.font = font;
			this.createShader();
			this.createMesh();
			this.title = new Title({ gl, plane: this.plane, text, textColor, font });
			this.onResize();
		}
		createShader() {
			const texture = new Texture(this.gl, { generateMipmaps: true });
			this.program = new Program(this.gl, {
				depthTest: false,
				depthWrite: false,
				vertex: `precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform float uTime;uniform float uSpeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
				fragment: `precision highp float;uniform vec2 uImageSizes;uniform vec2 uPlaneSizes;uniform sampler2D tMap;uniform float uBorderRadius;varying vec2 vUv;float roundedBoxSDF(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}void main(){vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);vec4 color=texture2D(tMap,uv);float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);float edgeSmooth=0.002;float alpha=1.0-smoothstep(-edgeSmooth,edgeSmooth,d);gl_FragColor=vec4(color.rgb,alpha);}`,
				uniforms: {
					tMap: { value: texture },
					uPlaneSizes: { value: [0, 0] },
					uImageSizes: { value: [0, 0] },
					uSpeed: { value: 0 },
					uTime: { value: 100 * Math.random() },
					uBorderRadius: { value: this.borderRadius }
				},
				transparent: true
			});
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = this.image;
			img.onload = () => {
				texture.image = img;
				this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
			};
		}
		createMesh() {
			this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
			this.plane.setParent(this.scene);
		}
		update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
			this.plane.position.x = this.x - scroll.current - this.extra;
			const x = this.plane.position.x;
			const H = this.viewport.width / 2;
			if (this.bend === 0) {
				this.plane.position.y = 0;
				this.plane.rotation.z = 0;
			} else {
				const Babs = Math.abs(this.bend);
				const R = (H * H + Babs * Babs) / (2 * Babs);
				const ex = Math.min(Math.abs(x), H);
				const arc = R - Math.sqrt(R * R - ex * ex);
				if (this.bend > 0) {
					this.plane.position.y = -arc;
					this.plane.rotation.z = -Math.sign(x) * Math.asin(ex / R);
				} else {
					this.plane.position.y = arc;
					this.plane.rotation.z = Math.sign(x) * Math.asin(ex / R);
				}
			}
			this.speed = scroll.current - scroll.last;
			this.program.uniforms.uTime.value += 0.04;
			this.program.uniforms.uSpeed.value = this.speed;
			const po = this.plane.scale.x / 2;
			const vo = this.viewport.width / 2;
			this.isBefore = this.plane.position.x + po < -vo;
			this.isAfter = this.plane.position.x - po > vo;
			if (direction === 'right' && this.isBefore) {
				this.extra -= this.widthTotal;
				this.isBefore = this.isAfter = false;
			}
			if (direction === 'left' && this.isAfter) {
				this.extra += this.widthTotal;
				this.isBefore = this.isAfter = false;
			}
		}
		onResize(o: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } } = {}) {
			if (o.screen) this.screen = o.screen;
			if (o.viewport) this.viewport = o.viewport;
			this.scale = this.screen.height / 1500;
			this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
			this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
			this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
			this.padding = 2;
			this.width = this.plane.scale.x + this.padding;
			this.widthTotal = this.width * this.length;
			this.x = this.width * this.index;
		}
	}

	export class CircularGalleryApp {
		renderer!: Renderer;
		gl!: GL;
		camera!: Camera;
		scene!: Transform;
		planeGeometry!: Plane;
		medias: Media[] = [];
		screen!: { width: number; height: number };
		viewport!: { width: number; height: number };
		raf = 0;
		isDown = false;
		start = 0;
		scroll: { ease: number; current: number; target: number; last: number; position?: number };
		scrollSpeed: number;
		onCheckDebounce: (...args: unknown[]) => void;
		boundResize!: () => void;
		boundWheel!: (e: Event) => void;
		boundDown!: (e: MouseEvent | TouchEvent) => void;
		boundMove!: (e: MouseEvent | TouchEvent) => void;
		boundUp!: () => void;

		container: HTMLElement;

		constructor(
			container: HTMLElement,
			cfg: {
				items?: CircularGalleryItem[];
				bend?: number;
				textColor?: string;
				borderRadius?: number;
				font?: string;
				scrollSpeed?: number;
				scrollEase?: number;
			}
		) {
			this.container = container;
			const { items, bend = 1, textColor = '#ffffff', borderRadius = 0, font = 'bold 30px Figtree', scrollSpeed = 2, scrollEase = 0.05 } = cfg;
			this.scrollSpeed = scrollSpeed;
			this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
			this.onCheckDebounce = debounce(() => this.onCheck(), 200);
			this.createRenderer();
			this.createCamera();
			this.scene = new Transform();
			this.onResize();
			this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
			this.createMedias(items, bend, textColor, borderRadius, font);
			this.update();
			this.addEvents();
		}
		createRenderer() {
			this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
			this.gl = this.renderer.gl;
			this.gl.clearColor(0, 0, 0, 0);
			this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
		}
		createCamera() { this.camera = new Camera(this.gl); this.camera.fov = 45; this.camera.position.z = 20; }
		createMedias(items: CircularGalleryItem[] | undefined, bend: number, textColor: string, borderRadius: number, font: string) {
			const defaults: CircularGalleryItem[] = Array.from({ length: 12 }, (_, i) => ({
				image: `https://picsum.photos/seed/${i + 1}/800/600?grayscale`,
				text: `Item ${i + 1}`
			}));
			const list = items && items.length ? items : defaults;
			const dup = list.concat(list);
			this.medias = dup.map((d, i) => new Media(this.planeGeometry, this.gl, d.image, i, dup.length, this.scene, this.screen, d.text, this.viewport, bend, textColor, borderRadius, font));
		}
		onTouchDown(e: MouseEvent | TouchEvent) {
			this.isDown = true;
			this.scroll.position = this.scroll.current;
			this.start = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
		}
		onTouchMove(e: MouseEvent | TouchEvent) {
			if (!this.isDown) return;
			const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
			const distance = (this.start - x) * (this.scrollSpeed * 0.025);
			this.scroll.target = (this.scroll.position ?? 0) + distance;
		}
		onTouchUp() { this.isDown = false; this.onCheck(); }
		onWheel(e: Event) {
			const we = e as WheelEvent;
			const delta = we.deltaY || (we as unknown as { wheelDelta: number }).wheelDelta || (we as unknown as { detail: number }).detail;
			this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
			this.onCheckDebounce();
		}
		onCheck() {
			if (!this.medias[0]) return;
			const w = this.medias[0].width;
			const idx = Math.round(Math.abs(this.scroll.target) / w);
			const item = w * idx;
			this.scroll.target = this.scroll.target < 0 ? -item : item;
		}
		onResize() {
			this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
			this.renderer.setSize(this.screen.width, this.screen.height);
			this.camera.perspective({ aspect: this.screen.width / this.screen.height });
			const fov = (this.camera.fov * Math.PI) / 180;
			const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
			const width = height * this.camera.aspect;
			this.viewport = { width, height };
			this.medias?.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport }));
		}
		update() {
			this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
			const direction: 'left' | 'right' = this.scroll.current > this.scroll.last ? 'right' : 'left';
			this.medias?.forEach((m) => m.update(this.scroll, direction));
			this.renderer.render({ scene: this.scene, camera: this.camera });
			this.scroll.last = this.scroll.current;
			this.raf = window.requestAnimationFrame(() => this.update());
		}
		addEvents() {
			this.boundResize = () => this.onResize();
			this.boundWheel = (e) => this.onWheel(e);
			this.boundDown = (e) => this.onTouchDown(e);
			this.boundMove = (e) => this.onTouchMove(e);
			this.boundUp = () => this.onTouchUp();
			window.addEventListener('resize', this.boundResize);
			window.addEventListener('wheel', this.boundWheel);
			window.addEventListener('mousedown', this.boundDown);
			window.addEventListener('mousemove', this.boundMove);
			window.addEventListener('mouseup', this.boundUp);
			window.addEventListener('touchstart', this.boundDown);
			window.addEventListener('touchmove', this.boundMove);
			window.addEventListener('touchend', this.boundUp);
		}
		destroy() {
			window.cancelAnimationFrame(this.raf);
			window.removeEventListener('resize', this.boundResize);
			window.removeEventListener('wheel', this.boundWheel);
			window.removeEventListener('mousedown', this.boundDown);
			window.removeEventListener('mousemove', this.boundMove);
			window.removeEventListener('mouseup', this.boundUp);
			window.removeEventListener('touchstart', this.boundDown);
			window.removeEventListener('touchmove', this.boundMove);
			window.removeEventListener('touchend', this.boundUp);
			const c = this.renderer?.gl?.canvas as HTMLCanvasElement | undefined;
			if (c?.parentNode) c.parentNode.removeChild(c);
		}
	}
</script>

<script lang="ts">
	type Props = {
		items?: CircularGalleryItem[];
		bend?: number;
		textColor?: string;
		borderRadius?: number;
		font?: string;
		scrollSpeed?: number;
		scrollEase?: number;
	};
	let {
		items,
		bend = 3,
		textColor = '#ffffff',
		borderRadius = 0.05,
		font = 'bold 30px Figtree',
		scrollSpeed = 2,
		scrollEase = 0.05
	}: Props = $props();

	let containerRef: HTMLDivElement;
	$effect(() => {
		if (!containerRef) return;
		const app = new CircularGalleryApp(containerRef, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
		return () => app.destroy();
	});
</script>

<div bind:this={containerRef} class="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"></div>
