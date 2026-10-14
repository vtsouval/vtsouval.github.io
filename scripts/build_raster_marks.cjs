/* Deterministic crops and theme variants of the original institutional artwork.
 * Requires sharp. No logo geometry is redrawn or generated.
 * Run with Node and sharp available on NODE_PATH.
 */
const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');

const marks = [
  {
    source: 'assets/institutions/iris-source.png',
    output: 'assets/institutions/iris',
    // IRIS emblem and wordmark only; TU/e begins at source x=655.
    crop: { left: 51, top: 69, width: 538, height: 253 },
    palette: 'iris',
  },
  {
    source: 'assets/events/ieee-bigdata-source.png',
    output: 'assets/events/marks/ieee-bigdata',
    // Original network emblem, excluding year, city and conference wordmark.
    crop: { left: 9, top: 9, width: 165, height: 172 },
    palette: 'bigdata',
  },
];

(async () => {
  for (const mark of marks) {
    const { data, info } = await sharp(path.join(root, mark.source))
      .extract(mark.crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (const theme of ['light', 'dark']) {
      const pixels = Buffer.from(data);
      for (let i = 0; i < pixels.length; i += 4) {
        const [r, g, b, a] = pixels.subarray(i, i + 4);
        // Remove only the white matte, retaining soft edges and source alpha.
        pixels[i + 3] = Math.round(a * Math.min(1, (255 - Math.min(r, g, b)) / 18));
        if (theme === 'dark' && pixels[i + 3]) {
          let rgb;
          if (mark.palette === 'bigdata') {
            const lightness = (r + g + b) / (3 * 255);
            rgb = [171, 193, 203].map(v => Math.round(v + lightness * 45));
          } else if (r > g * 1.6 && r > b * 1.6) {
            rgb = [255, 113, 119]; // Red accent.
          } else if (b > r * 1.5 && g > r * 1.5 && g > 70) {
            rgb = [84, 184, 241]; // Blue accent.
          } else if (b > r * 1.3 && b > g * 1.25) {
            rgb = [222, 233, 255]; // Navy lettering becomes pale blue.
          } else {
            rgb = [180, 193, 209]; // Grey gear and edge pixels.
          }
          pixels.set(rgb, i);
        }
      }
      await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png({ compressionLevel: 9 }).toFile(path.join(root, `${mark.output}-${theme}.png`));
    }
    console.log(`Built ${mark.output}-{light,dark}.png (${info.width}×${info.height})`);
  }
  const springer = fs.readFileSync(path.join(root, 'assets/events/marks/springer.svg'), 'utf8');
  for (const theme of ['light', 'dark']) {
    const svg = springer.replaceAll('#fff', theme === 'light' ? '#16344a' : '#e6edf3');
    await sharp(Buffer.from(svg), { density: 288 }).resize(360, 440).png()
      .toFile(path.join(root, `assets/events/marks/springer-${theme}.png`));
  }
  console.log('Built Springer publisher emblem in both themes (360×440)');
})().catch(error => { console.error(error); process.exitCode = 1; });
