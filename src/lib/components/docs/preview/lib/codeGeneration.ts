export function formatPropValue(value: unknown, propName: string): string | null {
	if (value === undefined || value === null) return null;
	const type = typeof value;
	if (type === 'string') return `"${value}"`;
	if (type === 'number') return `{${value}}`;
	if (type === 'boolean') return value ? '' : `{${value}}`;
	if (type === 'function') {
		const name = (value as { name?: string }).name;
		if (name && name !== 'anonymous') return `{${name}}`;
		return `{handle${propName.charAt(0).toUpperCase() + propName.slice(1)}}`;
	}
	if (Array.isArray(value)) return `{${JSON.stringify(value)}}`;
	if (type === 'object') return `{${JSON.stringify(value)}}`;
	return `{${String(value)}}`;
}

function openingTagEnd(code: string, start: number): number {
	let depth = 0;
	let quote = '';
	for (let i = start + 1; i < code.length; i++) {
		const char = code[i];
		if (quote) {
			if (char === quote) quote = '';
			continue;
		}
		if (depth === 0 && (char === '"' || char === "'")) quote = char;
		else if (char === '{') depth++;
		else if (char === '}') depth--;
		else if (char === '>' && depth === 0) return code[i - 1] === '/' ? i - 1 : i;
	}
	return -1;
}

export function injectPropsIntoCode(
	usageCode: string,
	props: Record<string, unknown>,
	defaultProps: Record<string, unknown>,
	componentName: string,
	demoOnlyProps: string[] = []
): string {
	if (!usageCode || !props || !componentName) return usageCode;

	const demoOnlySet = new Set(demoOnlyProps);
	const changedProps: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(props)) {
		if (demoOnlySet.has(key)) continue;
		if (JSON.stringify(value) !== JSON.stringify(defaultProps[key])) changedProps[key] = value;
	}

	if (Object.keys(changedProps).length === 0) return usageCode;

	let result = usageCode;
	const propsToAdd: string[] = [];

	for (const [propName, propValue] of Object.entries(changedProps)) {
		const formattedValue = formatPropValue(propValue, propName);
		const newPropLine =
			typeof propValue === 'boolean' && propValue === true ? propName : `${propName}=${formattedValue}`;

		const simplePropRegex = new RegExp(
			`(^[ \\t]*)(${propName})(?:=(?:"[^"\\n]*"|'[^'\\n]*'|\\{[^{}\\n]*\\}|[^\\s/>{"']+))?[ \\t]*(\\r?\\n|$)`,
			'gm'
		);

		const hasSimpleMatch = simplePropRegex.test(result);
		simplePropRegex.lastIndex = 0;

		if (hasSimpleMatch) {
			let seen = false;
			result = result.replace(simplePropRegex, (_match, indent, _name, lineEnding) => {
				if (seen) return '';
				seen = true;
				return `${indent}${newPropLine}${lineEnding}`;
			});
			continue;
		}

		const multiLineStart = new RegExp(`^([ \\t]*)(${propName})=\\{`, 'gm');
		let match: RegExpExecArray | null;
		let updated = false;

		while ((match = multiLineStart.exec(result)) !== null) {
			const indent = match[1];
			const startIndex = match.index;
			const openBraceIndex = match.index + match[0].length - 1;

			let braceCount = 1;
			let i = openBraceIndex + 1;
			while (i < result.length && braceCount > 0) {
				if (result[i] === '{') braceCount++;
				else if (result[i] === '}') braceCount--;
				i++;
			}

			if (braceCount === 0) {
				result = result.slice(0, startIndex) + indent + newPropLine + result.slice(i);
				updated = true;
				break;
			}
		}

		if (!updated) {
			const inlineRegex = new RegExp(`(\\s)${propName}=(?:"[^"\\n]*"|'[^'\\n]*'|\\{[^{}\\n]*\\})(?=[\\s/>])`);
			if (inlineRegex.test(result)) {
				result = result.replace(inlineRegex, (_match, space) => `${space}${newPropLine}`);
				updated = true;
			}
		}

		if (!updated) propsToAdd.push(newPropLine);
	}

	if (propsToAdd.length > 0) {
		const tagIndex = result.search(new RegExp(`<${componentName}[\\s/>]`));
		const tagLineStart = tagIndex === -1 ? -1 : result.lastIndexOf('\n', tagIndex) + 1;
		const tagIndent = tagIndex === -1 ? '' : (result.slice(tagLineStart, tagIndex).match(/^[ \t]*/)?.[0] ?? '');
		const tail = tagIndex === -1 ? result : result.slice(tagIndex);
		const indentMatch = tail.match(/\n([ \t]+)\w/);
		const indent = indentMatch ? indentMatch[1] : `${tagIndent}  `;
		const newPropsStr = propsToAdd.map((p) => `${indent}${p}`).join('\n');
		const closingIndex = tagIndex === -1 ? result.lastIndexOf('/>') : openingTagEnd(result, tagIndex);
		if (closingIndex !== -1) {
			const before = result.slice(0, closingIndex);
			const after = result.slice(closingIndex);
			result = before.trimEnd() + '\n' + newPropsStr + '\n' + tagIndent + after;
		}
	}

	return result;
}
