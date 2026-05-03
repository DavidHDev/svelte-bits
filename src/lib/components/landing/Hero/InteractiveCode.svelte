<script lang="ts">
	import EditableValue from './EditableValue.svelte';

	export type PropDef = {
		name: string;
		type: 'color' | 'number' | 'boolean';
		default: string | number | boolean;
		min?: number;
		max?: number;
		step?: number;
	};
	export type SnippetDef = {
		label: string;
		component: string;
		props: PropDef[];
	};
	type CodeSnippetDef = Omit<SnippetDef, 'label'>;

	interface Props {
		def: CodeSnippetDef;
		values: Record<string, string | number | boolean>;
		onChange: (name: string, value: string | number | boolean) => void;
	}

	let { def, values, onChange }: Props = $props();

	const importOpen = ' { ';
	const importClose = ' } ';
	const newline2 = '\n\n';
	const newlineReturn = '\n  ';
	const newlineComponent = '\n    ';
	const newline = '\n';
	const newlineProp = '\n      ';
	const openBrace = '{';
	const closeBrace = '}';
	const openTag = '<';
</script>

<pre class="ln-hero-code-pre"><code><span class="c-kw">import</span><span class="c-punc">{importOpen}</span><span class="c-comp">{def.component}</span><span class="c-punc">{importClose}</span><span class="c-kw">from</span><span class="c-str"> '@components/</span><span class="c-str">{def.component}</span><span class="c-str">';</span>{newline2}<span class="c-kw">function</span><span class="c-fn"> App</span><span class="c-punc">() {openBrace}</span>{newlineReturn}<span class="c-kw">return</span><span class="c-punc"> (</span>{newlineComponent}<span class="c-comp">{openTag}</span><span class="c-comp">{def.component}</span>{#each def.props as prop (prop.name)}{newlineProp}<span class="c-attr">{prop.name}</span><span class="c-punc">=</span>{#if prop.type === 'color'}<EditableValue
				type="color"
				value={values[prop.name]}
				onChange={(v) => onChange(prop.name, v)}
			/>{:else}<span class="c-punc">{openBrace}</span><EditableValue
				type={prop.type}
				value={values[prop.name]}
				onChange={(v) => onChange(prop.name, v)}
				min={prop.min}
				max={prop.max}
				step={prop.step}
			/><span class="c-punc">{closeBrace}</span>{/if}{/each}{newlineComponent}<span class="c-comp">/&gt;</span>{newlineReturn}<span class="c-punc">)</span>{newline}<span class="c-punc">{closeBrace}</span></code></pre>
