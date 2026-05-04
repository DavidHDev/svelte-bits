declare global {
	namespace App {

	}
}

declare module '*.svelte' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

declare module '*.svelte?raw' {
	const content: string;
	export default content;
}

export {};
