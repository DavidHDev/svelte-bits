<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { getCustomizeActions } from './lib/componentProps.svelte';
	import { useProSlot } from './lib/proSlot.svelte';
	import CategoryProFooter from '$lib/components/common/Pro/CategoryProFooter.svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();

	const actions = getCustomizeActions();
	const proSlot = useProSlot('customize');
</script>

<div class="customize-frame">
	<div class="customize-heading">
		<h2>Customize</h2>
		<div class="customize-heading-actions">
			{#if actions?.reset}
				<button
					type="button"
					class="customize-heading-action customize-reset-action"
					class:is-visible={actions.canReset}
					onclick={() => actions.reset?.()}
					disabled={!actions.canReset}
					aria-hidden={!actions.canReset}
					tabindex={actions.canReset ? 0 : -1}
				>
					<Icon name="RotateCcw" size={14} />
					<span>Reset</span>
				</button>
			{/if}
		</div>
	</div>

	<div class="preview-options">{@render children()}</div>
</div>

{#if proSlot?.owns}
	<CategoryProFooter category={proSlot.category} />
{/if}
