import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildDir = join(__dirname, '..', 'build', '_app', 'immutable');
const sourceDir = join(__dirname, '..', '.svelte-kit', 'output', 'client', '_app', 'immutable');

// Copy all necessary files from source to build
function copyNecessaryFiles() {
	if (!existsSync(sourceDir)) {
		console.error(`❌ Source directory not found: ${sourceDir}`);
		return false;
	}
	
	console.log('📋 Copying necessary files...');
	
	// Copy chunks directory
	const sourceChunks = join(sourceDir, 'chunks');
	const buildChunks = join(buildDir, 'chunks');
	
	if (existsSync(sourceChunks)) {
		if (!existsSync(buildChunks)) {
			mkdirSync(buildChunks, { recursive: true });
		}
		
		const chunkFiles = readdirSync(sourceChunks);
		chunkFiles.forEach(file => {
			if (file.endsWith('.js')) {
				copyFileSync(
					join(sourceChunks, file),
					join(buildChunks, file)
				);
				console.log(`  ✓ Copied chunks/${file}`);
			}
		});
	}
	
	// Copy entry directory
	const sourceEntry = join(sourceDir, 'entry');
	const buildEntry = join(buildDir, 'entry');
	
	if (existsSync(sourceEntry)) {
		if (!existsSync(buildEntry)) {
			mkdirSync(buildEntry, { recursive: true });
		}
		
		const entryFiles = readdirSync(sourceEntry);
		entryFiles.forEach(file => {
			if (file.endsWith('.js')) {
				copyFileSync(
					join(sourceEntry, file),
					join(buildEntry, file)
				);
				console.log(`  ✓ Copied entry/${file}`);
			}
		});
	}
	
	// Copy nodes directory
	const sourceNodes = join(sourceDir, 'nodes');
	const buildNodes = join(buildDir, 'nodes');
	
	if (existsSync(sourceNodes)) {
		if (!existsSync(buildNodes)) {
			mkdirSync(buildNodes, { recursive: true });
		}
		
		const nodeFiles = readdirSync(sourceNodes);
		nodeFiles.forEach(file => {
			if (file.endsWith('.js')) {
				copyFileSync(
					join(sourceNodes, file),
					join(buildNodes, file)
				);
				console.log(`  ✓ Copied nodes/${file}`);
			}
		});
	}
	
	return true;
}

// Create a simple loader that works with ES modules in airTRFX
function createESModuleLoader() {
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Find the entry script
	const scriptMatch = indexContent.match(/<script[^>]*src="([^"]+)"[^>]*>/);
	if (!scriptMatch) {
		console.error('❌ Could not find script tag');
		return false;
	}
	
	const entryPath = scriptMatch[1];
	
	// Create a loader script that handles ES modules
	const loaderScript = `// ES Module Loader for airTRFX
(function() {
	// Polyfill for dynamic import if needed
	if (!window.importShim) {
		window.importShim = function(url) {
			return import(url);
		};
	}
	
	// Load the entry module
	const script = document.createElement('script');
	script.type = 'module';
	script.src = '${entryPath}';
	document.head.appendChild(script);
})();`;
	
	const loaderFile = join(buildDir, 'loader.js');
	writeFileSync(loaderFile, loaderScript, 'utf-8');
	
	// Update HTML to use loader instead
	indexContent = indexContent.replace(
		/<script[^>]*src="[^"]*"[^>]*><\/script>/,
		`<script src="./_app/immutable/loader.js"></script>`
	);
	
	writeFileSync(indexPath, indexContent, 'utf-8');
	console.log('✓ Created ES module loader');
	
	return true;
}

// Alternative: Create a single bundled file using a simple concatenation
// that preserves the module structure
async function createBundledLoader() {
	// Read all chunk files and create a module map
	const chunksDir = join(buildDir, 'chunks');
	const entryDir = join(buildDir, 'entry');
	
	if (!existsSync(chunksDir) || !existsSync(entryDir)) {
		console.error('❌ Required directories not found');
		return false;
	}
	
	const chunkFiles = readdirSync(chunksDir).filter(f => f.endsWith('.js'));
	const entryFiles = readdirSync(entryDir).filter(f => f.endsWith('.js'));
	
	// Create a module registry
	let bundle = `// Bundled modules for airTRFX
(function() {
	const __modules = {};
	const __cache = {};
	
	function __require(path) {
		if (__cache[path]) return __cache[path].exports;
		const module = { exports: {} };
		__cache[path] = module;
		if (__modules[path]) {
			__modules[path](module, module.exports, __require);
		}
		return module.exports;
	}
	
	// Register chunk modules
`;
	
	// Add chunks
	chunkFiles.forEach(file => {
		const content = readFileSync(join(chunksDir, file), 'utf-8');
		const modulePath = `./chunks/${file}`;
		bundle += `	__modules['${modulePath}'] = function(module, exports, require) {\n`;
		// Remove export statements and convert to module.exports
		let modContent = content
			.replace(/export\s+default\s+/g, 'module.exports = ')
			.replace(/export\s+{([^}]+)}/g, (match, exports) => {
				const items = exports.split(',').map(e => e.trim());
				return items.map(item => {
					const [name, alias] = item.split(/\s+as\s+/).map(s => s.trim());
					return `module.exports.${alias || name} = ${name};`;
				}).join('\n');
			})
			.replace(/export\s+(?:function|const|let|var|class|async\s+function)\s+(\w+)/g, 'module.exports.$1 = $1');
		
		bundle += modContent.split('\n').map(line => `		${line}`).join('\n');
		bundle += `\n	};\n\n`;
	});
	
	// Find and execute entry
	const startFile = entryFiles.find(f => f.startsWith('start.'));
	if (startFile) {
		const entryContent = readFileSync(join(entryDir, startFile), 'utf-8');
		bundle += `	// Entry point\n`;
		bundle += `	(function() {\n`;
		bundle += entryContent.split('\n').map(line => `		${line}`).join('\n');
		bundle += `\n	})();\n`;
	}
	
	bundle += `})();\n`;
	
	const bundleFile = join(buildDir, 'bundle.js');
	writeFileSync(bundleFile, bundle, 'utf-8');
	
	// Update HTML - inline all JavaScript files
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Function to create a single IIFE bundle using esbuild
	async function inlineJavaScriptFiles() {
		console.log('📦 Creating single IIFE bundle with esbuild...');
		
		// Find entry file
		const entryDir = join(buildDir, 'entry');
		let startFile = null;
		let appFile = null;
		
		if (existsSync(entryDir)) {
			const entryFiles = readdirSync(entryDir).filter(f => f.endsWith('.js'));
			startFile = entryFiles.find(f => f.startsWith('start.'));
			appFile = entryFiles.find(f => f.startsWith('app.'));
		}
		
		if (!startFile || !appFile) {
			console.error('❌ Could not find entry files');
			return { success: false };
		}
		
		const startPath = join(entryDir, startFile);
		const appPath = join(entryDir, appFile);
		
		// Extract SvelteKit global and initialization data
		const sveltekitGlobalMatch = indexContent.match(/__sveltekit_(\w+)\s*=/);
		const sveltekitGlobal = sveltekitGlobalMatch ? `__sveltekit_${sveltekitGlobalMatch[1]}` : '__sveltekit_1edaafx';
		const nodeIdsMatch = indexContent.match(/node_ids:\s*\[([^\]]+)\]/);
		const dataMatch = indexContent.match(/data:\s*\[([^\]]+)\]/);
		const nodeIds = nodeIdsMatch ? nodeIdsMatch[1] : '0,2';
		const data = dataMatch ? dataMatch[1] : 'null,null';
		
		// Create a temporary entry file that imports both start and app
		const tempEntryPath = join(buildDir, '__temp_entry.js');
		const tempEntryContent = `
		import * as kit from './entry/${startFile}';
		import * as app from './entry/${appFile}';
		
		// Store in global for initialization
		window.__sveltekit_temp_kit = kit;
		window.__sveltekit_temp_app = app;
		`;
		writeFileSync(tempEntryPath, tempEntryContent, 'utf-8');
		
		let bundledCode = '';
		
		// Use esbuild to bundle
		let esbuild = null;
		try {
			const esbuildModule = await import('esbuild');
			esbuild = esbuildModule.default || esbuildModule;
		} catch (e) {
			console.error('❌ esbuild not available');
			// Clean up temp file
			if (existsSync(tempEntryPath)) {
				unlinkSync(tempEntryPath);
			}
			return { success: false };
		}
		
		if (esbuild) {
			console.log('  Bundling with esbuild...');
			try {
				const result = await esbuild.build({
					entryPoints: [tempEntryPath],
					bundle: true,
					format: 'iife',
					globalName: 'SvelteKitBundle',
					write: false,
					platform: 'browser',
					target: 'es2020',
					resolveExtensions: ['.js', '.mjs'],
					absWorkingDir: buildDir,
					define: {
						'import.meta.url': '""',
						'import.meta': '{}'
					},
					// Try to include all dependencies
					external: []
				});
				
				if (result.outputFiles && result.outputFiles.length > 0) {
					bundledCode = result.outputFiles[0].text;
					console.log('  ✓ Bundled successfully');
				}
			} catch (err) {
				console.error('  ❌ esbuild bundling failed:', err.message);
				// Clean up temp file
				if (existsSync(tempEntryPath)) {
					unlinkSync(tempEntryPath);
				}
				return { success: false };
			}
		}
		
		// Clean up temp file
		if (existsSync(tempEntryPath)) {
			unlinkSync(tempEntryPath);
		}
		
		if (!bundledCode) {
			return { success: false };
		}
		
		// Wrap the bundle and add initialization
		// The initialization code needs to run AFTER the bundle IIFE completes
		// So we'll add it right after the bundled code
		const finalCode = `
		// Set up SvelteKit global
		window.${sveltekitGlobal} = {
			base: new URL(".", location).pathname.slice(0, -1)
		};
		
		${bundledCode}
		
		// Debug: Check if variables are available immediately after bundle
		console.log('🔍 Bundle completed. Checking for kit and app...');
		console.log('__sveltekit_temp_kit:', window.__sveltekit_temp_kit);
		console.log('__sveltekit_temp_app:', window.__sveltekit_temp_app);
		
		// Initialize app immediately after bundle loads
		// Use requestAnimationFrame to ensure DOM is ready
		(function initSvelteKitApp() {
			function tryInit() {
				try {
					// Get kit and app from the bundle
					const kit = window.__sveltekit_temp_kit;
					const app = window.__sveltekit_temp_app;
					
					if (!kit) {
						console.error('❌ Could not find kit in bundle');
						console.log('Available globals:', Object.keys(window).filter(k => k.includes('sveltekit')));
						// Retry after a short delay
						setTimeout(tryInit, 100);
						return;
					}
					
					if (!app) {
						console.error('❌ Could not find app in bundle');
						setTimeout(tryInit, 100);
						return;
					}
					
					if (!kit.start) {
						console.error('❌ kit.start is not a function', kit);
						console.log('kit object:', kit);
						return;
					}
					
					const element = document.body.querySelector('div[style*="display: contents"]') || document.body;
					
					console.log('🚀 Initializing SvelteKit app...');
					console.log('kit:', kit);
					console.log('app:', app);
					console.log('element:', element);
					
					kit.start(app, element, {
						node_ids: [${nodeIds}],
						data: [${data}],
						form: null,
						error: null
					});
					console.log('✅ SvelteKit app initialized');
				} catch (err) {
					console.error('❌ Error initializing app:', err);
					console.error(err.stack);
				}
			}
			
			// Wait for DOM to be ready, then try to initialize
			// Give the bundle a moment to complete execution
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', () => {
					setTimeout(tryInit, 50);
				});
			} else {
				// DOM already ready, wait a bit for bundle to complete
				setTimeout(tryInit, 50);
			}
		})();
		`;
		
		// Escape script tags
		const escapedCode = finalCode.replace(/<\/script>/g, '<\\/script>');
		const inlineScript = `<script>${escapedCode}</script>`;
		
		// Find and replace script section
		const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/;
		indexContent = indexContent.replace(scriptPattern, inlineScript);
		
		// Remove modulepreload links
		indexContent = indexContent.replace(/<link rel="modulepreload"[^>]*>/g, '');
		
		return { success: true, startFile, appFile };
	}
	
	// Replace the dynamic import script with a simple script tag
	// Find the script that uses Promise.all and import()
	const dynamicImportPattern = /<script[^>]*>[\s\S]*?Promise\.all\([\s\S]*?import\([^)]+\)[\s\S]*?<\/script>/;
	
	// Try inlining first
	const inlineResult = await inlineJavaScriptFiles();
		if (inlineResult.success) {
			writeFileSync(indexPath, indexContent, 'utf-8');
			console.log(`✓ Inlined JavaScript files`);
			console.log(`  - Entry files: ${inlineResult.startFile}, ${inlineResult.appFile}`);
			return true;
		}
	
	if (dynamicImportPattern.test(indexContent)) {
		// Extract the entry paths and chunk paths from modulepreload links
		const modulepreloadMatches = Array.from(indexContent.matchAll(/<link rel="modulepreload" href="\.\/_app\/immutable\/([^"]+)"[^>]*>/g));
		const chunks = [];
		let startFile = null;
		let appFile = null;
		
		console.log(`  Found ${modulepreloadMatches.length} modulepreload links`);
		
		for (const match of modulepreloadMatches) {
			const path = match[1];
			if (path.includes('/chunks/')) {
				chunks.push(`"./_app/immutable/${path}"`);
			} else if (path.includes('/entry/start.')) {
				startFile = path.split('/').pop();
			} else if (path.includes('/entry/app.')) {
				appFile = path.split('/').pop();
			}
		}
		
		console.log(`  Extracted ${chunks.length} chunks, start: ${startFile}, app: ${appFile}`);
		
		// Fallback: If chunks not found in HTML, read from filesystem
		if (chunks.length === 0) {
			console.log('  ⚠️  No chunks found in HTML, reading from filesystem...');
			const chunksDir = join(buildDir, 'chunks');
			if (existsSync(chunksDir)) {
				const chunkFiles = readdirSync(chunksDir).filter(f => f.endsWith('.js'));
				chunkFiles.forEach(file => {
					chunks.push(`"./_app/immutable/chunks/${file}"`);
				});
				console.log(`  Found ${chunks.length} chunks in filesystem`);
			}
		}
		
		// Also try to extract from import statements
		if (!startFile) {
			const startMatch = indexContent.match(/import\("\.\/_app\/immutable\/entry\/start\.([^"]+)"\)/);
			if (startMatch) startFile = `start.${startMatch[1]}`;
		}
		if (!appFile) {
			const appMatch = indexContent.match(/import\("\.\/_app\/immutable\/entry\/app\.([^"]+)"\)/);
			if (appMatch) appFile = `app.${appMatch[1]}`;
		}
		
		// Fallback: If entry files not found, read from filesystem
		if (!startFile || !appFile) {
			const entryDir = join(buildDir, 'entry');
			if (existsSync(entryDir)) {
				const entryFiles = readdirSync(entryDir).filter(f => f.endsWith('.js'));
				if (!startFile) {
					const start = entryFiles.find(f => f.startsWith('start.'));
					if (start) startFile = start;
				}
				if (!appFile) {
					const app = entryFiles.find(f => f.startsWith('app.'));
					if (app) appFile = app;
				}
			}
		}
		
		const nodeIdsMatch = indexContent.match(/node_ids:\s*\[([^\]]+)\]/);
		const dataMatch = indexContent.match(/data:\s*\[([^\]]+)\]/);
		
		if (startFile && appFile) {
			const nodeIds = nodeIdsMatch ? nodeIdsMatch[1] : '0,2';
			const data = dataMatch ? dataMatch[1] : 'null,null';
			
			// Extract SvelteKit global variable name from the original script
			const sveltekitGlobalMatch = indexContent.match(/__sveltekit_(\w+)\s*=/);
			const sveltekitGlobal = sveltekitGlobalMatch ? `__sveltekit_${sveltekitGlobalMatch[1]}` : '__sveltekit_1edaafx';
			
			// Sort chunks: sCIM5R7d.js first, then others
			const mainChunk = chunks.find(c => c.includes('sCIM5R7d.js'));
			const otherChunks = chunks.filter(c => !c.includes('sCIM5R7d.js'));
			
			// Build scripts array with proper ordering
			const scriptsArray = [];
			if (mainChunk) scriptsArray.push(mainChunk);
			scriptsArray.push(...otherChunks);
			scriptsArray.push(`"./_app/immutable/entry/${startFile}"`);
			scriptsArray.push(`"./_app/immutable/entry/${appFile}"`);
			
			// Create a simple loader that uses script tags instead of dynamic imports
			const loaderScript = `<script>
			(function() {
				// Set up SvelteKit global
				window.${sveltekitGlobal} = {
					base: new URL(".", location).pathname.slice(0, -1)
				};
				
				// Load scripts sequentially
				const scripts = [
					${scriptsArray.join(',\n\t\t\t\t\t')}
				];
					
					function loadScript(src, callback) {
						const script = document.createElement('script');
						script.type = 'module';
						script.src = src;
						script.onload = callback;
						script.onerror = function() {
							console.error('Failed to load:', src);
							callback();
						};
						document.head.appendChild(script);
					}
					
					function loadAll() {
						let index = 0;
						function next() {
							if (index < scripts.length) {
								loadScript(scripts[index], function() {
									index++;
									next();
								});
							} else {
								// All scripts loaded, initialize app
								const element = document.currentScript.parentElement;
								import("./_app/immutable/entry/${startFile}").then(kit => {
									import("./_app/immutable/entry/${appFile}").then(app => {
										kit.start(app, element, {
											node_ids: [${nodeIds}],
											data: [${data}],
											form: null,
											error: null
										});
									});
								});
							}
						}
						next();
					}
					
					loadAll();
				})();
			</script>`;
			
			// Replace the dynamic import script
			indexContent = indexContent.replace(dynamicImportPattern, loaderScript);
			writeFileSync(indexPath, indexContent, 'utf-8');
			console.log(`✓ Replaced dynamic imports with sequential script loader`);
			console.log(`  - Found ${chunks.length} chunk files`);
			console.log(`  - Entry files: ${startFile}, ${appFile}`);
		} else {
			console.warn('⚠️  Could not extract entry paths, keeping original script');
			if (!startFile) console.warn('  - Missing start.js file');
			if (!appFile) console.warn('  - Missing app.js file');
		}
	} else {
		// No dynamic imports found, just ensure type="module" is removed
		indexContent = indexContent.replace(/type="module"/g, '');
		writeFileSync(indexPath, indexContent, 'utf-8');
		console.log('✓ Removed type="module" from scripts');
	}
	
	return true;
}

// Main
async function main() {
	console.log('🔧 Setting up bundle for airTRFX...\n');
	
	// Step 1: Copy necessary files
	if (!copyNecessaryFiles()) {
		console.error('❌ Failed to copy necessary files');
		process.exit(1);
	}
	
	// Step 2: Try to create bundled loader
	if (await createBundledLoader()) {
		console.log('\n✓ Bundle created successfully!');
		console.log('ℹ️  JavaScript files have been inlined into index.html');
	} else {
		console.log('\n⚠️  Falling back to ES module loader...');
		createESModuleLoader();
	}
}

main().catch(err => {
	console.error('❌ Error:', err);
	process.exit(1);
});
