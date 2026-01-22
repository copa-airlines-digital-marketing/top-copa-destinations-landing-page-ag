import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildDir = join(__dirname, '..', 'build', '_app', 'immutable');

// Simple approach: Keep all files but update HTML to use a non-module script
// For airTRFX, we'll inline the entry script and keep chunk files accessible
function createInlineBundle() {
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Find the entry script path
	const scriptMatch = indexContent.match(/<script[^>]*src="([^"]+)"[^>]*>/);
	
	if (!scriptMatch) {
		console.error('❌ Could not find script tag in index.html');
		return false;
	}
	
	const entryPath = scriptMatch[1];
	const entryFile = join(__dirname, '..', 'build', entryPath);
	
	if (!existsSync(entryFile)) {
		console.error(`❌ Entry file not found: ${entryFile}`);
		return false;
	}
	
	console.log(`📦 Reading entry file: ${entryPath}`);
	const entryContent = readFileSync(entryFile, 'utf-8');
	
	// For airTRFX, we need to handle ES modules differently
	// Option: Create a wrapper that loads the module
	const bundleContent = `// Entry point wrapper for airTRFX
(function() {
	const script = document.createElement('script');
	script.type = 'module';
	script.textContent = ${JSON.stringify(entryContent)};
	document.head.appendChild(script);
})();`;
	
	const bundleFile = join(buildDir, 'bundle.js');
	writeFileSync(bundleFile, bundleContent, 'utf-8');
	console.log(`✓ Created bundle.js`);
	
	// Update HTML - use regular script, not module
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
	
	return true;
}

// Alternative: Try to use the original merge but keep chunk files
function mergeButKeepChunks() {
	const indexPath = join(__dirname, '..', 'build', 'index.html');
	let indexContent = readFileSync(indexPath, 'utf-8');
	
	// Just update the script to not be type="module" - this might work if files are kept
	indexContent = indexContent.replace(
		/<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/,
		`<script src="$1"></script>`
	);
	
	writeFileSync(indexPath, indexContent, 'utf-8');
	console.log(`✓ Removed type="module" from script tag`);
	console.log(`ℹ️  Make sure all chunk files are present in the build directory`);
	
	return true;
}

// Main execution
function main() {
	console.log('📦 Creating bundle for airTRFX...');
	
	// Try the inline approach first
	if (createInlineBundle()) {
		console.log('✓ Bundle created successfully');
	} else {
		console.log('⚠️  Falling back to keeping original structure...');
		mergeButKeepChunks();
	}
}

main();
