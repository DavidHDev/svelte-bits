<script lang="ts">
	import { isInRegistry, type PackageManager } from '$lib/constants/cli';
	import { dependenciesForSlug } from '$lib/constants/componentDependencies';
	import CodeSection from './CodeSection.svelte';
	import CodeCopyButton from './CodeCopyButton.svelte';
	import DocsMenu from './DocsMenu.svelte';
	import Icon from './Icon.svelte';
	import { tooltip } from './lib/tooltip';
	import { cliCommandFor, generateDependencyCommands, installation, type CliTool } from './lib/installation.svelte';

	type Props = { slug: string; dependencies?: string[] };

	let { slug, dependencies }: Props = $props();

	const PKG_ORDER: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];
	const CLI_TOOLS: CliTool[] = ['shadcn', 'jsrepo'];

	const deps = $derived(dependencies ?? dependenciesForSlug(slug));
	const manualCommands = $derived(generateDependencyCommands(deps));
	const hasManual = $derived(Boolean(manualCommands));
	const inRegistry = $derived(isInRegistry(slug));
	const mode = $derived(!hasManual && installation.installMode === 'manual' ? 'cli' : installation.installMode);
	const pkg = $derived(installation.packageManager);
	const cliLib = $derived(installation.cliTool);

	const currentCommand = $derived(
		mode === 'manual' ? (manualCommands?.[pkg] ?? '') : cliCommandFor(slug, cliLib, pkg)
	);

	let codeEl = $state<HTMLElement | null>(null);
	let trackEl = $state<HTMLDivElement | null>(null);
	let scrollMeta = $state({ w: 0, l: 0, show: false });
	let dragging = $state(false);
	let dragOffset = 0;
	let trackWidth = 0;
	let thumbWidth = 0;

	function updateScrollMeta() {
		const el = codeEl;
		if (!el) return;
		const { scrollWidth, clientWidth, scrollLeft } = el;
		if (scrollWidth <= clientWidth) {
			if (scrollMeta.show) scrollMeta = { w: 0, l: 0, show: false };
			return;
		}
		const ratio = clientWidth / scrollWidth;
		const tw = Math.max(24, clientWidth * ratio);
		const maxTrack = clientWidth - tw;
		const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * maxTrack;
		scrollMeta = { w: tw, l: thumbLeft, show: true };
		trackWidth = clientWidth;
		thumbWidth = tw;
	}

	$effect(() => {
		void currentCommand;
		requestAnimationFrame(updateScrollMeta);
	});

	$effect(() => {
		window.addEventListener('resize', updateScrollMeta);
		return () => window.removeEventListener('resize', updateScrollMeta);
	});

	$effect(() => {
		if (!dragging) return;
		const handleMove = (e: MouseEvent) => {
			const el = codeEl;
			if (!el || !trackEl) return;
			const rect = trackEl.getBoundingClientRect();
			const maxThumbLeft = trackWidth - thumbWidth;
			const newLeft = Math.max(0, Math.min(maxThumbLeft, e.clientX - rect.left - dragOffset));
			el.scrollLeft = (newLeft / maxThumbLeft) * (el.scrollWidth - el.clientWidth);
			scrollMeta = { ...scrollMeta, l: newLeft };
		};
		const handleUp = () => (dragging = false);
		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp, { once: true });
		return () => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);
		};
	});

	function handleScrollbarMouseDown(e: MouseEvent) {
		const el = codeEl;
		if (!el || !trackEl) return;
		const rect = trackEl.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const { l: thumbLeft, w } = scrollMeta;
		if (clickX >= thumbLeft && clickX <= thumbLeft + w) {
			dragOffset = clickX - thumbLeft;
		} else {
			const maxLeft = trackWidth - w;
			const newLeft = Math.max(0, Math.min(maxLeft, clickX - w / 2));
			el.scrollLeft = (newLeft / maxLeft) * (el.scrollWidth - el.clientWidth);
			dragOffset = clickX - newLeft;
			scrollMeta = { ...scrollMeta, l: newLeft };
		}
		dragging = true;
	}

</script>

{#if inRegistry || hasManual}
	<CodeSection title="Install" class="cli-install">
		{#snippet actions()}
			<div class="cli-install-actions">
				<div class="mode-switch" data-mode-switch style="display: flex; align-items: center;">
					<div style="display: flex; gap: 4px;">
						<button
							type="button"
							data-active={mode === 'cli'}
							onclick={() => (installation.installMode = 'cli')}
							class="cli-toggle-button"
						>
							CLI
						</button>
						{#if hasManual}
							<button
								type="button"
								data-active={mode === 'manual'}
								onclick={() => (installation.installMode = 'manual')}
								class="cli-toggle-button"
							>
								Manual
							</button>
						{:else}
							<span
								style="display: inline-block;"
								use:tooltip={{ label: 'No dependencies, head to the "Code" section', placement: 'top' }}
							>
								<button data-active={false} class="cli-toggle-button disabled" disabled aria-disabled="true" type="button">
									Manual
								</button>
							</span>
						{/if}
					</div>
				</div>
				<DocsMenu placement="bottom-start" gutter={8} minWidth="" contentClass="install-options-menu" fluid={false}>
					{#snippet trigger({ props })}
						<button type="button" class="install-options-trigger" aria-label="Choose installation options" {...props}>
							<span>{pkg}</span>
							{#if mode === 'cli'}
								<span class="install-options-dot" aria-hidden="true">·</span>
								<span>{cliLib}</span>
							{/if}
							<Icon name="TbChevronDown" />
						</button>
					{/snippet}
					{#snippet children()}
						<div class="install-options-label">Package manager</div>
						{#each PKG_ORDER as manager (manager)}
							<button
								type="button"
								role="menuitem"
								data-part="item"
								class="install-options-item"
								onclick={() => (installation.packageManager = manager)}
							>
								<span>{manager}</span>
								{#if pkg === manager}
									<Icon name="TbCheck" />
								{/if}
							</button>
						{/each}
						{#if mode === 'cli'}
							<div class="install-options-separator" role="separator"></div>
							<div class="install-options-label">Registry</div>
							{#each CLI_TOOLS as tool (tool)}
								<button
									type="button"
									role="menuitem"
									data-part="item"
									class="install-options-item"
									onclick={() => (installation.cliTool = tool)}
								>
									<span>{tool}</span>
									{#if cliLib === tool}
										<Icon name="TbCheck" />
									{/if}
								</button>
							{/each}
						{/if}
					{/snippet}
				</DocsMenu>
				<CodeCopyButton codeString={currentCommand} />
			</div>
		{/snippet}
		<div class="code-wrapper" style="position: relative;">
			<code class="cli-code" bind:this={codeEl} onscroll={updateScrollMeta} style="white-space: pre; width: 100%;">{currentCommand}</code>
			{#if scrollMeta.show}
				<div
					class="cli-custom-scrollbar"
					class:dragging
					aria-hidden="true"
					bind:this={trackEl}
					onmousedown={handleScrollbarMouseDown}
				>
					<div class="cli-custom-scrollbar-thumb" style="width: {scrollMeta.w}px; transform: translateX({scrollMeta.l}px);"></div>
				</div>
			{/if}
		</div>
	</CodeSection>
{/if}
