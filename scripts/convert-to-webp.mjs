import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';

const IMG_DIR = 'public/assets/images';
const files = readdirSync(IMG_DIR);
let totalSavedKB = 0;
let count = 0;
const converted = [];

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

  const inPath = join(IMG_DIR, file);
  const outName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const outPath = join(IMG_DIR, outName);

  const sizeBefore = Math.round(statSync(inPath).size / 1024);

  try {
    await sharp(inPath)
      .resize(1600, null, { withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outPath);

    const sizeAfter = Math.round(statSync(outPath).size / 1024);
    const saved = sizeBefore - sizeAfter;
    totalSavedKB += saved;
    count++;
    converted.push({ from: file, to: outName });
    console.log(`✅ ${file} (${sizeBefore}KB) → ${outName} (${sizeAfter}KB) | saved ${saved}KB`);

    // Remove original only if webp is smaller
    if (sizeAfter < sizeBefore) {
      unlinkSync(inPath);
    }
  } catch (err) {
    console.error(`❌ Failed: ${file} — ${err.message}`);
  }
}

console.log(`\n🎉 Converted ${count} images. Total saved: ${Math.round(totalSavedKB)}KB (${(totalSavedKB/1024).toFixed(2)}MB)`);
console.log('\n📋 Reference map (old → new):');
converted.forEach(c => console.log(`  ${c.from} → ${c.to}`));
