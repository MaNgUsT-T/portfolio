import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const bundles = [
    {
        entry: path.join(repoRoot, 'assets/js/app.js'),
        output: path.join(repoRoot, 'js/app.min.js'),
    },
    {
        entry: path.join(repoRoot, 'assets/js/admin.js'),
        output: path.join(repoRoot, 'js/admin.min.js'),
    },
    {
        entry: path.join(repoRoot, 'assets/js/siteelements.js'),
        output: path.join(repoRoot, 'js/siteelements.min.js'),
    },
];

const visited = new Set();

function normalizeImportPath(importPath, parentFile) {
    if (!importPath.startsWith('.')) {
        throw new Error(`Externe Imports werden nicht unterstützt: ${importPath} in ${parentFile}`);
    }

    return path.resolve(path.dirname(parentFile), importPath);
}

function stripModuleSyntax(source) {
    return source
        .replace(/^\s*import\s+[^;]+;\s*$/gm, '')
        .replace(/^\s*export\s*\{[^}]+\};\s*$/gm, '')
        .replace(/^\s*export\s+(async\s+function\s+)/gm, '$1')
        .replace(/^\s*export\s+(function\s+)/gm, '$1')
        .replace(/^\s*export\s+(const\s+)/gm, '$1')
        .replace(/^\s*export\s+(let\s+)/gm, '$1')
        .replace(/^\s*export\s+(class\s+)/gm, '$1');
}

async function collectModule(filePath, orderedModules) {
    const normalizedPath = path.resolve(filePath);

    if (visited.has(normalizedPath)) {
        return;
    }

    visited.add(normalizedPath);

    const source = await readFile(normalizedPath, 'utf8');
    const importStatements = source.matchAll(/^\s*import\s+(?:[^'"]+from\s+)?['"]([^'"]+)['"];\s*$/gm);

    for (const statement of importStatements) {
        await collectModule(normalizeImportPath(statement[1], normalizedPath), orderedModules);
    }

    orderedModules.push({
        filePath: normalizedPath,
        source: stripModuleSyntax(source).trim(),
    });
}

async function buildBundle(entry, output) {
    visited.clear();
    const orderedModules = [];

    await collectModule(entry, orderedModules);

    const bundleSource = [
        '(() => {',
        ...orderedModules.map((module) => {
            const relativePath = path.relative(repoRoot, module.filePath);

            return `// ${relativePath}\n${module.source}`;
        }),
        '})();',
        '',
    ].join('\n\n');

    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, bundleSource, 'utf8');
}

for (const bundle of bundles) {
    await buildBundle(bundle.entry, bundle.output);
}
