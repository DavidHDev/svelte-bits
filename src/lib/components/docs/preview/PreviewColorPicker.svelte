<script lang="ts">
	import PreviewColorPickerCustom from './PreviewColorPickerCustom.svelte';

	type Props = {
		title?: string;
		value?: string;
		color?: string;
		alpha?: boolean;
		onChange?: (v: string) => void;
		setColor?: (v: string) => void;
	};

	let { title = '', value, color, alpha = false, onChange, setColor }: Props = $props();
</script>

<PreviewColorPickerCustom
	{title}
	color={color ?? value ?? '#ffffff'}
	{alpha}
	onChange={(next) => {
		onChange?.(next);
		setColor?.(next);
	}}
/>
