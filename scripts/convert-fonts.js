const fs = require('fs');
const path = require('path');
const { decode } = require('@woff2/woff2-rs');

const fontsDir = path.join(__dirname, '../assets/fonts');
const funnelFonts = [
  'funnel-display-latin-300-normal.woff2',
  'funnel-display-latin-400-normal.woff2',
  'funnel-display-latin-500-normal.woff2',
  'funnel-display-latin-600-normal.woff2',
  'funnel-display-latin-700-normal.woff2',
  'funnel-display-latin-800-normal.woff2',
];

funnelFonts.forEach((filename) => {
  const inputPath = path.join(fontsDir, filename);
  const outputFilename = filename.replace('.woff2', '.ttf');
  const outputPath = path.join(fontsDir, outputFilename);

  if (!fs.existsSync(inputPath)) {
    return;
  }

  try {
    const woff2Buffer = fs.readFileSync(inputPath);
    const ttfBuffer = decode(woff2Buffer);
    fs.writeFileSync(outputPath, ttfBuffer);
  } catch (err) {
    console.error(`Error converting ${filename}:`, err.message);
  }
});
