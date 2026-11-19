<script lang="ts">
	import RefreshButton from './RefreshButton.svelte';

	type Props = { onClick: () => void; label?: string };

	let { onClick, label = 'Replay animation' }: Props = $props();
</script>

<RefreshButton {onClick} {label} />
