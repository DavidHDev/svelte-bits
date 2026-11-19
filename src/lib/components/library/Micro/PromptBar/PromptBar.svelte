<!-- @svelte-bits
{
  "title": "Prompt Bar",
  "description": "Chat composer with @ sources, / commands, a model picker, dictation and attachments.",
  "dependencies": ["motion", "@hugeicons/svelte", "@hugeicons/core-free-icons"]
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconSvgElement } from '@hugeicons/svelte';
	import {
		ArrowDown01Icon,
		Attachment01Icon,
		Calendar03Icon,
		Cancel01Icon,
		ChartLineData01Icon,
		File02Icon,
		Globe02Icon,
		HelpCircleIcon,
		Mail01Icon,
		Mic01Icon,
		PlusSignIcon,
		SparklesIcon,
		Tick02Icon
	} from '@hugeicons/core-free-icons';

	export interface PromptBarSource {
		key: string;
		name: string;
		description?: string;
		icon?: Snippet | IconSvgElement;
		attach?: boolean;
	}

	export interface PromptBarCommand {
		key: string;
		name: string;
		description?: string;
	}

	export interface PromptBarModel {
		key: string;
		name: string;
		tag?: string;
	}

	export interface PromptBarSendDetail {
		attachments: string[];
		model?: PromptBarModel;
		effort?: string;
	}

	export interface PromptBarProps {
		placeholder?: string;
		sources?: PromptBarSource[];
		commands?: PromptBarCommand[];
		models?: PromptBarModel[];
		defaultModel?: string;
		efforts?: string[];
		defaultEffort?: string;
		onEffortChange?: (effort: string) => void;
		busy?: boolean;
		onSend?: (text: string, detail: PromptBarSendDetail) => void;
		onStop?: () => void;
		onAttach?: () => string | string[] | void | Promise<string | string[] | void>;
		onDictate?: () => string | void | Promise<string | void>;
		background?: string;
		color?: string;
		menuBackground?: string;
		sparkColor?: string;
		sparkBoost?: number;
		width?: number;
		radius?: number;
		maxRows?: number;
		morphDuration?: number;
		squash?: number;
		tilt?: number;
		pressScale?: number;
		className?: string;
	}

	type Row = {
		key: string;
		name: string;
		description?: string;
		tag?: string;
		icon?: Snippet | IconSvgElement;
		attach?: boolean;
	};
	type Token = { kind: 'at' | 'slash'; query: string; start: number };
	type Spark = {
		x: number;
		y: number;
		r: number;
		vy: number;
		sway: number;
		phase: number;
		life: number;
		span: number;
	};

	const ARROW_UP = [12, 4.5, 18.5, 11, 14.25, 11, 14.25, 19.5, 9.75, 19.5, 9.75, 11, 5.5, 11];
	const SQUARE = [12, 6, 18, 6, 18, 12, 18, 18, 6, 18, 6, 12, 6, 6];
	const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
	const LINE = 22;
	const EDGE = 11;

	const DEFAULT_SOURCES: PromptBarSource[] = [
		{
			key: 'files',
			name: 'Photos & files',
			description: 'Upload from this device',
			icon: Attachment01Icon,
			attach: true
		},
		{ key: 'web', name: 'Web search', description: 'Live results', icon: Globe02Icon },
		{ key: 'sales', name: 'Sales data', description: 'Revenue and churn', icon: ChartLineData01Icon },
		{ key: 'docs', name: 'Documents', description: 'Specs, notes, briefs', icon: File02Icon },
		{ key: 'mail', name: 'Mail', description: 'Read and draft mail', icon: Mail01Icon },
		{ key: 'calendar', name: 'Calendar', description: 'Events and availability', icon: Calendar03Icon }
	];
	const DEFAULT_COMMANDS: PromptBarCommand[] = [
		{ key: 'summarize', name: '/summarize', description: 'Digest the thread so far' },
		{ key: 'compare', name: '/compare', description: 'Two options side by side' },
		{ key: 'draft', name: '/draft', description: 'Write a first version' },
		{ key: 'explain', name: '/explain', description: 'A plain-language walkthrough' },
		{ key: 'tasks', name: '/tasks', description: 'Turn this into a to-do list' }
	];
	const DEFAULT_MODELS: PromptBarModel[] = [
		{ key: 'nova-3', name: 'Nova 3', tag: 'Flagship' },
		{ key: 'nova-mini', name: 'Nova Mini', tag: 'Fast' },
		{ key: 'nova-2', name: 'Nova 2', tag: 'Legacy' }
	];
	const DEFAULT_EFFORTS = ['Low', 'Medium', 'High', 'Extra', 'Max'];

	const mix = (a: number, b: number, t: number) => a + (b - a) * t;
	const pathAt = (a: number[], b: number[], t: number) => {
		let d = '';
		for (let i = 0; i < a.length; i += 2) {
			d += `${i ? 'L' : 'M'}${mix(a[i], b[i], t).toFixed(2)} ${mix(a[i + 1], b[i + 1], t).toFixed(2)}`;
		}
		return `${d}Z`;
	};

	const parseToken = (draft: string): Token | null => {
		const m = /(^|\s)([@/])([\w-]*)$/.exec(draft);
		if (!m) return null;
		return { kind: m[2] === '@' ? 'at' : 'slash', query: m[3].toLowerCase(), start: m.index + m[1].length };
	};

	const capture = (el: HTMLElement, id: number) => {
		try {
			el.setPointerCapture(id);
			return true;
		} catch {
			return false;
		}
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { animate, motionValue } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	let {
		placeholder = 'Ask anything',
		sources = DEFAULT_SOURCES,
		commands = DEFAULT_COMMANDS,
		models = DEFAULT_MODELS,
		defaultModel = '',
		efforts = DEFAULT_EFFORTS,
		defaultEffort = '',
		onEffortChange,
		busy = false,
		onSend,
		onStop,
		onAttach,
		onDictate,
		background = '#2b2621',
		color = '#f5f5f5',
		menuBackground = '#37302a',
		sparkColor = '#FF8A4C',
		sparkBoost = 1,
		width = 400,
		radius = 16,
		maxRows = 5,
		morphDuration = 240,
		squash = 0.12,
		tilt = 8,
		pressScale = 0.96,
		className = ''
	}: PromptBarProps = $props();

	const motionQuery =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(prefers-reduced-motion: reduce)')
			: null;
	let reduce = $state(motionQuery?.matches ?? false);
	$effect(() => {
		if (!motionQuery) return;
		const change = () => {
			reduce = motionQuery.matches;
		};
		motionQuery.addEventListener('change', change);
		return () => motionQuery.removeEventListener('change', change);
	});

	let rootEl: HTMLDivElement | null = $state(null);
	let inputEl: HTMLTextAreaElement | null = $state(null);
	let glowEl: HTMLSpanElement | null = $state(null);
	let sparkEl: HTMLCanvasElement | null = $state(null);
	let svgEl: SVGSVGElement | null = $state(null);
	let pathEl: SVGPathElement | null = $state(null);
	let rowEls: (HTMLButtonElement | null)[] = $state([]);
	const typing = { energy: 0, strokes: 0 };
	let lastOpen: string | null = null;
	let dictation = 0;

	let draft = $state('');
	let attachments: string[] = $state([]);
	let modelKey = $state(untrack(() => defaultModel));
	let plusOpen = $state(false);
	let modelOpen = $state(false);
	let effortOpen = $state(false);
	let effortIndex = $state(
		untrack(() => {
			const i = efforts.indexOf(defaultEffort);
			return i >= 0 ? i : Math.max(0, Math.floor((efforts.length - 1) / 2));
		})
	);
	let dismissed = $state(false);
	let active = $state(0);
	let listening = $state(false);
	let pressed = $state(false);

	const model = $derived(models.find((m) => m.key === modelKey) ?? models[0]);
	const token = $derived(dismissed ? null : parseToken(draft));
	const open = $derived(plusOpen ? 'at' : (token?.kind ?? (modelOpen ? 'model' : effortOpen ? 'effort' : null)));
	const query = $derived(plusOpen ? '' : (token?.query ?? ''));
	const list: Row[] = $derived.by(() => {
		if (open === 'at') return sources.filter((s) => s.name.toLowerCase().includes(query));
		if (open === 'slash') return commands.filter((c) => c.name.replace(/^\//, '').toLowerCase().startsWith(query));
		if (open === 'model') return models;
		return [];
	});
	const cursor = $derived(Math.min(active, Math.max(0, list.length - 1)));
	const canSend = $derived(draft.trim().length > 0 || attachments.length > 0);
	const armed = $derived(busy || canSend);
	const level = $derived(efforts[effortIndex] ?? '');
	const maxed = $derived(efforts.length > 1 && effortIndex === efforts.length - 1);

	const focusInput = () => inputEl?.focus({ preventScroll: true });
	const closeMenus = () => {
		plusOpen = false;
		modelOpen = false;
		effortOpen = false;
	};

	$effect.pre(() => {
		if (!open) lastOpen = null;
	});

	$effect(() => {
		const glow = glowEl;
		const kind = open;
		const index = cursor;
		void list;
		const row = rowEls[index];
		untrack(() => {
			if (!glow || !kind) return;
			if (!row) {
				glow.style.opacity = '0';
				return;
			}
			const fresh = lastOpen !== kind;
			lastOpen = kind;
			if (fresh) glow.style.transition = 'none';
			glow.style.top = `${row.offsetTop}px`;
			glow.style.height = `${row.offsetHeight}px`;
			glow.style.opacity = '1';
			if (fresh) {
				void glow.offsetHeight;
				glow.style.transition = '';
			}
		});
	});

	$effect(() => {
		if (!plusOpen && !modelOpen && !effortOpen) return;
		const onDown = (e: PointerEvent) => {
			if (!rootEl?.contains(e.target as Node)) closeMenus();
		};
		document.addEventListener('pointerdown', onDown);
		return () => document.removeEventListener('pointerdown', onDown);
	});

	$effect(() => {
		const el = inputEl;
		void draft;
		const rows = maxRows;
		if (!el) return;
		el.style.height = '0px';
		const max = LINE * rows;
		el.style.height = `${Math.min(el.scrollHeight, max)}px`;
		el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
	});

	$effect(() => () => {
		dictation += 1;
	});

	$effect(() => {
		const canvas = sparkEl;
		const tint = sparkColor;
		if (!maxed || reduce || !canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		typing.strokes = 0;
		let raf = 0;
		let last = performance.now();
		let w = 0;
		let h = 0;
		let due = 0;
		let speed = 1;
		let pulse = 0;
		const parts: Spark[] = [];
		let resizePending = false;
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			w = rect.width;
			h = rect.height;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		const spawn = (burst: boolean) => {
			parts.push({
				x: Math.random() * w,
				y: burst ? h * (0.2 + Math.random() * 0.8) : h + 3,
				r: 0.9 + Math.random() * 1.1,
				vy: -(7 + Math.random() * 9),
				sway: (Math.random() - 0.5) * 10,
				phase: Math.random() * Math.PI * 2,
				life: burst ? Math.random() * 1.2 : 0,
				span: 2.4 + Math.random() * 2.4
			});
		};
		const tick = (now: number) => {
			if (resizePending) {
				resizePending = false;
				resize();
			}
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			const gain = sparkBoost;
			typing.energy *= Math.exp(-dt / 0.8);
			pulse *= Math.exp(-dt / 0.16);
			if (typing.strokes > 0) {
				typing.strokes = 0;
				if (gain > 0) pulse = 1;
			}
			const energy = typing.energy * gain;
			speed += (1 + energy * 6 - speed) * (1 - Math.exp(-dt / 0.15));
			due += dt;
			while (due > 0.14) {
				due -= 0.14;
				if (parts.length < 30) spawn(false);
			}
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = tint;
			ctx.shadowColor = tint;
			ctx.shadowBlur = 6 + energy * 10 + pulse * 6;
			for (let i = parts.length - 1; i >= 0; i -= 1) {
				const p = parts[i];
				p.life += dt;
				if (p.life > p.span) {
					parts.splice(i, 1);
					continue;
				}
				const k = p.life / p.span;
				const twinkle = 0.7 + 0.3 * Math.sin((now / 160) * (1 + energy) + p.phase);
				p.y += p.vy * dt * speed;
				if (p.y < -4) {
					p.y = h + 3;
					p.x = Math.random() * w;
				}
				const edge = Math.min(1, Math.max(0, p.y / 14), Math.max(0, (h - p.y) / 14));
				ctx.globalAlpha = Math.min(1, Math.sin(k * Math.PI) * (0.9 + energy * 0.25) * twinkle) * edge;
				ctx.beginPath();
				ctx.arc(
					p.x + Math.sin((now / 900) * (1 + energy * 0.8) + p.phase) * p.sway,
					p.y,
					p.r * twinkle * (1 + energy * 0.35),
					0,
					Math.PI * 2
				);
				ctx.fill();
			}
			raf = requestAnimationFrame(tick);
		};
		resize();
		for (let i = 0; i < 26; i += 1) spawn(true);
		const ro = new ResizeObserver(() => {
			resizePending = true;
		});
		ro.observe(canvas);
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			ctx.clearRect(0, 0, w, h);
		};
	});

	const t = motionValue(untrack(() => busy) ? 1 : 0);
	let dir = untrack(() => busy) ? 1 : -1;
	const glyphStart = pathAt(ARROW_UP, SQUARE, t.get());

	$effect(() => {
		const off = t.on('change', (v) => {
			pathEl?.setAttribute('d', pathAt(ARROW_UP, SQUARE, v));
			const goo = reduce ? 0 : Math.sin(v * Math.PI);
			const sx = 1 - squash * goo;
			if (svgEl) {
				svgEl.style.transform = goo ? `rotate(${dir * tilt * goo}deg) scale(${sx}, ${1 / sx})` : '';
			}
		});
		return () => {
			off();
			t.destroy();
		};
	});

	$effect(() => {
		const target = busy ? 1 : 0;
		const duration = morphDuration;
		const instant = reduce;
		dir = busy ? 1 : -1;
		if (t.get() === target) return;
		const controls = animate(t, target, instant ? { duration: 0 } : { duration: duration / 1000, ease: EASE_IN_OUT });
		return () => controls.stop();
	});

	const setEffort = (i: number) => {
		const next = Math.max(0, Math.min(efforts.length - 1, i));
		if (next === effortIndex) return;
		effortIndex = next;
		onEffortChange?.(efforts[next]);
	};
	const effortFromPointer = (e: PointerEvent & { currentTarget: HTMLElement }) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const k = (e.clientX - rect.left - EDGE) / Math.max(1, rect.width - 2 * EDGE);
		setEffort(Math.round(k * (efforts.length - 1)));
	};
	const onEffortKey = (e: KeyboardEvent) => {
		const step =
			e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
		if (step) {
			e.preventDefault();
			setEffort(effortIndex + step);
		} else if (e.key === 'Home') {
			e.preventDefault();
			setEffort(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			setEffort(efforts.length - 1);
		} else if (e.key === 'Escape') {
			effortOpen = false;
			focusInput();
		}
	};
	const stepAt = (i: number) => `calc(${EDGE}px + (100% - ${EDGE * 2}px) * ${i / Math.max(1, efforts.length - 1)})`;
	const fillAt = (i: number) => (i === efforts.length - 1 ? '100%' : `calc(${stepAt(i)} + 7px)`);

	const pick = (row: Row) => {
		if (open === 'model') {
			modelKey = row.key;
			modelOpen = false;
			focusInput();
			return;
		}
		const head = token ? draft.slice(0, token.start) : draft;
		if (row.attach) {
			draft = head;
			Promise.resolve(onAttach?.()).then((files) => {
				if (!files) return;
				attachments = [...attachments, ...(Array.isArray(files) ? files : [files])];
			});
		} else if (open === 'at') {
			draft = `${head}@${row.name} `;
		} else {
			draft = `${head}${row.name} `;
		}
		plusOpen = false;
		dismissed = false;
		focusInput();
	};

	const send = () => {
		if (!canSend || busy) return;
		onSend?.(draft.trim(), { attachments: [...attachments], model, effort: level });
		draft = '';
		attachments = [];
		dismissed = false;
		closeMenus();
		focusInput();
	};

	const toggleListen = () => {
		if (listening) {
			dictation += 1;
			listening = false;
			return;
		}
		const seq = ++dictation;
		listening = true;
		Promise.resolve(onDictate?.()).then(
			(text) => {
				if (seq !== dictation) return;
				listening = false;
				if (text) draft = draft.trim() ? `${draft.trimEnd()} ${text}` : text;
				focusInput();
			},
			() => {
				if (seq === dictation) listening = false;
			}
		);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (open && list.length) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				active = (cursor + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length;
				return;
			}
			if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
				e.preventDefault();
				pick(list[cursor]);
				return;
			}
		}
		if (e.key === 'Escape') {
			if (open) {
				e.preventDefault();
				dismissed = true;
				closeMenus();
			}
			return;
		}
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			send();
		}
	};

	const down = (e: PointerEvent) => {
		if (e.button !== 0 || !armed) return;
		pressed = true;
	};
	const up = () => {
		pressed = false;
	};

	const MUTED = '[color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]';
	const TOOL =
		'inline-grid h-7 w-7 flex-none cursor-pointer touch-manipulation place-items-center rounded-lg border-0 bg-transparent p-0 outline-none select-none [color:color-mix(in_srgb,var(--pb-ink)_60%,transparent)] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_150ms_ease,color_150ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] active:[transform:scale(0.94)] data-[on]:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] data-[on]:[color:var(--pb-ink)] motion-reduce:active:[transform:none] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:var(--pb-ink)]';
	const PICK =
		'inline-flex h-7 flex-none cursor-pointer touch-manipulation items-center gap-1 rounded-lg border-0 bg-transparent px-2 text-[12px] font-medium outline-none select-none [color:color-mix(in_srgb,var(--pb-ink)_70%,transparent)] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_150ms_ease,color_150ms_ease] data-[on]:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] data-[on]:[color:var(--pb-ink)] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:var(--pb-ink)] data-[max]:[color:var(--pb-spark)]!';
</script>

<div
	bind:this={rootEl}
	class={`group relative text-[14px] leading-[22px] [width:min(var(--pb-w),100%)] [color:var(--pb-ink)]${className ? ` ${className}` : ''}`}
	data-busy={busy ? '' : undefined}
	data-max={maxed ? '' : undefined}
	style:--pb-bg={background}
	style:--pb-ink={color}
	style:--pb-menu={menuBackground}
	style:--pb-w="{width}px"
	style:--pb-radius="{radius}px"
	style:--pb-spark={sparkColor}
	style:--pb-press={pressScale}
>
	{#if open}
		<div
			class="absolute inset-x-0 bottom-[calc(100%+8px)] z-[2] origin-bottom rounded-xl p-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.08)] [animation:prompt-bar-pop_180ms_cubic-bezier(0.23,1,0.32,1)_both] [background:var(--pb-menu)] data-[kind=model]:right-auto data-[kind=model]:w-[200px] data-[kind=model]:origin-bottom-left data-[kind=effort]:right-auto data-[kind=effort]:w-[248px] data-[kind=effort]:origin-bottom-left data-[kind=effort]:px-3.5 data-[kind=effort]:pt-3 data-[kind=effort]:pb-3.5 motion-reduce:[animation:none]"
			role={open === 'effort' ? 'dialog' : 'listbox'}
			aria-label={open === 'at' ? 'Sources' : open === 'slash' ? 'Commands' : open === 'model' ? 'Models' : 'Effort'}
			data-kind={open}
		>
			{#if open === 'effort'}
				<div class="flex items-center gap-2 text-[13px] leading-[18px]">
					<span class={MUTED}>Effort</span>
					<span class="font-medium">{level}</span>
					<span class="ml-auto inline-flex {MUTED}" title="Higher effort thinks longer before answering">
						<HugeiconsIcon icon={HelpCircleIcon} size={14} strokeWidth={1.8} />
					</span>
				</div>
				<div class="mt-3 flex justify-between text-[12px] leading-4 {MUTED}">
					<span>Faster</span>
					<span>Smarter</span>
				</div>
				<div
					class="relative mt-2 h-[22px] cursor-pointer touch-none rounded-[11px] outline-none select-none [background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)]"
					role="slider"
					tabindex={0}
					aria-label="Effort"
					aria-valuemin={0}
					aria-valuemax={efforts.length - 1}
					aria-valuenow={effortIndex}
					aria-valuetext={level}
					style:--pb-effort-x={stepAt(effortIndex)}
					style:--pb-effort-fill={fillAt(effortIndex)}
					onpointerdown={(e) => {
						if (e.button !== 0) return;
						capture(e.currentTarget, e.pointerId);
						e.currentTarget.focus({ preventScroll: true });
						effortFromPointer(e);
					}}
					onpointermove={(e) => {
						if (e.buttons & 1) effortFromPointer(e);
					}}
					onkeydown={onEffortKey}
				>
					<span
						class="absolute inset-y-0 left-0 rounded-[11px] [width:var(--pb-effort-fill)] [background:color-mix(in_srgb,var(--pb-ink)_18%,transparent)] [transition:width_220ms_cubic-bezier(0.23,1,0.32,1),background-color_300ms_ease] group-data-[max]:[background:color-mix(in_srgb,var(--pb-spark)_35%,transparent)] motion-reduce:[transition:background-color_300ms_ease]"
					></span>
					{#each efforts as label, i (label)}
						<i
							class="absolute top-1/2 -mt-0.5 -ml-0.5 h-1 w-1 rounded-full [background:color-mix(in_srgb,var(--pb-ink)_30%,transparent)]"
							style:left={stepAt(i)}
						></i>
					{/each}
					<span
						class="absolute -top-[3px] -ml-[7px] h-7 w-3.5 rounded-[7px] shadow-[0_2px_6px_rgba(0,0,0,0.25)] [left:var(--pb-effort-x)] [background:var(--pb-ink)] [transition:left_220ms_cubic-bezier(0.23,1,0.32,1),background-color_300ms_ease] group-data-[max]:[background:var(--pb-spark)] motion-reduce:[transition:background-color_300ms_ease]"
					></span>
				</div>
			{:else}
				<span
					bind:this={glowEl}
					class="pointer-events-none absolute inset-x-1 rounded-lg opacity-0 [background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [transition:top_220ms_cubic-bezier(0.23,1,0.32,1),height_220ms_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease] motion-reduce:[transition:opacity_150ms_ease]"
					aria-hidden="true"
				></span>
				{#each list as row, i (row.key)}
					<button
						bind:this={rowEls[i]}
						type="button"
						role="option"
						aria-selected={i === cursor}
						class="relative z-[1] flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2 text-left text-inherit outline-none [font:inherit] [-webkit-tap-highlight-color:transparent]"
						onmousedown={(e) => e.preventDefault()}
						onpointerenter={() => (active = i)}
						onclick={() => pick(row)}
					>
						{#if open === 'at'}
							<span
								class="inline-flex w-5 flex-none justify-center [color:color-mix(in_srgb,var(--pb-ink)_70%,transparent)]"
							>
								{#if typeof row.icon === 'function'}
									{@render row.icon()}
								{:else if row.icon}
									<HugeiconsIcon icon={row.icon} size={15} strokeWidth={1.8} />
								{/if}
							</span>
						{/if}
						<span class="flex-none text-[13px] font-medium">{row.name}</span>
						{#if row.description}
							<span class="min-w-0 flex-auto truncate text-[12px] {MUTED}">{row.description}</span>
						{/if}
						{#if open === 'model'}
							<span class="ml-auto flex-none text-[11px] {MUTED}">{row.tag}</span>
							<span
								class="inline-flex w-4 flex-none justify-center opacity-0 data-[on]:opacity-100"
								data-on={row.key === model?.key ? '' : undefined}
							>
								<HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={2.5} />
							</span>
						{/if}
					</button>
				{/each}
				{#if list.length === 0}
					<div class="flex h-9 items-center px-2 text-[12px] {MUTED}">No matches for “{query}”</div>
				{/if}
			{/if}
		</div>
	{/if}

	<div
		class="relative isolate flex cursor-text flex-col gap-2 p-3 [background:var(--pb-bg)] [border-radius:var(--pb-radius)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:content-[''] before:[background:radial-gradient(140%_120%_at_0%_100%,color-mix(in_srgb,var(--pb-spark)_26%,transparent),transparent_62%)] before:[transition:opacity_500ms_ease] data-[max]:before:opacity-100"
		role="presentation"
		data-max={maxed ? '' : undefined}
		onpointerdown={(e) => {
			if (e.target === e.currentTarget || e.target === inputEl) closeMenus();
		}}
		onclick={focusInput}
	>
		<canvas
			bind:this={sparkEl}
			class="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-[inherit]"
			aria-hidden="true"
		></canvas>
		{#if attachments.length > 0}
			<div class="flex flex-wrap gap-1.5">
				{#each attachments as file, i (`${file}-${i}`)}
					<span
						class="inline-flex h-[26px] items-center gap-1.5 rounded-lg pr-1 pl-2 text-[12px] [animation:prompt-bar-pop_200ms_cubic-bezier(0.23,1,0.32,1)_both] [background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] motion-reduce:[animation:none]"
					>
						<HugeiconsIcon icon={File02Icon} size={12} strokeWidth={2} />
						<span class="max-w-[144px] truncate">{file}</span>
						<button
							type="button"
							class="inline-grid h-[18px] w-[18px] cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent p-0 text-inherit opacity-60 outline-none [transition:opacity_120ms_ease,background-color_120ms_ease] hover:opacity-100 hover:[background:color-mix(in_srgb,var(--pb-ink)_10%,transparent)]"
							aria-label={`Remove ${file}`}
							onclick={() => (attachments = attachments.filter((_, j) => j !== i))}
						>
							<HugeiconsIcon icon={Cancel01Icon} size={10} strokeWidth={2.5} />
						</button>
					</span>
				{/each}
			</div>
		{/if}

		<textarea
			bind:this={inputEl}
			class="block w-full resize-none border-0 bg-transparent p-0 text-[14px] leading-[22px] text-inherit outline-none [font:inherit] [overflow-wrap:anywhere] placeholder:[color:color-mix(in_srgb,var(--pb-ink)_45%,transparent)] [@media(pointer:coarse)]:text-[16px]"
			rows={1}
			value={draft}
			placeholder={listening ? 'Listening…' : placeholder}
			aria-label="Prompt"
			oninput={(e) => {
				draft = e.currentTarget.value;
				typing.energy = Math.min(1.6, typing.energy + 0.22);
				typing.strokes = Math.min(4, typing.strokes + 1);
				dismissed = false;
				closeMenus();
				active = 0;
			}}
			onfocus={closeMenus}
			onkeydown={onKeyDown}
		></textarea>

		<div class="flex items-center gap-1">
			<button
				type="button"
				class={TOOL}
				aria-label="Add files and sources"
				aria-expanded={plusOpen}
				data-on={plusOpen ? '' : undefined}
				onmousedown={(e) => e.preventDefault()}
				onclick={() => {
					modelOpen = false;
					effortOpen = false;
					active = 0;
					plusOpen = !plusOpen;
					focusInput();
				}}
			>
				<HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
			</button>
			{#if models.length > 0}
				<button
					type="button"
					class={PICK}
					aria-label="Choose model"
					aria-expanded={modelOpen}
					data-on={modelOpen ? '' : undefined}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => {
						plusOpen = false;
						effortOpen = false;
						active = Math.max(0, models.indexOf(model));
						modelOpen = !modelOpen;
						focusInput();
					}}
				>
					<span>{model.name}</span>
					<HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2.4} />
				</button>
			{/if}
			{#if efforts.length > 0}
				<button
					type="button"
					class={PICK}
					aria-label="Choose effort"
					aria-expanded={effortOpen}
					data-on={effortOpen ? '' : undefined}
					data-max={maxed ? '' : undefined}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => {
						plusOpen = false;
						modelOpen = false;
						effortOpen = !effortOpen;
						focusInput();
					}}
				>
					<HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2} />
					<span>{level}</span>
				</button>
			{/if}
			<span class="flex-auto"></span>
			{#if onDictate}
				<button
					type="button"
					class={TOOL}
					aria-label={listening ? 'Stop dictation' : 'Dictate'}
					aria-pressed={listening}
					data-on={listening ? '' : undefined}
					onmousedown={(e) => e.preventDefault()}
					onclick={toggleListen}
				>
					{#if listening}
						<span
							class="flex h-3.5 items-center gap-[2.5px] [&>i]:block [&>i]:h-full [&>i]:w-[2.5px] [&>i]:origin-center [&>i]:rounded-full [&>i]:bg-current [&>i]:[animation:prompt-bar-eq_900ms_ease-in-out_infinite] [&>i:nth-child(2)]:[animation-delay:150ms] [&>i:nth-child(3)]:[animation-delay:300ms]"
							aria-hidden="true"
						>
							<i></i>
							<i></i>
							<i></i>
						</span>
					{:else}
						<HugeiconsIcon icon={Mic01Icon} size={15} strokeWidth={2} />
					{/if}
				</button>
			{/if}
			<button
				type="button"
				class="relative inline-grid h-7 w-7 flex-none cursor-pointer touch-manipulation place-items-center rounded-lg border-0 p-0 outline-none select-none [background:color-mix(in_srgb,var(--pb-ink)_12%,var(--pb-bg))] [color:color-mix(in_srgb,var(--pb-ink)_55%,var(--pb-bg))] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_200ms_ease,color_200ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] disabled:cursor-default data-[armed]:[background:var(--pb-ink)] data-[armed]:[color:var(--pb-bg)] data-[pressed]:[transform:scale(var(--pb-press))] motion-reduce:data-[pressed]:[transform:none]"
				disabled={!armed}
				aria-label={busy ? 'Stop' : 'Send'}
				data-armed={armed ? '' : undefined}
				data-pressed={pressed ? '' : undefined}
				onmousedown={(e) => e.preventDefault()}
				onpointerdown={down}
				onpointerup={up}
				onpointercancel={up}
				onpointerleave={up}
				onclick={() => {
					if (busy) onStop?.();
					else send();
				}}
			>
				<svg
					bind:this={svgEl}
					class="block h-4 w-4 origin-center"
					viewBox="0 0 24 24"
					aria-hidden="true"
					fill="currentColor"
					stroke="currentColor"
					stroke-width="2"
					stroke-linejoin="round"
				>
					<path bind:this={pathEl} d={glyphStart} />
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes -global-prompt-bar-pop {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.98);
		}
	}
	@keyframes -global-prompt-bar-eq {
		0%,
		100% {
			transform: scaleY(0.35);
		}
		50% {
			transform: scaleY(1);
		}
	}
</style>
