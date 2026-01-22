import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildDir = join(__dirname, '..', 'build', '_app', 'immutable');

// Function to recursively get all JS files
function getAllJsFiles(dir, fileList = []) {
	const files = readdirSync(dir);
	
	files.forEach(file => {
		const filePath = join(dir, file);
		const stat = statSync(filePath);
		
		if (stat.isDirectory()) {
			getAllJsFiles(filePath, fileList);
		} else if (file.endsWith('.js')) {
			fileList.push(filePath);
		}
	});
	
	return fileList;
}

// Get all JS files (excluding bundle.js if it already exists)
const jsFiles = getAllJsFiles(buildDir).filter(file => !file.endsWith('bundle.js'));

// Sort files to ensure consistent order (entry files first, then chunks, then nodes)
const sortedFiles = jsFiles.sort((a, b) => {
	const aPath = a.replace(buildDir, '');
	const bPath = b.replace(buildDir, '');
	
	// Entry files first
	if (aPath.includes('/entry/') && !bPath.includes('/entry/')) return -1;
	if (!aPath.includes('/entry/') && bPath.includes('/entry/')) return 1;
	
	// Then chunks
	if (aPath.includes('/chunks/') && !bPath.includes('/chunks/')) return -1;
	if (!aPath.includes('/chunks/') && bPath.includes('/chunks/')) return 1;
	
	// Then nodes
	if (aPath.includes('/nodes/') && !bPath.includes('/nodes/')) return -1;
	if (!aPath.includes('/nodes/') && bPath.includes('/nodes/')) return 1;
	
	return aPath.localeCompare(bPath);
});

// Read and concatenate all JS files
let mergedContent = '';
const fileMap = new Map();

sortedFiles.forEach(file => {
	const content = readFileSync(file, 'utf-8');
	const relativePath = file.replace(buildDir, '').replace(/\\/g, '/');
	fileMap.set(relativePath, content);
	mergedContent += `\n// ===== ${relativePath} =====\n`;
	mergedContent += content;
	mergedContent += '\n';
});

// Write merged file
const outputFile = join(buildDir, 'bundle.js');
writeFileSync(outputFile, mergedContent, 'utf-8');

// Update index.html to use the single bundle
const indexPath = join(__dirname, '..', 'build', 'index.html');
let indexContent = readFileSync(indexPath, 'utf-8');

// Remove all modulepreload links for JS files
indexContent = indexContent.replace(/<link rel="modulepreload" href="\.\/_app\/immutable\/[^"]+\.js"[^>]*>/g, '');

// Find the script tag and replace it with bundle.js
indexContent = indexContent.replace(
	/<script[^>]*>[\s\S]*?<\/script>/,
	`<script type="module" src="./_app/immutable/bundle.js"></script>`
);

writeFileSync(indexPath, indexContent, 'utf-8');

// Delete the individual JS files after merging
sortedFiles.forEach(file => {
	try {
		// Don't delete the bundle.js we just created
		if (!file.endsWith('bundle.js')) {
			unlinkSync(file);
		}
	} catch (err) {
		// File might already be deleted or doesn't exist
		console.warn(`Warning: Could not delete ${file}:`, err.message);
	}
});

console.log(`✓ Merged ${sortedFiles.length} JS files into bundle.js`);
console.log(`✓ Updated index.html to use bundle.js`);
