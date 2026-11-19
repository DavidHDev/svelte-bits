<script lang="ts">
	type Props = {
		title?: string;
		isChecked?: boolean;
		checked?: boolean;
		value?: boolean;
		isDisabled?: boolean;
		onChange?: (v: boolean) => void;
	};

	let { title = '', isChecked, checked, value, isDisabled = false, onChange }: Props = $props();

	const on = $derived(Boolean(isChecked ?? checked ?? value));

	function handleChange() {
		if (!isDisabled) onChange?.(!on);
	}
</script>

<div class="scrubber">
	<button
		type="button"
		class="scrubber-track scrubber-track--switch"
		role="switch"
		aria-checked={on}
		aria-label={title}
		aria-disabled={isDisabled}
		data-disabled={isDisabled}
		data-checked={on}
		tabindex={isDisabled ? -1 : 0}
		onclick={handleChange}
		onkeydown={(e) => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				handleChange();
			}
		}}
	>
		<span class="scrubber-label">{title}</span>
		<span class="scrubber-switch-toggle">
			<span class="scrubber-switch-knob"></span>
		</span>
	</button>
</div>
