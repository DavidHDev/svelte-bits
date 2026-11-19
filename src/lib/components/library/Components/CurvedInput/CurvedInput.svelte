<!-- @svelte-bits
{
  "title": "CurvedInput",
  "description": "Arc-bent input bar with text, caret and submit button all following the curve.",
  "dependencies": []
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	const DEG = 180 / Math.PI;

	const round2 = (n: number): number => Math.round(n * 100) / 100;

	const hexToRgba = (hex: string, alpha: number): string => {
		let h = String(hex).replace('#', '');
		if (h.length === 3)
			h = h
				.split('')
				.map((c) => c + c)
				.join('');
		const n = parseInt(h.slice(0, 6), 16);
		if (Number.isNaN(n)) return hex;
		return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
	};

	export type CurvedInputShadowSize = 'none' | 'sm' | 'md' | 'lg';
	export type CurvedInputTheme = 'dark' | 'light';

	const SHADOWS: Record<string, [number, number, number]> = {
		sm: [5, 12, 0.3],
		md: [10, 24, 0.4],
		lg: [16, 40, 0.52]
	};

	interface ThemePalette {
		backgroundColor: string;
		textColor: string;
		placeholderColor: string;
		borderColor: string;
		buttonColor: string;
		buttonTextColor: string;
		shadowColor: string;
	}

	const THEMES: Record<CurvedInputTheme, ThemePalette> = {
		dark: {
			backgroundColor: '#1D1814',
			textColor: '#f5f5f5',
			placeholderColor: '#a1a1aa',
			borderColor: '#3D342C',
			buttonColor: '#ff3e00',
			buttonTextColor: '#ffffff',
			shadowColor: '#000000'
		},
		light: {
			backgroundColor: '#ffffff',
			textColor: '#1d2050',
			placeholderColor: '#9aa0b6',
			borderColor: '#262a56',
			buttonColor: '#4763eb',
			buttonTextColor: '#ffffff',
			shadowColor: '#0b0e2a'
		}
	};

	interface Geometry {
		straight: boolean;
		W: number;
		T: number;
		svgH: number;
		R?: number;
		dir?: number;
		uPerLen: number;
		point: (u: number, v: number) => [number, number];
		angleAt: (u: number) => number;
		uFromPoint: (x: number, y?: number) => number;
	}

	const buildGeometry = (width: number, bend: number, thickness: number, pad: number): Geometry => {
		const W = width;
		const T = thickness;
		const s = Math.max(-W * 0.35, Math.min(bend, W * 0.35));
		const a = Math.abs(s);
		const dir = s >= 0 ? 1 : -1;
		const svgH = T + a + pad * 2;

		if (a < 0.75) {
			const midY = pad + T / 2;
			return {
				straight: true,
				W,
				T,
				svgH,
				uPerLen: 1,
				point: (u, v) => [u, midY + v],
				angleAt: () => 0,
				uFromPoint: (x) => x
			};
		}

		const R = (W * W * 0.25 + a * a) / (2 * a);
		const cx = W / 2;
		const apexY = pad + T / 2 + (dir > 0 ? 0 : a);
		const cy = apexY + dir * R;
		const phi = Math.asin(Math.min(1, W / (2 * R)));

		return {
			straight: false,
			W,
			T,
			svgH,
			R,
			dir,
			uPerLen: W / (2 * R * phi),
			point: (u, v) => {
				const th = ((u - cx) / cx) * phi;
				const rho = R - dir * v;
				return [cx + rho * Math.sin(th), cy - dir * rho * Math.cos(th)];
			},
			angleAt: (u) => dir * ((u - cx) / cx) * phi * DEG,
			uFromPoint: (x, y = 0) => {
				const th = Math.atan2(x - cx, dir * (cy - y));
				return cx + (th / phi) * cx;
			}
		};
	};

	const fmt = (g: Geometry, u: number, v: number): string => {
		const [x, y] = g.point(u, v);
		return `${round2(x)} ${round2(y)}`;
	};

	const edgeSeg = (g: Geometry, uTo: number, v: number, ltr: boolean): string => {
		if (g.straight) return `L ${fmt(g, uTo, v)}`;
		const rho = round2(g.R! - g.dir! * v);
		const sweep = ltr === g.dir! > 0 ? 1 : 0;
		return `A ${rho} ${rho} 0 0 ${sweep} ${fmt(g, uTo, v)}`;
	};

	const bentRectPath = (g: Geometry, u0: number, u1: number, vTop: number, vBot: number, radius: number): string => {
		const rc = Math.max(0, Math.min(radius, (vBot - vTop) / 2, (u1 - u0) / 2));
		return [
			`M ${fmt(g, u0 + rc, vTop)}`,
			edgeSeg(g, u1 - rc, vTop, true),
			`Q ${fmt(g, u1, vTop)} ${fmt(g, u1, vTop + rc)}`,
			`L ${fmt(g, u1, vBot - rc)}`,
			`Q ${fmt(g, u1, vBot)} ${fmt(g, u1 - rc, vBot)}`,
			edgeSeg(g, u0 + rc, vBot, false),
			`Q ${fmt(g, u0, vBot)} ${fmt(g, u0, vBot - rc)}`,
			`L ${fmt(g, u0, vTop + rc)}`,
			`Q ${fmt(g, u0, vTop)} ${fmt(g, u0 + rc, vTop)}`,
			'Z'
		].join(' ');
	};

	const bentLinePath = (g: Geometry, u0: number, u1: number, v: number): string =>
		`M ${fmt(g, u0, v)} ${edgeSeg(g, u1, v, true)}`;

	const SELECTABLE_TYPES = ['text', 'search', 'tel', 'url', 'password'];

	export interface CurvedInputProps {
		value?: string;
		defaultValue?: string;
		onChange?: (value: string) => void;
		onSubmit?: (value: string) => void;
		placeholder?: string;
		buttonText?: string;
		type?: string;
		name?: string;
		ariaLabel?: string;
		theme?: CurvedInputTheme;
		width?: number | string;
		bend?: number;
		height?: number;
		cornerRadius?: number;
		borderWidth?: number;
		fontSize?: number;
		backgroundColor?: string;
		textColor?: string;
		placeholderColor?: string;
		borderColor?: string;
		buttonColor?: string;
		buttonTextColor?: string;
		iconColor?: string;
		shadowSize?: CurvedInputShadowSize;
		shadowColor?: string;
		showButton?: boolean;
		showIcon?: boolean;
		icon?: Snippet;
		class?: string;
		style?: string;
	}
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';

	let {
		value,
		defaultValue = '',
		onChange,
		onSubmit,
		placeholder = 'Enter your email',
		buttonText = 'Get Started',
		type = 'email',
		name,
		ariaLabel,
		theme = 'dark',
		width = 450,
		bend = 28,
		height = 64,
		cornerRadius = 18,
		borderWidth = 1.5,
		fontSize = 16,
		backgroundColor,
		textColor,
		placeholderColor,
		borderColor,
		buttonColor,
		buttonTextColor,
		iconColor,
		shadowSize = 'md',
		shadowColor,
		showButton = true,
		showIcon = true,
		icon,
		class: className = '',
		style = ''
	}: CurvedInputProps = $props();

	const rawId = $props.id();
	const uid = rawId.replace(/:/g, '');
	const layoutPathId = `ci-text-${uid}`;
	const buttonPathId = `ci-btn-${uid}`;
	const clipId = `ci-clip-${uid}`;

	let rootEl = $state<HTMLFormElement | null>(null);
	let svgEl = $state<SVGSVGElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let textEl = $state<SVGTextElement | null>(null);
	let btnMeasureEl = $state<SVGTextElement | null>(null);
	let scrollRef = 0;

	let w = $state(0);
	let innerValue = $state(untrack(() => defaultValue));
	let caretIndex = $state(untrack(() => defaultValue.length));
	let focused = $state(false);
	let caretU = $state(0);
	let scrollLen = $state(0);
	let btnTextW = $state(0);
	let fontTick = $state(0);

	const val = $derived(value !== undefined ? value : innerValue);
	const display = $derived(type === 'password' ? '•'.repeat(val.length) : val);

	const palette = $derived(THEMES[theme] || THEMES.dark);
	const bgColor = $derived(backgroundColor ?? palette.backgroundColor);
	const fgColor = $derived(textColor ?? palette.textColor);
	const phColor = $derived(placeholderColor ?? palette.placeholderColor);
	const strokeColor = $derived(borderColor ?? palette.borderColor);
	const accentColor = $derived(buttonColor ?? palette.buttonColor);
	const btnFgColor = $derived(buttonTextColor ?? palette.buttonTextColor);
	const shColor = $derived(shadowColor ?? palette.shadowColor);

	$effect(() => {
		const el = rootEl;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const cw = entries[0]?.contentRect?.width ?? el.clientWidth;
			w = Math.round(cw);
		});
		ro.observe(el);
		return () => ro.disconnect();
	});

	onMount(() => {
		let alive = true;
		if (document.fonts?.ready) {
			document.fonts.ready.then(() => {
				if (alive) fontTick += 1;
			});
		}
		return () => {
			alive = false;
		};
	});

	const pad = $derived(Math.ceil(borderWidth / 2) + 6);
	const geom = $derived<Geometry | null>(w > 2 ? buildGeometry(w, bend, height, pad) : null);

	const layout = $derived.by(() => {
		if (!geom) return null;
		const T = height;
		const btnInset = Math.max(5, borderWidth + 4);
		const chipH = Math.min(34, Math.max(16, T * 0.34));
		const chipW = chipH * 1.25;
		const iconU = 22 + chipW / 2;
		const textStartU = showIcon ? 22 + chipW + 13 : 24;
		const btnW = showButton ? Math.max(btnTextW + fontSize * 2.7, T * 1.35) : 0;
		const btnU1 = geom.W - btnInset;
		const btnU0 = btnU1 - btnW;
		const textEndU = Math.max(textStartU + 20, showButton ? btnU0 - 14 : geom.W - 24);
		const winLen = (textEndU - textStartU) / geom.uPerLen;
		return { btnInset, chipH, chipW, iconU, textStartU, textEndU, btnU0, btnU1, winLen };
	});

	$effect(() => {
		void fontTick;
		void buttonText;
		void fontSize;
		void showButton;
		void showIcon;
		const g = geom;
		const l = layout;
		const text = display;
		const idx = caretIndex;
		const measureEl = btnMeasureEl;
		const tEl = textEl;
		untrack(() => {
			if (measureEl) {
				const bw = measureEl.getComputedTextLength();
				if (Math.abs(btnTextW - bw) > 0.5) btnTextW = bw;
			}
			if (!g || !l) return;
			const caret = Math.min(idx, text.length);
			let caretLen = 0;
			let totalLen = 0;
			if (tEl && text.length) {
				try {
					totalLen = tEl.getSubStringLength(0, text.length);
					caretLen = caret > 0 ? tEl.getSubStringLength(0, caret) : 0;
				} catch {
					totalLen = 0;
					caretLen = 0;
				}
			}
			let next = scrollRef;
			if (caretLen - next > l.winLen - 2) next = caretLen - l.winLen + 2;
			if (caretLen - next < 0) next = caretLen;
			if (totalLen - next < l.winLen) next = Math.max(0, totalLen - l.winLen);
			next = Math.max(0, next);
			if (Math.abs(next - scrollRef) > 0.5) {
				scrollRef = next;
				scrollLen = next;
			}
			caretU = l.textStartU + (caretLen - next) * g.uPerLen;
		});
	});

	const commitValue = (v: string) => {
		if (value === undefined) innerValue = v;
		onChange?.(v);
	};

	const handleInputChange = (e: Event & { currentTarget: HTMLInputElement }) => {
		const target = e.currentTarget;
		commitValue(target.value);
		caretIndex = target.selectionStart ?? target.value.length;
	};

	const handleSelect = (e: Event & { currentTarget: HTMLInputElement }) => {
		const target = e.currentTarget;
		caretIndex = target.selectionStart ?? target.value.length;
	};

	const handleSubmit = (e?: Event) => {
		if (e?.preventDefault) e.preventDefault();
		if (onSubmit) onSubmit(val);
	};

	const handleSurfaceClick = (e: MouseEvent) => {
		const input = inputEl;
		if (!input) return;
		let idx = display.length;
		const svg = svgEl;
		const tEl = textEl;
		if (svg && geom && layout && tEl && display.length) {
			try {
				const ctm = svg.getScreenCTM();
				if (!ctm) throw new Error('missing screen CTM');
				const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
				const target = scrollRef + (geom.uFromPoint(pt.x, pt.y) - layout.textStartU) / geom.uPerLen;
				let best = 0;
				let bestDist = Infinity;
				for (let i = 0; i <= display.length; i++) {
					const li = i === 0 ? 0 : tEl.getSubStringLength(0, i);
					const d = Math.abs(li - target);
					if (d < bestDist) {
						bestDist = d;
						best = i;
					}
				}
				idx = best;
			} catch {
				idx = display.length;
			}
		}
		input.focus();
		try {
			input.setSelectionRange(idx, idx);
		} catch {
			void 0;
		}
		caretIndex = idx;
	};

	const safeType = $derived(SELECTABLE_TYPES.includes(type) ? type : 'text');
	const inputMode = $derived<'email' | 'decimal' | undefined>(
		type === 'email' ? 'email' : type === 'number' ? 'decimal' : undefined
	);

	const shadow = $derived(SHADOWS[shadowSize]);
	const svgStyle = $derived(
		shadow ? `filter: drop-shadow(0 ${shadow[0]}px ${shadow[1]}px ${hexToRgba(shColor, shadow[2])});` : undefined
	);

	const view = $derived.by(() => {
		if (!geom || !layout) return null;
		const T = height;
		const vBase = fontSize * 0.34;
		const scrollU = scrollLen * geom.uPerLen;
		const bandPath = bentRectPath(geom, 0, geom.W, -T / 2, T / 2, cornerRadius);
		const layoutPath = bentLinePath(geom, layout.textStartU - scrollU, geom.W, vBase);
		const clipPath = bentRectPath(geom, layout.textStartU - 6, layout.textEndU + 8, -T / 2, T / 2, 0);

		const chipFill = iconColor || accentColor;
		const { chipW, chipH } = layout;
		const ew = chipW * 0.5;
		const eh = chipH * 0.5;
		const sw = Math.max(1.1, chipH * 0.075);
		const [ix, iy] = geom.point(layout.iconU, 0);
		const iconAngle = geom.angleAt(layout.iconU);

		const [caretX, caretY] = geom.point(caretU, 0);
		const caretAngle = geom.angleAt(caretU);
		const caretH = Math.min(T * 0.58, fontSize * 1.45);

		const btnH = T - layout.btnInset * 2;
		const buttonPath = showButton
			? bentRectPath(
					geom,
					layout.btnU0,
					layout.btnU1,
					-T / 2 + layout.btnInset,
					T / 2 - layout.btnInset,
					Math.min(cornerRadius * 0.72, btnH / 2)
				)
			: '';
		const buttonTextPath = showButton ? bentLinePath(geom, layout.btnU0, layout.btnU1, vBase) : '';

		return {
			W: geom.W,
			svgH: round2(geom.svgH),
			bandPath,
			layoutPath,
			clipPath,
			chipFill,
			chipW,
			chipH,
			ew,
			eh,
			sw,
			ix,
			iy,
			iconAngle,
			caretX,
			caretY,
			caretAngle,
			caretH,
			buttonPath,
			buttonTextPath
		};
	});

	const fontStyle = $derived(`font-size: ${fontSize}px; font-weight: 500;`);
	const caretKey = $derived(`${display}-${Math.min(caretIndex, display.length)}`);
</script>

<form
	bind:this={rootEl}
	class={`relative block w-full max-w-full m-0 ${className}`.trim()}
	style={`width: ${typeof width === 'number' ? `${width}px` : width};${style ? ` ${style}` : ''}`}
	onsubmit={handleSubmit}
	novalidate
>
	{#if view}
		<svg
			bind:this={svgEl}
			class="block w-full h-auto overflow-visible [&_text]:font-[inherit] cursor-text select-none [-webkit-tap-highlight-color:transparent]"
			width={view.W}
			height={view.svgH}
			viewBox={`0 0 ${view.W} ${view.svgH}`}
			style={svgStyle}
			role="presentation"
			onpointerdown={(e) => e.preventDefault()}
			onclick={handleSurfaceClick}
		>
			<defs>
				<clipPath id={clipId}>
					<path d={view.clipPath} />
				</clipPath>
			</defs>

			<path
				class={`transition-opacity duration-[250ms] ease-in-out ${focused ? 'opacity-[0.28]' : 'opacity-0'}`}
				d={view.bandPath}
				fill="none"
				stroke={accentColor}
				stroke-width={borderWidth + 6}
			/>
			<path d={view.bandPath} fill={bgColor} stroke={strokeColor} stroke-width={borderWidth} />

			<path id={layoutPathId} d={view.layoutPath} fill="none" />

			{#if showIcon}
				<g
					transform={`translate(${round2(view.ix)} ${round2(view.iy)}) rotate(${round2(view.iconAngle)})`}
					aria-hidden="true"
				>
					{#if icon}
						{@render icon()}
					{:else}
						<rect
							x={-view.chipW / 2}
							y={-view.chipH / 2}
							width={view.chipW}
							height={view.chipH}
							rx={view.chipH * 0.27}
							fill={view.chipFill}
						/>
						<rect
							x={-view.ew / 2}
							y={-view.eh / 2}
							width={view.ew}
							height={view.eh}
							rx={1.4}
							fill="none"
							stroke="#ffffff"
							stroke-width={view.sw}
							stroke-linejoin="round"
						/>
						<path
							d={`M ${round2(-view.ew / 2)} ${round2(-view.eh / 2 + view.sw * 0.4)} L 0 ${round2(view.eh * 0.14)} L ${round2(view.ew / 2)} ${round2(-view.eh / 2 + view.sw * 0.4)}`}
							fill="none"
							stroke="#ffffff"
							stroke-width={view.sw}
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
					{/if}
				</g>
			{/if}

			<g clip-path={`url(#${clipId})`}>
				<text bind:this={textEl} style={fontStyle} fill={fgColor} xml:space="preserve" aria-hidden="true"
					><textPath href={`#${layoutPathId}`}>{display}</textPath></text
				>
				{#if !display && placeholder}
					<text style={fontStyle} fill={phColor} xml:space="preserve" aria-hidden="true"
						><textPath href={`#${layoutPathId}`}>{placeholder}</textPath></text
					>
				{/if}
				{#if focused}
					{#key caretKey}
						<g
							transform={`translate(${round2(view.caretX)} ${round2(view.caretY)}) rotate(${round2(view.caretAngle)})`}
						>
							<line
								y1={-view.caretH / 2}
								y2={view.caretH / 2}
								stroke={fgColor}
								stroke-width="1.5"
								stroke-linecap="round"
							>
								<animate
									attributeName="opacity"
									values="1;0"
									dur="1.06s"
									calcMode="discrete"
									repeatCount="indefinite"
								/>
							</line>
						</g>
					{/key}
				{/if}
			</g>

			{#if showButton}
				<g
					class="group outline-none cursor-pointer"
					role="button"
					tabindex="0"
					aria-label={buttonText}
					onclick={(e) => {
						e.stopPropagation();
						handleSubmit();
					}}
					onpointerdown={(e) => e.stopPropagation()}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleSubmit();
						}
					}}
				>
					<path
						class="group-active:brightness-[0.94] group-focus-visible:brightness-[1.18] group-hover:brightness-[1.12] transition-[filter,opacity] duration-200 ease-in-out"
						d={view.buttonPath}
						fill={accentColor}
					/>
					<path id={buttonPathId} d={view.buttonTextPath} fill="none" />
					<text
						fill={btnFgColor}
						text-anchor="middle"
						style={`font-size: ${fontSize}px; font-weight: 600; pointer-events: none;`}
						><textPath href={`#${buttonPathId}`} startOffset="50%">{buttonText}</textPath></text
					>
				</g>
			{/if}

			<text
				bind:this={btnMeasureEl}
				style={`font-size: ${fontSize}px; font-weight: 600;`}
				x="-9999"
				y="-9999"
				visibility="hidden"
				aria-hidden="true">{buttonText}</text
			>
		</svg>
	{/if}
	<input
		bind:this={inputEl}
		class="absolute inset-0 bg-transparent opacity-0 m-0 p-0 border-0 outline-none w-full h-full text-transparent text-base pointer-events-none [caret-color:transparent]"
		type={safeType}
		inputmode={inputMode}
		{name}
		value={val}
		oninput={handleInputChange}
		onselect={handleSelect}
		onkeyup={handleSelect}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		aria-label={ariaLabel || placeholder || 'Curved input'}
		autocomplete="off"
		autocapitalize="none"
		autocorrect="off"
		spellcheck={false}
	/>
</form>
