import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildDir = join(__dirname, '..', 'build', '_app', 'immutable');

// Function to recursively get all JS files
function getAllJsFiles(dir, fileList = []) {
	if (!existsSync(dir)) return fileList;
	
	const files = readdirSync(dir);
	
	files.forEach(file => {
		const filePath = join(dir, file);
		const stat = statSync(filePath);
		
		if (stat.isDirectory()) {
			getAllJsFiles(filePath, fileList);
		} else if (file.endsWith('.js') && !file.endsWith('bundle.js')) {
			fileList.push(filePath);
		}
	});
	
	return fileList;
}

// Create a map of file paths to their content
function createFileMap() {
	const jsFiles = getAllJsFiles(buildDir);
	const fileMap = new Map();
	
	jsFiles.forEach(file => {
		const content = readFileSync(file, 'utf-8');
		// Store both absolute and relative paths
		const relativePath = file.replace(buildDir, '').replace(/\\/g, '/').replace(/^\//, '');
		const relativePathNoExt = relativePath.replace(/\.js$/, '');
		
		fileMap.set(relativePath, content);
		fileMap.set(relativePathNoExt, content);
		fileMap.set(`./${relativePath}`, content);
		fileMap.set(`./${relativePathNoExt}`, content);
		fileMap.set(`../${relativePath}`, content);
		fileMap.set(`../${relativePathNoExt}`, content);
		
		// Also map just the filename
		const filename = file.split(/[/\\]/).pop();
		const filenameNoExt = filename.replace(/\.js$/, '');
		fileMap.set(`./${filename}`, content);
		fileMap.set(`./${filenameNoExt}`, content);
	});
	
	return fileMap;
}

// Resolve import path to actual file path
function resolveImportPath(importPath, fromFile) {
	// Remove quotes
	importPath = importPath.replace(/['"]/g, '');
	
	// Already in map?
	if (importPath.startsWith('./') || importPath.startsWith('../')) {
		const fromDir = dirname(fromFile.replace(buildDir, '').replace(/\\/g, '/'));
		const resolved = normalize(join(fromDir, importPath)).replace(/\\/g, '/').replace(/^\//, '');
		return resolved;
	}
	
	return importPath;
}

// Extract exports from a module
function extractExports(content) {
	const exports = new Map();
	
	// Match: export { ... } or export { ... as ... }
	const namedExports = content.match(/export\s+{([^}]+)}/g);
	if (namedExports) {
		namedExports.forEach(exp => {
			const matches = exp.match(/(\w+)(?:\s+as\s+(\w+))?/g);
			if (matches) {
				matches.forEach(match => {
					const parts = match.trim().split(/\s+as\s+/);
					const original = parts[0].trim();
					const alias = parts[1]?.trim() || original;
					exports.set(alias, original);
				});
			}
		});
	}
	
	// Match: export default ...
	const defaultExport = content.match(/export\s+default\s+/);
	if (defaultExport) {
		exports.set('default', 'default');
	}
	
	// Match: export function/const/let/var/class
	const directExports = content.match(/export\s+(?:function|const|let|var|class|async\s+function)\s+(\w+)/g);
	if (directExports) {
		directExports.forEach(exp => {
			const match = exp.match(/(?:function|const|let|var|class|async\s+function)\s+(\w+)/);
			if (match) {
				exports.set(match[1], match[1]);
			}
		});
	}
	
	return exports;
}

// Replace imports with actual code (simplified - just inline everything)
function resolveImports(content, fileMap, fromFile, visited = new Set()) {
	const relativePath = fromFile.replace(buildDir, '').replace(/\\/g, '/').replace(/^\//, '');
	
	if (visited.has(relativePath)) {
		return ''; // Prevent circular dependencies
	}
	visited.add(relativePath);
	
	// Match import statements
	const importRegex = /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+)|(?:\w+\s*,\s*\{[^}]*\}))\s+from\s+['"]([^'"]+)['"];?/g;
	
	let resolved = content;
	let match;
	
	while ((match = importRegex.exec(content)) !== null) {
		const fullMatch = match[0];
		const importPath = match[1];
		
		const resolvedPath = resolveImportPath(importPath, fromFile);
		const importedContent = fileMap.get(resolvedPath) || fileMap.get(resolvedPath + '.js');
		
		if (importedContent) {
			// Recursively resolve imports in the imported file
			const resolvedImported = resolveImports(importedContent, fileMap, join(buildDir, resolvedPath), new Set(visited));
			
			// For now, just remove the import - we'll inline everything
			// This is a simplified approach - a full implementation would need to handle exports properly
			resolved = resolved.replace(fullMatch, `\n// Import resolved: ${importPath}\n`);
		} else {
			console.warn(`⚠️  Could not resolve import: ${importPath} from ${relativePath}`);
		}
	}
	
	return resolved;
}

// Simple approach: Create a module system
function createModuleSystem(fileMap) {
	// Sort files: chunks first, then entry, then nodes
	const allFiles = Array.from(fileMap.entries())
		.filter(([path]) => !path.includes('bundle.js'))
		.sort(([a], [b]) => {
			if (a.includes('/chunks/') && !b.includes('/chunks/')) return -1;
			if (!a.includes('/chunks/') && b.includes('/chunks/')) return 1;
			if (a.includes('/entry/') && !b.includes('/entry/')) return -1;
			if (!a.includes('/entry/') && b.includes('/entry/')) return 1;
			return a.localeCompare(b);
		});
	
	// Create a module registry
	let bundle = `(function() {
	const modules = {};
	const cache = {};
	
	function require(path) {
		if (cache[path]) return cache[path].exports;
		const module = { exports: {} };
		cache[path] = module;
		
		if (modules[path]) {
			modules[path](module, module.exports, require);
		}
		return module.exports;
	}
	
	// Define modules
`;
	
	allFiles.forEach(([path, content]) => {
		// Clean up the content - remove imports (we'll handle them separately)
		let cleanContent = content;
		
		// Remove import statements for now
		cleanContent = cleanContent.replace(/import\s+[^'"]+from\s+['"][^'"]+['"];?/g, '');
		
		// Wrap in module function
		bundle += `\n	modules['${path}'] = function(module, exports, require) {\n`;
		bundle += cleanContent.split('\n').map(line => `		${line}`).join('\n');
		bundle += `\n	};\n`;
	});
	
	// Find and execute entry point
	const entryFile = allFiles.find(([path]) => path.includes('/entry/start.'));
	if (entryFile) {
		bundle += `\n	// Execute entry point\n`;
		bundle += `	require('${entryFile[0]}');\n`;
	}
	
	bundle += `})();`;
	
	return bundle;
}

// Main function
function main() {
	console.log('📦 Creating resolved bundle...');
	
	const fileMap = createFileMap();
	console.log(`✓ Found ${fileMap.size / 6} JS files (with path variations)`);
	
	// For airTRFX, we need a simple approach
	// Option 1: Keep files and fix paths (simplest)
	// Option 2: Create IIFE bundle
	
	// Let's try creating a simple concatenated bundle with a module shim
	const bundle = createModuleSystem(fileMap);
	
	const outputFile = join(buildDir, 'bundle.js');
	writeFileSync(outputFile, bundle, 'utf-8');
	console.log(`✓ Created bundle.js`);
	
	// Update index.html
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Remove modulepreload links
	indexContent = indexContent.replace(/<link rel="modulepreload" href="\.\/_app\/immutable\/[^"]+\.js"[^>]*>/g, '');
	
	// Replace script - use regular script, not module
	indexContent = indexContent.replace(
		/<script[^>]*type="module"[^>]*src="[^"]*"[^>]*><\/script>/,
		`<script src="./_app/immutable/bundle.js"></script>`
	);
	
	indexContent = indexContent.replace(
		/<script[^>]*src="\.\/_app\/immutable\/[^"]+\.js"[^>]*><\/script>/,
		`<script src="./_app/immutable/bundle.js"></script>`
	);
	
	writeFileSync(indexPath, indexContent, 'utf-8');
	console.log(`✓ Updated index.html`);
	
	// Don't delete files - they might be needed for reference
	console.log(`ℹ️  Original files kept for reference`);
}

main();
