<script lang="ts">
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { ReloadIcon } from '@hugeicons/core-free-icons';
	import { getPreviewStage } from './lib/componentProps.svelte';
	import { portal } from './lib/portal';

	type Props = { onClick?: () => void; label?: string };

	let { onClick, label = 'Refresh animation' }: Props = $props();

	const stage = getPreviewStage();
</script>

{#snippet button()}
	<button type="button" class="docs-refresh" onclick={() => onClick?.()} aria-label={label}>
		<HugeiconsIcon icon={ReloadIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
	</button>
{/snippet}

{#if !stage?.hasControls}
	{@render button()}
{:else if stage.controls}
	{#key stage.controls}
		<div use:portal={stage.controls} style="display: contents;">
			{@render button()}
		</div>
	{/key}
{/if}
