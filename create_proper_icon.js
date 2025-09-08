const fs = require('fs');
const path = require('path');

// Create a minimal valid PNG file (1x1 pixel transparent PNG)
function createMinimalPNG() {
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length (13 bytes)
    0x49, 0x48, 0x44, 0x52, // IHDR chunk type
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 6 (RGBA), Compression: 0, Filter: 0, Interlace: 0
    0x1F, 0x15, 0xC4, 0x89, // IHDR CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length (10 bytes)
    0x49, 0x44, 0x41, 0x54, // IDAT chunk type
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // Compressed image data
    0x0D, 0x0A, 0x2D, 0xB4, // IDAT CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length (0 bytes)
    0x49, 0x45, 0x4E, 0x44, // IEND chunk type
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
}

// Create a 512x512 PNG with a simple colored square
function create512x512PNG() {
  const width = 512;
  const height = 512;
  
  // PNG file header
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);     // Width
  ihdrData.writeUInt32BE(height, 4);    // Height
  ihdrData.writeUInt8(8, 8);            // Bit depth
  ihdrData.writeUInt8(2, 9);            // Color type (RGB)
  ihdrData.writeUInt8(0, 10);           // Compression method
  ihdrData.writeUInt8(0, 11);           // Filter method
  ihdrData.writeUInt8(0, 12);           // Interlace method
  
  // Calculate CRC for IHDR
  const crc32 = require('zlib').crc32;
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = crc32(Buffer.concat([ihdrType, ihdrData]));
  
  // Create IHDR chunk
  const ihdrChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length
    ihdrType,
    ihdrData,
    Buffer.alloc(4)
  ]);
  ihdrChunk.writeUInt32BE(ihdrCrc, ihdrChunk.length - 4);
  
  // Create simple image data (green square)
  const rowSize = width * 3; // 3 bytes per pixel (RGB)
  const imageData = Buffer.alloc(height * (rowSize + 1)); // +1 for filter byte per row
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowSize + 1);
    imageData[rowStart] = 0; // Filter type: None
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      imageData[pixelStart] = 0x4C;     // R - Green color
      imageData[pixelStart + 1] = 0xAF; // G
      imageData[pixelStart + 2] = 0x50; // B
    }
  }
  
  // Compress image data
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(imageData);
  
  // Create IDAT chunk
  const idatType = Buffer.from('IDAT');
  const idatCrc = crc32(Buffer.concat([idatType, compressedData]));
  const idatChunk = Buffer.concat([
    Buffer.alloc(4),
    idatType,
    compressedData,
    Buffer.alloc(4)
  ]);
  idatChunk.writeUInt32BE(compressedData.length, 0);
  idatChunk.writeUInt32BE(idatCrc, idatChunk.length - 4);
  
  // IEND chunk
  const iendChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

try {
  const iconPath = path.join(__dirname, 'assets', 'images', 'OutlookLogo2.png');
  const pngBuffer = create512x512PNG();
  
  fs.writeFileSync(iconPath, pngBuffer);
  console.log('✅ Created proper 512x512 PNG icon');
  console.log('📁 Location:', iconPath);
  console.log('📏 Size:', pngBuffer.length, 'bytes');
  console.log('⚠️  Note: This is a temporary green square icon. Replace with your actual logo.');
} catch (error) {
  console.error('❌ Error creating PNG:', error.message);
  
  // Fallback: create minimal PNG
  try {
    const iconPath = path.join(__dirname, 'assets', 'images', 'OutlookLogo2.png');
    const minimalPng = createMinimalPNG();
    fs.writeFileSync(iconPath, minimalPng);
    console.log('✅ Created minimal fallback PNG icon');
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError.message);
  }
}