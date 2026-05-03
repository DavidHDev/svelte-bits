<script lang="ts">
	type Props = {
		title?: string;
		checked?: boolean;
		isDisabled?: boolean;
		onChange?: (v: boolean) => void;
	};
	let { title = '', checked = false, isDisabled = false, onChange }: Props = $props();

	function toggle() {
		if (isDisabled) return;
		onChange?.(!checked);
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<div class="scrubber">
	<button
		type="button"
		class="scrubber-track scrubber-track--switch"
		role="switch"
		aria-checked={checked}
		aria-label={title}
		aria-disabled={isDisabled}
		data-disabled={isDisabled}
		data-checked={checked}
		onclick={toggle}
		onkeydown={onKey}
	>
		<div class="scrubber-label">{title}</div>
		<div class="scrubber-switch-toggle">
			<div class="scrubber-switch-knob"></div>
		</div>
	</button>
</div>
