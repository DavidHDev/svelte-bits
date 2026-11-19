<script module lang="ts">
	import { formatColor, hsvaToRgba, parseColor, rgbaToHsva, toHex, type Hsva, type Rgba } from './lib/colorMath';

	const SWATCHES = [
		'#ff3e00',
		'#ff8a4c',
		'#ffb089',
		'#3b82f6',
		'#06b6d4',
		'#10b981',
		'#84cc16',
		'#eab308',
		'#f97316',
		'#ef4444',
		'#ec4899',
		'#f43f5e',
		'#ffffff',
		'#94a3b8',
		'#000000'
	];

	const FORMATS = ['hex', 'rgb', 'hsl'] as const;
	type Format = (typeof FORMATS)[number];
	const FORMAT_LABELS: Record<Format, string> = { hex: 'Hex', rgb: 'RGB', hsl: 'HSL' };
	const RECENT_KEY = 'sb-color-recent';
	const RECENT_MAX = 10;
	const FALLBACK: Hsva = { h: 20, s: 0.7, v: 1, a: 1 };
	const GAP = 6;
	const MARGIN = 8;

	let sharedFormat: Format = 'hex';

	const readRecent = (): string[] => {
		try {
			const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
			return Array.isArray(list) ? list.filter((item) => typeof item === 'string').slice(0, RECENT_MAX) : [];
		} catch {
			return [];
		}
	};

	const writeRecent = (value: string) => {
		try {
			const next = [value, ...readRecent().filter((item) => item !== value)].slice(0, RECENT_MAX);
			localStorage.setItem(RECENT_KEY, JSON.stringify(next));
		} catch {
			return;
		}
	};

	const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
	const round = (value: number) => Math.round(value * 1000) / 1000;

	const toState = (color: string | undefined, previous: Hsva | null) => {
		const rgba = parseColor(color);
		return rgba ? rgbaToHsva(rgba, previous) : previous || FALLBACK;
	};

	const outputOf = (hsva: Hsva, alpha: boolean) => toHex(hsvaToRgba(hsva), alpha);
	const stepFor = (event: KeyboardEvent) => (event.shiftKey ? 10 : 1);
</script>

<script lang="ts">
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { ColorPickerIcon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { untrack } from 'svelte';
	import { portal } from './lib/portal';

	type Props = {
		title?: string;
		color?: string;
		onChange?: (value: string) => void;
		variant?: 'row' | 'swatch';
		alpha?: boolean;
	};

	let { title = '', color, onChange, variant = 'row', alpha = false }: Props = $props();

	let hsva = $state<Hsva>(untrack(() => toState(color, null)));
	let open = $state(false);
	let format = $state<Format>(sharedFormat);
	let anchor = $state<DOMRect | null>(null);
	let placement = $state<'below' | 'above'>('below');
	let rowText = $state<string | null>(null);
	let hexText = $state<string | null>(null);
	let copied = $state(false);
	let recent = $state<string[]>(typeof localStorage === 'undefined' ? [] : readRecent());
	let emitted: string | null = null;
	let openedWith: string | null = null;
	let wrapEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let popoverEl = $state<HTMLDivElement | null>(null);
	let areaEl = $state<HTMLDivElement | null>(null);
	let hueEl = $state<HTMLDivElement | null>(null);
	let alphaEl = $state<HTMLDivElement | null>(null);

	const hasDropper = typeof window !== 'undefined' && 'EyeDropper' in window;
	const output = $derived(outputOf(hsva, alpha));
	const rgba = $derived(hsvaToRgba(hsva));
	const opaque = $derived(toHex({ ...rgba, a: 1 }));
	const hueColor = $derived(toHex(hsvaToRgba({ h: hsva.h, s: 1, v: 1, a: 1 })));

	$effect(() => {
		const incomingColor = color;
		const withAlpha = alpha;
		if (incomingColor === undefined || incomingColor === null) return;
		const incoming = parseColor(incomingColor);
		if (!incoming) return;
		if (emitted && toHex(incoming, withAlpha) === emitted) return;
		emitted = null;
		hsva = rgbaToHsva(incoming, untrack(() => hsva));
	});

	function commit(next: Hsva) {
		const value = {
			h: clamp(next.h, 0, 360),
			s: clamp(next.s),
			v: clamp(next.v),
			a: alpha ? clamp(next.a) : 1
		};
		hsva = value;
		const hex = outputOf(value, alpha);
		if (hex === emitted) return;
		emitted = hex;
		onChange?.(hex);
	}

	const commitColor = (rgbaColor: Rgba) => commit(rgbaToHsva({ ...rgbaColor, a: alpha ? rgbaColor.a : 1 }, hsva));

	function setFormat(value: Format) {
		sharedFormat = value;
		format = value;
	}

	function close(focusTrigger = false) {
		open = false;
		if (focusTrigger) triggerEl?.focus({ preventScroll: true });
	}

	$effect(() => {
		if (open) {
			untrack(() => {
				openedWith = outputOf(hsva, alpha);
				recent = readRecent();
			});
			return;
		}
		untrack(() => {
			if (openedWith && openedWith !== outputOf(hsva, alpha)) writeRecent(outputOf(hsva, alpha));
			openedWith = null;
		});
	});

	$effect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			const target = event.target as Node;
			if (wrapEl?.contains(target) || popoverEl?.contains(target)) return;
			close();
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.stopPropagation();
				close(true);
			}
		};
		const update = () => {
			if (wrapEl) anchor = wrapEl.getBoundingClientRect();
		};
		update();
		document.addEventListener('pointerdown', onPointer, true);
		document.addEventListener('keydown', onKey, true);
		window.addEventListener('scroll', update, true);
		window.addEventListener('resize', update);
		return () => {
			document.removeEventListener('pointerdown', onPointer, true);
			document.removeEventListener('keydown', onKey, true);
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('resize', update);
		};
	});

	$effect.pre(() => {
		void format;
		void recent.length;
		if (!open || !anchor || !popoverEl) return;
		const height = popoverEl.offsetHeight;
		const below = window.innerHeight - anchor.bottom - GAP - MARGIN;
		const above = anchor.top - GAP - MARGIN;
		placement = height > below && above > below ? 'above' : 'below';
	});

	function drag(getEl: () => HTMLElement | null, onValue: (pos: { x: number; y: number }) => void) {
		let active = false;
		const read = (event: PointerEvent) => {
			const rect = getEl()!.getBoundingClientRect();
			return {
				x: clamp((event.clientX - rect.left) / Math.max(rect.width, 1)),
				y: clamp((event.clientY - rect.top) / Math.max(rect.height, 1))
			};
		};
		return {
			onpointerdown: (event: PointerEvent) => {
				if (event.button !== 0) return;
				event.preventDefault();
				active = true;
				const target = event.currentTarget as HTMLElement;
				try {
					target.setPointerCapture(event.pointerId);
				} catch {
					active = true;
				}
				target.focus({ preventScroll: true });
				onValue(read(event));
			},
			onpointermove: (event: PointerEvent) => {
				if (active) onValue(read(event));
			},
			onpointerup: () => (active = false),
			onpointercancel: () => (active = false),
			onlostpointercapture: () => (active = false)
		};
	}

	const areaDrag = drag(
		() => areaEl,
		({ x, y }) => commit({ ...hsva, s: x, v: 1 - y })
	);
	const hueDrag = drag(
		() => hueEl,
		({ x }) => commit({ ...hsva, h: x * 360 })
	);
	const alphaDrag = drag(
		() => alphaEl,
		({ x }) => commit({ ...hsva, a: x })
	);

	function onAreaKey(event: KeyboardEvent) {
		const step = stepFor(event) / 100;
		const moves: Record<string, [number, number]> = {
			ArrowLeft: [-step, 0],
			ArrowRight: [step, 0],
			ArrowUp: [0, step],
			ArrowDown: [0, -step]
		};
		const move = moves[event.key];
		if (!move) return;
		event.preventDefault();
		commit({ ...hsva, s: hsva.s + move[0], v: hsva.v + move[1] });
	}

	function onSliderKey(event: KeyboardEvent, key: 'h' | 'a', scale: number) {
		const delta = ({ ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 } as Record<string, number>)[event.key];
		if (delta === undefined && event.key !== 'Home' && event.key !== 'End') return;
		event.preventDefault();
		const current = hsva[key];
		const next =
			event.key === 'Home' ? 0 : event.key === 'End' ? scale : current + (delta * stepFor(event) * scale) / 100;
		commit({ ...hsva, [key]: key === 'h' ? clamp(next, 0, 360) : clamp(next) });
	}

	async function pick() {
		try {
			const Dropper = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } })
				.EyeDropper;
			const result = await new Dropper().open();
			const picked = parseColor(result.sRGBHex);
			if (picked) commitColor({ ...picked, a: hsva.a });
		} catch {
			return;
		}
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(formatColor(hsva, format, alpha));
			copied = true;
			setTimeout(() => (copied = false), 1200);
		} catch {
			copied = false;
		}
	}

	function applyText(text: string, revert: () => void) {
		const parsed = parseColor(text);
		if (parsed) commitColor(parsed);
		revert();
	}

	const chip = $derived(variant === 'swatch');
	const width = $derived(chip ? 260 : clamp(anchor?.width ?? 260, 260, 320));
	const left = $derived(
		anchor
			? clamp(
					chip ? anchor.left + anchor.width / 2 - width / 2 : anchor.left,
					MARGIN,
					window.innerWidth - width - MARGIN
				)
			: 0
	);
	const top = $derived(anchor ? (placement === 'below' ? anchor.bottom + GAP : anchor.top - GAP) : 0);
	const hsl = $derived.by(() => {
		const max = Math.max(rgba.r, rgba.g, rgba.b);
		const min = Math.min(rgba.r, rgba.g, rgba.b);
		const l = (max + min) / 2;
		const d = max - min;
		const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
		return { h: Math.round(hsva.h), s: Math.round(clamp(s) * 100), l: Math.round(l * 100) };
	});
	const checker = $derived(alpha && hsva.a < 1);
</script>

{#snippet channelInput(label: string, value: number, min: number, max: number, onCommit: (next: number) => void, suffix = '')}
	<label class="cp-channel">
		<input
			class="cp-input cp-input--number"
			inputmode="decimal"
			value={String(value)}
			aria-label={label}
			onfocus={(event) => (event.currentTarget as HTMLInputElement).select()}
			onblur={(event) => {
				const input = event.currentTarget as HTMLInputElement;
				const parsed = parseFloat(input.value);
				if (Number.isFinite(parsed)) onCommit(clamp(parsed, min, max));
				input.value = String(value);
			}}
			onkeydown={(event) => {
				const input = event.currentTarget as HTMLInputElement;
				if (event.key === 'Enter') {
					const parsed = parseFloat(input.value);
					if (Number.isFinite(parsed)) onCommit(clamp(parsed, min, max));
					input.select();
				} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
					event.preventDefault();
					const delta = (event.key === 'ArrowUp' ? 1 : -1) * stepFor(event);
					const next = clamp((parseFloat(input.value) || 0) + delta, min, max);
					input.value = String(next);
					onCommit(next);
				}
			}}
		/>
		<span class="cp-channel-label">{label}{suffix}</span>
	</label>
{/snippet}

<div class={chip ? 'scrubber-chip-wrap' : 'scrubber'} bind:this={wrapEl}>
	{#if chip}
		<button
			type="button"
			bind:this={triggerEl}
			class="scrubber-color-chip cp-chip"
			data-checker={checker || undefined}
			style="--cp-color: {output};"
			onclick={() => (open = !open)}
			aria-label="{title}: {output}"
			aria-haspopup="dialog"
			aria-expanded={open}
		></button>
	{:else}
		<div class="scrubber-track scrubber-track--color cp-row">
			<button
				type="button"
				bind:this={triggerEl}
				class="cp-row-trigger"
				onclick={() => (open = !open)}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-label="{title}: {output}"
			>
				<span class="scrubber-label">{title}</span>
			</button>
			<div class="scrubber-color-controls">
				<button
					type="button"
					class="scrubber-color-swatch-preview cp-preview"
					data-checker={checker || undefined}
					style="--cp-color: {output};"
					tabindex="-1"
					aria-hidden="true"
					onclick={() => (open = !open)}
				></button>
				<input
					class="scrubber-color-text cp-row-input"
					type="text"
					value={rowText ?? output}
					spellcheck={false}
					autocomplete="off"
					aria-label="{title} value"
					onfocus={(event) => {
						rowText = output;
						(event.currentTarget as HTMLInputElement).select();
					}}
					oninput={(event) => (rowText = (event.currentTarget as HTMLInputElement).value)}
					onblur={() => applyText(rowText ?? output, () => (rowText = null))}
					onkeydown={(event) => {
						if (event.key === 'Enter') {
							applyText(rowText ?? output, () => (rowText = outputOf(hsva, alpha)));
							(event.currentTarget as HTMLInputElement).select();
						} else if (event.key === 'Escape') {
							rowText = null;
							(event.currentTarget as HTMLInputElement).blur();
						}
					}}
				/>
			</div>
		</div>
	{/if}

	{#if open && anchor}
		<div
			use:portal
			bind:this={popoverEl}
			class="cp-popover"
			role="dialog"
			aria-label="{title} color"
			data-placement={placement}
			style="left: {left}px; width: {width}px; top: {top}px; --cp-hue: {hueColor}; --cp-opaque: {opaque};"
		>
			<div
				bind:this={areaEl}
				class="cp-area"
				role="slider"
				tabindex="0"
				aria-label="Saturation and brightness"
				aria-valuenow={Math.round(hsva.s * 100)}
				aria-valuetext="Saturation {Math.round(hsva.s * 100)}%, brightness {Math.round(hsva.v * 100)}%"
				onkeydown={onAreaKey}
				{...areaDrag}
			>
				<span
					class="cp-area-thumb"
					style="left: {hsva.s * 100}%; top: {(1 - hsva.v) * 100}%; background: {opaque};"
				></span>
			</div>

			<div class="cp-sliders">
				{#if hasDropper}
					<button type="button" class="cp-icon-button" aria-label="Pick a color from the screen" onclick={pick}>
						<HugeiconsIcon icon={ColorPickerIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
					</button>
				{/if}
				<div class="cp-slider-stack">
					<div
						bind:this={hueEl}
						class="cp-slider cp-slider--hue"
						role="slider"
						tabindex="0"
						aria-label="Hue"
						aria-valuemin={0}
						aria-valuemax={360}
						aria-valuenow={Math.round(hsva.h)}
						onkeydown={(event) => onSliderKey(event, 'h', 360)}
						{...hueDrag}
					>
						<span class="cp-slider-thumb" style="left: {(hsva.h / 360) * 100}%; background: {hueColor};"></span>
					</div>
					{#if alpha}
						<div
							bind:this={alphaEl}
							class="cp-slider cp-slider--alpha"
							role="slider"
							tabindex="0"
							aria-label="Opacity"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(hsva.a * 100)}
							onkeydown={(event) => onSliderKey(event, 'a', 1)}
							{...alphaDrag}
						>
							<span class="cp-slider-fill"></span>
							<span class="cp-slider-thumb" style="left: {hsva.a * 100}%; --cp-thumb: {output};"></span>
						</div>
					{/if}
				</div>
			</div>

			<div class="cp-fields">
				<button
					type="button"
					class="cp-format"
					aria-label="Color format: {FORMAT_LABELS[format]}. Change format"
					onclick={() => setFormat(FORMATS[(FORMATS.indexOf(format) + 1) % FORMATS.length])}
				>
					{FORMAT_LABELS[format]}
				</button>
				{#if format === 'hex'}
					<label class="cp-channel cp-channel--wide">
						<input
							class="cp-input"
							value={hexText ?? toHex(rgba, false)}
							spellcheck={false}
							autocomplete="off"
							aria-label="Hex"
							onfocus={(event) => {
								hexText = toHex(rgba, false);
								(event.currentTarget as HTMLInputElement).select();
							}}
							oninput={(event) => (hexText = (event.currentTarget as HTMLInputElement).value)}
							onblur={() => applyText(hexText ?? '', () => (hexText = null))}
							onkeydown={(event) => {
								if (event.key === 'Enter') {
									applyText(hexText ?? '', () => (hexText = toHex(hsvaToRgba(hsva), false)));
									(event.currentTarget as HTMLInputElement).select();
								}
							}}
						/>
						<span class="cp-channel-label">Hex</span>
					</label>
				{/if}
				{#if format === 'rgb'}
					{#each ['r', 'g', 'b'] as const as key (key)}
						{@render channelInput(key.toUpperCase(), Math.round(rgba[key] * 255), 0, 255, (next) =>
							commitColor({ ...rgba, [key]: next / 255 })
						)}
					{/each}
				{/if}
				{#if format === 'hsl'}
					{@render channelInput('H', hsl.h, 0, 360, (next) => commit({ ...hsva, h: next }))}
					{@render channelInput('S', hsl.s, 0, 100, (next) =>
						commitColor({ ...(parseColor(`hsl(${hsl.h}, ${next}%, ${hsl.l}%)`) || rgba), a: hsva.a })
					)}
					{@render channelInput('L', hsl.l, 0, 100, (next) =>
						commitColor({ ...(parseColor(`hsl(${hsl.h}, ${hsl.s}%, ${next}%)`) || rgba), a: hsva.a })
					)}
				{/if}
				{#if alpha}
					{@render channelInput(
						'A',
						Math.round(hsva.a * 100),
						0,
						100,
						(next) => commit({ ...hsva, a: round(next / 100) }),
						' %'
					)}
				{/if}
				<button type="button" class="cp-icon-button" aria-label={copied ? 'Copied' : 'Copy color'} onclick={copy}>
					<HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={15} strokeWidth={1.6} aria-hidden="true" />
				</button>
			</div>

			<div class="cp-swatches" role="group" aria-label="Swatches">
				{#each SWATCHES as swatch (swatch)}
					<button
						type="button"
						class="cp-swatch"
						style="--cp-color: {swatch};"
						aria-label={swatch}
						aria-pressed={toHex(rgba, false) === swatch}
						onclick={() => commitColor({ ...parseColor(swatch)!, a: hsva.a })}
					></button>
				{/each}
			</div>

			{#if recent.length > 0}
				<div class="cp-recent">
					<span class="cp-recent-label">Recent</span>
					<div class="cp-swatches" role="group" aria-label="Recent colors">
						{#each recent as item (item)}
							<button
								type="button"
								class="cp-swatch"
								data-checker={item.length > 7 || undefined}
								style="--cp-color: {item};"
								aria-label={item}
								aria-pressed={output === item}
								onclick={() => {
									const parsed = parseColor(item);
									if (parsed) commitColor(parsed);
								}}
							></button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
