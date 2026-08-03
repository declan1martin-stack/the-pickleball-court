/**
 * Rasterize brand favicons from public/favicon.svg (pc-app-icon).
 * Run: node scripts/generate-favicons.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let sharp;
try {
	sharp = require('sharp');
} catch {
	console.error('Install sharp first: npm install --no-save sharp');
	process.exit(1);
}

const svg = readFileSync('public/favicon.svg');
await sharp(svg).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png');

const icon = await sharp(svg).resize(360, 360).png().toBuffer();
await sharp({
	create: {
		width: 1200,
		height: 630,
		channels: 3,
		background: { r: 255, g: 255, b: 255 },
	},
})
	.composite([
		{
			input: icon,
			left: Math.round((1200 - 360) / 2),
			top: Math.round((630 - 360) / 2),
		},
	])
	.png()
	.toFile('public/og-default.png');

console.log('Wrote favicon-32.png, apple-touch-icon.png, og-default.png');
