import fs from "fs";
import path from "path";

// Function to mathematically wrap a PNG buffer inside a standard single-image Windows ICO container
function pngToIco(pngBuffer: Buffer): Buffer {
  const header = Buffer.alloc(22);
  
  // ICO Header:
  // Offset 0 (2 bytes): Reserved, must be 0
  header.writeUInt16LE(0, 0);
  // Offset 2 (2 bytes): Image type, 1 for Icon (.ico)
  header.writeUInt16LE(1, 2);
  // Offset 4 (2 bytes): Number of images in file, 1
  header.writeUInt16LE(1, 4);
  
  // Icon Directory Entry (16 bytes):
  // Offset 6 (1 byte): Image width (0 represents 256px)
  header.writeUInt8(0, 6);
  // Offset 7 (1 byte): Image height (0 represents 256px)
  header.writeUInt8(0, 7);
  // Offset 8 (1 byte): Color palette count (0 if no palette/true color)
  header.writeUInt8(0, 8);
  // Offset 9 (1 byte): Reserved, must be 0
  header.writeUInt8(0, 9);
  // Offset 10 (2 bytes): Color planes, usually 1
  header.writeUInt16LE(1, 10);
  // Offset 12 (2 bytes): Bits per pixel (32 for RGBA true color)
  header.writeUInt16LE(32, 12);
  // Offset 14 (4 bytes): Size of the image data in bytes (PNG length)
  header.writeUInt32LE(pngBuffer.length, 14);
  // Offset 18 (4 bytes): Offset of raw image data from beginning of file (exactly 22 bytes offset)
  header.writeUInt32LE(22, 18);
  
  return Buffer.concat([header, pngBuffer]);
}

async function main() {
  const cwd = process.cwd();
  const destIcoPath = path.join(cwd, "dentist.ico");
  const publicDir = path.join(cwd, "public");
  const sourcePngPath = path.join(publicDir, "favicon.png");

  console.log("🌟 Beginning pristine green tooth icon compilation and synchronization sequence...");

  if (fs.existsSync(sourcePngPath)) {
    console.log(`✨ Found master image at: ${sourcePngPath}`);
    try {
      const pngBuffer = fs.readFileSync(sourcePngPath);
      const icoBuffer = pngToIco(pngBuffer);
      
      // 1. Write the dentist.ico file to root directory
      fs.writeFileSync(destIcoPath, icoBuffer);
      console.log(`✅ Successfully compiled dentist.ico from premium PNG source (${icoBuffer.length} bytes).`);

      // 2. Also write favicon.ico to public directory for rich browser chrome favicon support
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const publicFaviconPath = path.join(publicDir, "favicon.ico");
      fs.writeFileSync(publicFaviconPath, icoBuffer);
      console.log(`✅ Copy of favicon.ico written to /public directory.`);

      // Extra: Make sure icon-192.png and icon-512.png are also written for rich PWA compatibility
      const icon192Path = path.join(publicDir, "icon-192.png");
      const icon512Path = path.join(publicDir, "icon-512.png");
      fs.writeFileSync(icon192Path, pngBuffer);
      fs.writeFileSync(icon512Path, pngBuffer);
      console.log(`✅ Copy of PNG favicon written as icon-192.png and icon-512.png for PWA.`);
    } catch (e) {
      console.error("❌ Failed to compile logo icon:", e);
    }
  } else {
    console.error("❌ Master favicon.png not found in public directory.");
  }
}

main().catch((err) => {
  console.error("❌ Error executing icon generator:", err);
});
