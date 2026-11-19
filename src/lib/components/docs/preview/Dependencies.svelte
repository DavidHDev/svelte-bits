<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { dependenciesForSlug } from '$lib/constants/componentDependencies';
	import { generateDependencyCommands, getTypeDependencies, installation } from './lib/installation.svelte';

	type Props = { dependencyList?: string[] };

	let { dependencyList }: Props = $props();

	const dependencies = $derived([
		...new Set(
			(dependencyList ?? dependenciesForSlug(page.params.subcategory)).map((dependency) => dependency.trim()).filter(Boolean)
		)
	]);
	const commands = $derived(generateDependencyCommands(dependencies));
	const command = $derived(commands?.[installation.packageManager] || commands?.npm || '');
	const packageCount = $derived(dependencies.length + getTypeDependencies(dependencies).length);

	let copied = $state(false);

	$effect(() => {
		if (!copied) return;
		const timeout = window.setTimeout(() => (copied = false), 1800);
		return () => window.clearTimeout(timeout);
	});

	async function copyCommand() {
		try {
			await navigator.clipboard.writeText(command);
			copied = true;
		} catch {
			copied = false;
		}
	}
</script>

{#if dependencies.length > 0}
	<section class="dependencies-panel" aria-labelledby="dependencies-title">
		<div class="dependencies-summary">
			<h2 id="dependencies-title">Dependencies</h2>
			<p>{packageCount} required {packageCount === 1 ? 'package' : 'packages'}</p>
		</div>
		<div class="dependencies-command">
			<code title={command}>{command}</code>
			<button type="button" onclick={copyCommand} aria-label={copied ? 'Install command copied' : 'Copy install command'}>
				<Icon name={copied ? 'Check' : 'Copy'} size={15} />
				<span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
			</button>
		</div>
	</section>
{/if}
