import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildDir = join(__dirname, '..', 'build', '_app', 'immutable');

async function createIIFEBundle() {
	const entryDir = join(buildDir, 'entry');
	if (!existsSync(entryDir)) {
		console.error('❌ Entry directory not found');
		return false;
	}
	
	// Find the start.js file
	const { readdirSync } = await import('fs');
	const entryFiles = readdirSync(entryDir);
	const startFile = entryFiles.find(f => f.startsWith('start.'));
	
	if (!startFile) {
		console.error('❌ Could not find start.js file');
		return false;
	}
	
	const entryPath = join(entryDir, startFile);
	console.log(`📦 Bundling with esbuild: ${startFile}`);
	
	try {
		await esbuild.build({
			entryPoints: [entryPath],
			bundle: true,
			format: 'iife',
			globalName: 'SvelteKitApp',
			outfile: join(buildDir, 'app-bundle.js'),
			platform: 'browser',
			target: 'es2020',
			minify: false,
			sourcemap: false,
			legalComments: 'none',
			absWorkingDir: buildDir,
			// Handle SvelteKit's internal module resolution
			mainFields: ['browser', 'module', 'main'],
			resolveExtensions: ['.js', '.mjs'],
			// Mark as external things that should be available globally
			define: {
				'globalThis.__sveltekit_1edaafx': 'window.__sveltekit_1edaafx',
			},
		});
		
		console.log('✓ Created IIFE bundle: app-bundle.js');
		return true;
	} catch (error) {
		console.error('❌ esbuild failed:', error.message);
		console.error(error);
		return false;
	}
}

// Create a simple loader script that initializes the app
function createLoaderScript() {
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Extract the initialization data from the current script
	const nodeIdsMatch = indexContent.match(/node_ids:\s*\[([^\]]+)\]/);
	const dataMatch = indexContent.match(/data:\s*\[([^\]]+)\]/);
	
	const nodeIds = nodeIdsMatch ? nodeIdsMatch[1] : '0,2';
	const data = dataMatch ? dataMatch[1] : 'null,null';
	
	// Create a simple loader that doesn't use dynamic imports
	const loaderScript = `<script>
		(function() {
			// Set up SvelteKit global
			window.__sveltekit_1edaafx = {
				base: new URL(".", location).pathname.slice(0, -1)
			};
			
			// Load the bundled app
			const script = document.createElement('script');
			script.src = './_app/immutable/app-bundle.js';
			script.onload = function() {
				// The bundle should expose SvelteKitApp globally
				if (window.SvelteKitApp && window.SvelteKitApp.start) {
					const element = document.body;
					window.SvelteKitApp.start(element, {
						node_ids: [${nodeIds}],
						data: [${data}],
						form: null,
						error: null
					});
				}
			};
			document.head.appendChild(script);
		})();
	</script>`;
	
	// Replace the dynamic import script
	const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/;
	indexContent = indexContent.replace(scriptPattern, loaderScript);
	
	// Remove modulepreload links (not needed for IIFE)
	indexContent = indexContent.replace(/<link rel="modulepreload"[^>]*>/g, '');
	
	writeFileSync(indexPath, indexContent, 'utf-8');
	console.log('✓ Updated index.html with IIFE loader');
}

async function main() {
	console.log('🔧 Creating IIFE bundle for airTRFX...\n');
	
	const success = await createIIFEBundle();
	
	if (success) {
		createLoaderScript();
		console.log('\n✓ Bundle created successfully!');
		console.log('ℹ️  The app-bundle.js file is a self-contained IIFE that should work in airTRFX');
	} else {
		console.log('\n⚠️  Failed to create IIFE bundle');
		console.log('💡 Alternative: Try keeping all chunk files and using type="module" if airTRFX supports ES modules');
	}
}

main().catch(err => {
	console.error('❌ Error:', err);
	process.exit(1);
});
