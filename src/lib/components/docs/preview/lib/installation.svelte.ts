import { jsrepoAddSnippet, shadcnAddSnippet, type PackageManager } from '$lib/constants/cli';

export type InstallMode = 'cli' | 'manual';
export type CliTool = 'shadcn' | 'jsrepo';

const read = <T extends string>(key: string, fallback: T): T => {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		return (localStorage.getItem(key) as T | null) || fallback;
	} catch {
		return fallback;
	}
};

const write = (key: string, value: string) => {
	try {
		localStorage.setItem(key, value);
	} catch {
		return;
	}
};

class InstallationState {
	#mode = $state<InstallMode>(read<InstallMode>('sb_install_mode', 'manual'));
	#tool = $state<CliTool>(read<CliTool>('sb_cli_tool', 'shadcn'));
	#pkg = $state<PackageManager>(read<PackageManager>('sb_pkg_manager', 'npm'));

	get installMode() {
		return this.#mode;
	}
	set installMode(value: InstallMode) {
		this.#mode = value;
		write('sb_install_mode', value);
	}

	get cliTool() {
		return this.#tool;
	}
	set cliTool(value: CliTool) {
		this.#tool = value;
		write('sb_cli_tool', value);
	}

	get packageManager() {
		return this.#pkg;
	}
	set packageManager(value: PackageManager) {
		this.#pkg = value;
		write('sb_pkg_manager', value);
	}
}

export const installation = new InstallationState();

const TYPE_DEPENDENCIES: Record<string, string> = {
	three: '@types/three',
	'matter-js': '@types/matter-js'
};

const INSTALL_COMMANDS: Record<PackageManager, string> = {
	pnpm: 'pnpm add',
	npm: 'npm install',
	yarn: 'yarn add',
	bun: 'bun add'
};

export const getTypeDependencies = (dependencies: string[]) =>
	[
		...new Set(
			dependencies
				.map((dependency) => {
					const specifier = dependency.replace(/@[^/@]+$/, '');
					const name = specifier
						.split('/')
						.slice(0, specifier.startsWith('@') ? 2 : 1)
						.join('/');
					return TYPE_DEPENDENCIES[name];
				})
				.filter(Boolean)
		)
	].sort();

export const generateDependencyCommands = (dependencies: string[]): Record<PackageManager, string> | null => {
	const list = dependencies.map((d) => d.trim()).filter(Boolean);
	if (!list.length) return null;
	const typeDependencies = getTypeDependencies(list);
	return Object.fromEntries(
		Object.entries(INSTALL_COMMANDS).map(([manager, command]) => [
			manager,
			`${command} ${list.join(' ')}${typeDependencies.length ? ` && ${command} -D ${typeDependencies.join(' ')}` : ''}`
		])
	) as Record<PackageManager, string>;
};

export const cliCommandFor = (slug: string, tool: CliTool, pkg: PackageManager) =>
	tool === 'jsrepo' ? jsrepoAddSnippet(slug, pkg) : shadcnAddSnippet(slug, pkg);
