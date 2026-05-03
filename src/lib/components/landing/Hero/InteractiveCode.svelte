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

	interface Props {
		def: SnippetDef;
		values: Record<string, string | number | boolean>;
		onChange: (name: string, value: string | number | boolean) => void;
	}

	let { def, values, onChange }: Props = $props();
</script>

<pre class="ln-hero-code-pre"><code><span class="c-kw">import</span><span class="c-punc">{' { '}</span><span class="c-comp">{def.component}</span><span class="c-punc">{' } '}</span><span class="c-kw">from</span><span class="c-str"> {`'@components/`}</span><span class="c-str">{def.component}</span><span class="c-str">{`';`}</span>{'\n\n'}<span class="c-kw">function</span><span class="c-fn"> App</span><span class="c-punc">() {'{'}</span>{'\n  '}<span class="c-kw">return</span><span class="c-punc"> (</span>{'\n    '}<span class="c-comp">{'<'}</span><span class="c-comp">{def.component}</span>{#each def.props as prop (prop.name)}{'\n      '}<span class="c-attr">{prop.name}</span><span class="c-punc">=</span>{#if prop.type === 'color'}<EditableValue
				type="color"
				value={values[prop.name]}
				onChange={(v) => onChange(prop.name, v)}
			/>{:else}<span class="c-punc">{'{'}</span><EditableValue
				type={prop.type}
				value={values[prop.name]}
				onChange={(v) => onChange(prop.name, v)}
				min={prop.min}
				max={prop.max}
				step={prop.step}
			/><span class="c-punc">{'}'}</span>{/if}{/each}{'\n    '}<span class="c-comp">/{'>'}</span>{'\n  '}<span class="c-punc">)</span>{'\n'}<span class="c-punc">{'}'}</span></code></pre>
