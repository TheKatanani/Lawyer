import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const INPUT_DIR = path.resolve('raw-images');
const OUTPUT_DIR = path.resolve('public/images');
const TARGET_WIDTH = 1600;
const MAX_BYTES = 200 * 1024; // 200KB

async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    return null;
  }
}

async function encodeWithSharp(sharp, inputPath, quality) {
  return sharp(inputPath)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: false })
    .webp({ quality, effort: 6 })
    .toBuffer();
}

async function encodeWithFfmpeg(inputPath, tmpPath, quality) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    inputPath,
    '-vf',
    `scale=${TARGET_WIDTH}:-2:flags=lanczos`,
    '-c:v',
    'libwebp',
    '-q:v',
    String(quality),
    '-compression_level',
    '6',
    tmpPath,
  ]);
  return fs.readFile(tmpPath);
}

async function optimizeFile(sharp, file, tmpDir) {
  const slug = path.parse(file).name.toLowerCase();
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);
  const tmpPath = path.join(tmpDir, `${slug}.webp`);

  let quality = 84;
  let buffer = null;

  while (quality >= 35) {
    buffer = sharp
      ? await encodeWithSharp(sharp, inputPath, quality)
      : await encodeWithFfmpeg(inputPath, tmpPath, quality);

    if (buffer.byteLength <= MAX_BYTES) {
      break;
    }
    quality -= 5;
  }

  await fs.writeFile(outputPath, buffer);
  const kb = (buffer.byteLength / 1024).toFixed(1);
  console.log(`${slug}.webp -> ${kb} KB (q=${quality})`);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const sharp = await loadSharp();
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rma-webp-'));

  try {
    const entries = await fs.readdir(INPUT_DIR);
    const images = entries.filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();

    if (images.length === 0) {
      console.log(`No images found in ${INPUT_DIR}`);
      return;
    }

    console.log(`Optimizing ${images.length} images using ${sharp ? 'sharp' : 'ffmpeg'}...`);
    for (const file of images) {
      await optimizeFile(sharp, file, tmpDir);
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
