import { getContext, onDestroy, setContext } from 'svelte';

type Kind = 'customize' | 'props';

const KEY = Symbol('pro-slot');

class ProSlot {
	#claims = $state<{ id: number; kind: Kind }[]>([]);
	#next = 0;
	#category: () => string;

	constructor(category: () => string) {
		this.#category = category;
	}

	get category() {
		return this.#category();
	}

	get owner() {
		const winner = this.#claims.find((claim) => claim.kind === 'customize') ?? this.#claims[0];
		return winner?.id ?? null;
	}

	claim(kind: Kind) {
		const id = ++this.#next;
		this.#claims.push({ id, kind });
		return id;
	}

	release(id: number) {
		this.#claims = this.#claims.filter((claim) => claim.id !== id);
	}
}

export const setProSlot = (category: () => string) => setContext(KEY, new ProSlot(category));

export function useProSlot(kind: Kind) {
	const slot = getContext<ProSlot | undefined>(KEY);
	if (!slot) return null;
	const id = slot.claim(kind);
	onDestroy(() => slot.release(id));
	return {
		get owns() {
			return slot.owner === id;
		},
		get category() {
			return slot.category;
		}
	};
}
