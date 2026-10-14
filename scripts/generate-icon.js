import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generateAppLogoPNG(width, height, outputPath) {
  // 512x512 RGBA
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const bgR = 0x25, bgG = 0x63, bgB = 0xEB, bgA = 0xFF; // Royal Blue #2563EB
  const fgR = 0xFF, fgG = 0xFF, fgB = 0xFF, fgA = 0xFF; // White
  const cornerRadius = width * 0.25;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      // Check rounded rect corner distance
      let insideSquircle = true;
      let dx = 0, dy = 0;
      if (x < cornerRadius) dx = cornerRadius - x;
      else if (x > width - cornerRadius) dx = x - (width - cornerRadius);
      if (y < cornerRadius) dy = cornerRadius - y;
      else if (y > height - cornerRadius) dy = y - (height - cornerRadius);

      if (dx > 0 && dy > 0) {
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          insideSquircle = false;
        }
      }

      if (!insideSquircle) {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      // Draw Store icon in normalized coords (0 to 1)
      const nx = x / width;
      const ny = y / height;

      let isIcon = false;

      // Store roof polygon / roof line (y: 0.28 to 0.42, x: 0.22 to 0.78)
      // Top roof edge
      if (ny >= 0.28 && ny <= 0.42) {
        // Sloped roof overhang
        const roofT = (ny - 0.28) / 0.14;
        const leftEdge = 0.35 - roofT * 0.14;
        const rightEdge = 0.65 + roofT * 0.14;
        if (nx >= leftEdge && nx <= rightEdge) {
          if (ny <= 0.32 || Math.abs(nx - leftEdge) < 0.035 || Math.abs(nx - rightEdge) < 0.035) {
            isIcon = true;
          }
        }
      }

      // Store awning bar
      if (ny >= 0.41 && ny <= 0.48 && nx >= 0.20 && nx <= 0.80) {
        isIcon = true;
      }

      // Store walls and pillars
      if (ny >= 0.48 && ny <= 0.74 && nx >= 0.23 && nx <= 0.77) {
        // Left wall
        if (nx <= 0.30) isIcon = true;
        // Right wall
        else if (nx >= 0.70) isIcon = true;
        // Bottom floor
        else if (ny >= 0.69) isIcon = true;
        // Doorway
        else if (nx >= 0.44 && nx <= 0.56 && ny >= 0.54) {
          // Open door gap
          isIcon = false;
        }
      }

      if (isIcon) {
        rawData[offset++] = fgR;
        rawData[offset++] = fgG;
        rawData[offset++] = fgB;
        rawData[offset++] = fgA;
      } else {
        rawData[offset++] = bgR;
        rawData[offset++] = bgG;
        rawData[offset++] = bgB;
        rawData[offset++] = bgA;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log('PNG generated at', outputPath);
}

generateAppLogoPNG(512, 512, './public/app-logo.png');
