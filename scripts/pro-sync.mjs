import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reactBits = resolve(root, process.argv[2] ?? '../react-bits');
const source = resolve(reactBits, 'src/constants/pro-summary.generated.json');
const target = resolve(root, 'src/lib/constants/pro-summary.generated.json');
const MEDIA_ORIGIN = 'https://reactbits.dev';
const MEDIA_PATH = /^\/(assets|rbp)\//;

const absolutize = (value) => {
	if (Array.isArray(value)) return value.map(absolutize);
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, absolutize(entry)]));
	}
	return typeof value === 'string' && MEDIA_PATH.test(value) ? `${MEDIA_ORIGIN}${value}` : value;
};

let raw;
try {
	raw = await readFile(source, 'utf8');
} catch {
	console.error(`Could not read ${source}. Pass the react-bits checkout path: npm run pro:sync -- <path>`);
	process.exit(1);
}

const summary = absolutize(JSON.parse(raw));
await writeFile(target, `${JSON.stringify(summary, null, '\t')}\n`);
console.log(`Synced ${target} from ${source}`);
