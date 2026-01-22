import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildDir = join(__dirname, '..', 'build', '_app', 'immutable');

function inlineScripts() {
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Read the entry files
	const entryDir = join(buildDir, 'entry');
	if (!existsSync(entryDir)) {
		console.error('❌ Entry directory not found');
		return false;
	}
	
	const { readdirSync } = require('fs');
	const entryFiles = readdirSync(entryDir);
	const startFile = entryFiles.find(f => f.startsWith('start.'));
	const appFile = entryFiles.find(f => f.startsWith('app.'));
	
	if (!startFile || !appFile) {
		console.error('❌ Could not find entry files');
		return false;
	}
	
	const startPath = join(entryDir, startFile);
	const appPath = join(entryDir, appFile);
	
	try {
		const startContent = readFileSync(startPath, 'utf-8');
		const appContent = readFileSync(appPath, 'utf-8');
		
		// Extract node_ids and data from current script
		const nodeIdsMatch = indexContent.match(/node_ids:\s*\[([^\]]+)\]/);
		const dataMatch = indexContent.match(/data:\s*\[([^\]]+)\]/);
		
		const nodeIds = nodeIdsMatch ? nodeIdsMatch[1] : '0,2';
		const data = dataMatch ? dataMatch[1] : 'null,null';
		
		// Create inline script that loads modules as text and evaluates them
		// This is a workaround for environments that don't support ES modules
		const inlineScript = `<script>
			(function() {
				window.__sveltekit_1edaafx = {
					base: new URL(".", location).pathname.slice(0, -1)
				};
				
				const element = document.currentScript.parentElement;
				
				// Load scripts as text and evaluate them
				async function loadModule(url) {
					const response = await fetch(url);
					const text = await response.text();
					
					// Create a module-like environment
					const module = { exports: {} };
					const exports = module.exports;
					
					// Wrap the code to handle imports
					const wrappedCode = \`
						(function(module, exports) {
							\${text}
							return module.exports;
						})(module, exports);
					\`;
					
					try {
						eval(wrappedCode);
						return module.exports;
					} catch (e) {
						console.error('Error loading module:', url, e);
						throw e;
					}
				}
				
				// Load and initialize
				Promise.all([
					loadModule('./_app/immutable/entry/${startFile}'),
					loadModule('./_app/immutable/entry/${appFile}')
				]).then(([kit, app]) => {
					if (kit && kit.start) {
						kit.start(app, element, {
							node_ids: [${nodeIds}],
							data: [${data}],
							form: null,
							error: null
						});
					}
				}).catch(err => {
					console.error('Failed to load app:', err);
				});
			})();
		</script>`;
		
		// Replace the script tag
		const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/;
		indexContent = indexContent.replace(scriptPattern, inlineScript);
		
		writeFileSync(indexPath, indexContent, 'utf-8');
		console.log('✓ Created inline script loader');
		return true;
	} catch (error) {
		console.error('❌ Error:', error.message);
		return false;
	}
}

inlineScripts();
