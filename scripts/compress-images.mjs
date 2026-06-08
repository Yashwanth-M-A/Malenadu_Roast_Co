import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const INPUT_DIR = 'public/assets/images';
const SIZE_THRESHOLD_KB = 200; // Only compress files larger than this

const files = readdirSync(INPUT_DIR);
let totalSavedKB = 0;
let count = 0;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const filePath = join(INPUT_DIR, file);
  const sizeKB = Math.round(statSync(filePath).size / 1024);

  if (sizeKB < SIZE_THRESHOLD_KB) continue; // Skip already small files
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

  try {
    const input = sharp(filePath);
    const meta = await input.metadata();

    let pipeline = sharp(filePath);

    // Resize if extremely large (hero/bg images can be capped at 1600px wide)
    if (meta.width > 1600) {
      pipeline = pipeline.resize(1600, null, { withoutEnlargement: true });
    }

    if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(filePath + '.tmp');
    } else if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9, palette: false }).toFile(filePath + '.tmp');
    }

    // Replace original with compressed version
    const { renameSync } = await import('fs');
    const newSize = Math.round(statSync(filePath + '.tmp').size / 1024);
    const saved = sizeKB - newSize;

    if (saved > 0) {
      renameSync(filePath + '.tmp', filePath);
      totalSavedKB += saved;
      count++;
      console.log(`✅ ${file}: ${sizeKB}KB → ${newSize}KB (saved ${saved}KB)`);
    } else {
      // Not worth compressing, delete temp
      const { unlinkSync } = await import('fs');
      unlinkSync(filePath + '.tmp');
      console.log(`⏭ ${file}: already optimized`);
    }
  } catch (err) {
    console.error(`❌ Failed: ${file} — ${err.message}`);
  }
}

console.log(`\n🎉 Done! Compressed ${count} files. Total saved: ${Math.round(totalSavedKB)}KB (${(totalSavedKB/1024).toFixed(2)}MB)`);
