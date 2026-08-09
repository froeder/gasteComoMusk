import { deflateSync } from "node:zlib";
import { Buffer } from "node:buffer";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const catalogPath = join(root, "src/data/catalog.ts");
const assetsDir = join(root, "assets/catalog");
const mapPath = join(root, "src/data/catalogImageAssets.ts");
const width = 512;
const height = 320;

const palette = {
  Tecnologia: "#62f58b",
  Carros: "#f7c948",
  Imoveis: "#76e4f7",
  Viagens: "#ff9f6e",
  Aviacao: "#a78bfa",
  Embarcacoes: "#38bdf8",
  Luxo: "#f0abfc",
  "Arte e raridades": "#fb7185",
  "Animais e conservacao": "#86efac",
  "Impacto social": "#fef08a",
  Esportes: "#93c5fd",
  Espaco: "#c4b5fd",
  Infraestrutura: "#5eead4",
  "Projetos extravagantes": "#fda4af",
  Outros: "#d1d5db",
};

const categoryIcons = {
  Tecnologia: "chip",
  Carros: "car",
  Imoveis: "building",
  Viagens: "globe",
  Aviacao: "plane",
  Embarcacoes: "boat",
  Luxo: "diamond",
  "Arte e raridades": "frame",
  "Animais e conservacao": "leaf",
  "Impacto social": "heart",
  Esportes: "trophy",
  Espaco: "rocket",
  Infraestrutura: "tower",
  "Projetos extravagantes": "spark",
  Outros: "coin",
};

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [Number.parseInt(value.slice(0, 2), 16), Number.parseInt(value.slice(2, 4), 16), Number.parseInt(value.slice(4, 6), 16)];
}

function hash(input) {
  let value = 2166136261;
  for (const char of input) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function blendPixel(buffer, x, y, color, alpha = 255) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = y * width * 4 + x * 4;
  const amount = alpha / 255;
  buffer[offset] = Math.round(color[0] * amount + buffer[offset] * (1 - amount));
  buffer[offset + 1] = Math.round(color[1] * amount + buffer[offset + 1] * (1 - amount));
  buffer[offset + 2] = Math.round(color[2] * amount + buffer[offset + 2] * (1 - amount));
  buffer[offset + 3] = 255;
}

function rect(buffer, x, y, w, h, color, alpha = 255) {
  for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy += 1) {
    for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx += 1) {
      blendPixel(buffer, xx, yy, color, alpha);
    }
  }
}

function circle(buffer, cx, cy, radius, color, alpha = 255) {
  const r2 = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) blendPixel(buffer, x, y, color, alpha);
    }
  }
}

function line(buffer, x0, y0, x1, y1, color, thickness = 5, alpha = 255) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    circle(buffer, x, y, thickness, color, alpha);
  }
}

function polygon(buffer, points, color, alpha = 255) {
  const minY = Math.max(0, Math.min(...points.map((p) => p[1])));
  const maxY = Math.min(height - 1, Math.max(...points.map((p) => p[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const intersections = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        intersections.push(Math.round(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) {
      for (let x = intersections[i]; x <= intersections[i + 1]; x += 1) blendPixel(buffer, x, y, color, alpha);
    }
  }
}

function drawIcon(buffer, icon, accent, seed) {
  const cx = 256;
  const cy = 166;
  circle(buffer, cx, cy, 98, accent, 32);
  circle(buffer, cx, cy, 72, accent, 36);

  if (icon === "chip") {
    rect(buffer, 188, 104, 136, 124, accent, 220);
    rect(buffer, 214, 130, 84, 72, [7, 16, 31], 255);
    for (let i = 0; i < 6; i += 1) {
      rect(buffer, 168, 116 + i * 18, 22, 6, accent, 180);
      rect(buffer, 322, 116 + i * 18, 22, 6, accent, 180);
    }
    return;
  }
  if (icon === "car") {
    rect(buffer, 155, 163, 205, 42, accent, 230);
    polygon(buffer, [[198, 162], [230, 120], [303, 120], [337, 162]], accent, 220);
    circle(buffer, 205, 211, 24, [7, 16, 31], 255);
    circle(buffer, 315, 211, 24, [7, 16, 31], 255);
    return;
  }
  if (icon === "building") {
    rect(buffer, 185, 98, 142, 150, accent, 210);
    for (let y = 120; y < 220; y += 30) for (let x = 205; x < 295; x += 35) rect(buffer, x, y, 16, 18, [7, 16, 31], 230);
    return;
  }
  if (icon === "plane") {
    polygon(buffer, [[132, 170], [370, 132], [338, 169], [370, 206]], accent, 230);
    polygon(buffer, [[230, 154], [194, 96], [278, 146]], accent, 180);
    polygon(buffer, [[232, 187], [196, 246], [280, 194]], accent, 180);
    return;
  }
  if (icon === "boat") {
    polygon(buffer, [[158, 186], [354, 186], [319, 228], [193, 228]], accent, 230);
    polygon(buffer, [[245, 85], [245, 178], [178, 178]], accent, 170);
    polygon(buffer, [[258, 103], [258, 178], [330, 178]], accent, 190);
    return;
  }
  if (icon === "diamond") {
    polygon(buffer, [[256, 82], [352, 144], [256, 254], [160, 144]], accent, 230);
    line(buffer, 160, 144, 352, 144, [7, 16, 31], 4, 190);
    line(buffer, 256, 82, 256, 254, [7, 16, 31], 4, 160);
    return;
  }
  if (icon === "heart") {
    circle(buffer, 222, 138, 38, accent, 230);
    circle(buffer, 290, 138, 38, accent, 230);
    polygon(buffer, [[184, 154], [328, 154], [256, 246]], accent, 230);
    return;
  }
  if (icon === "rocket") {
    polygon(buffer, [[256, 72], [302, 166], [256, 248], [210, 166]], accent, 230);
    circle(buffer, 256, 142, 18, [7, 16, 31], 245);
    polygon(buffer, [[222, 216], [190, 254], [238, 238]], accent, 180);
    polygon(buffer, [[290, 216], [322, 254], [274, 238]], accent, 180);
    return;
  }
  if (icon === "trophy") {
    rect(buffer, 218, 102, 76, 86, accent, 230);
    rect(buffer, 238, 188, 36, 42, accent, 210);
    rect(buffer, 202, 230, 108, 18, accent, 210);
    circle(buffer, 196, 130, 28, accent, 95);
    circle(buffer, 316, 130, 28, accent, 95);
    return;
  }
  if (icon === "leaf") {
    polygon(buffer, [[154, 188], [270, 80], [354, 112], [304, 226], [205, 240]], accent, 220);
    line(buffer, 190, 218, 322, 108, [7, 16, 31], 5, 170);
    return;
  }
  if (icon === "frame") {
    rect(buffer, 166, 96, 180, 132, accent, 220);
    rect(buffer, 188, 118, 136, 88, [7, 16, 31], 255);
    circle(buffer, 226, 160, 22, accent, 190);
    polygon(buffer, [[188, 206], [252, 150], [324, 206]], accent, 165);
    return;
  }
  if (icon === "tower") {
    line(buffer, 256, 84, 198, 246, accent, 8, 220);
    line(buffer, 256, 84, 314, 246, accent, 8, 220);
    line(buffer, 216, 178, 296, 178, accent, 8, 220);
    line(buffer, 230, 134, 282, 134, accent, 8, 220);
    return;
  }
  if (icon === "spark") {
    polygon(buffer, [[256, 66], [279, 143], [356, 166], [279, 189], [256, 266], [233, 189], [156, 166], [233, 143]], accent, 230);
    return;
  }
  if (icon === "globe") {
    circle(buffer, cx, cy, 78, accent, 210);
    line(buffer, 178, 166, 334, 166, [7, 16, 31], 4, 180);
    line(buffer, 256, 88, 256, 244, [7, 16, 31], 4, 180);
    circle(buffer, 218 + (seed % 70), 136 + (seed % 48), 12, [7, 16, 31], 170);
    return;
  }
  circle(buffer, cx, cy, 78, accent, 220);
  circle(buffer, cx, cy, 42, [7, 16, 31], 230);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function pngFromPixels(pixels) {
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    scanlines[y * (width * 4 + 1)] = 0;
    pixels.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function renderItem(item) {
  const pixels = Buffer.alloc(width * height * 4);
  const accent = hexToRgb(palette[item.category] ?? "#8cff4f");
  const seed = hash(item.id);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = y * width * 4 + x * 4;
      pixels[offset] = 4 + Math.round((x / width) * 8);
      pixels[offset + 1] = 10 + Math.round((y / height) * 16);
      pixels[offset + 2] = 24 + Math.round((x / width) * 24);
      pixels[offset + 3] = 255;
    }
  }

  for (let i = 0; i < 42; i += 1) {
    const x = (seed * (i + 17) + i * 37) % width;
    const y = (seed * (i + 29) + i * 53) % height;
    circle(pixels, x, y, 1 + (i % 2), [210, 230, 255], 80);
  }

  circle(pixels, 70 + (seed % 80), 68 + (seed % 42), 52, accent, 26);
  line(pixels, 36, 274, 476, 46, accent, 2, 50);
  line(pixels, 52, 294, 492, 86, accent, 2, 34);
  drawIcon(pixels, categoryIcons[item.category] ?? "coin", accent, seed);
  rect(pixels, 0, 268, width, 52, [4, 10, 24], 150);

  return pngFromPixels(pixels);
}

const source = readFileSync(catalogPath, "utf8");
const items = [...source.matchAll(/^\s+\["([^"]+)",\s+"([^"]+)",\s+"([^"]+)"/gm)].map((match) => ({
  id: match[1],
  name: match[2],
  category: match[3],
}));

if (items.length === 0) {
  throw new Error("Nenhum item encontrado em src/data/catalog.ts");
}

mkdirSync(assetsDir, { recursive: true });
for (const item of items) {
  writeFileSync(join(assetsDir, `${item.id}.png`), renderItem(item));
}

const imports = items.map((item) => `  "${item.id}": require("@/assets/catalog/${item.id}.png"),`).join("\n");
writeFileSync(
  mapPath,
  `import type { ImageSource } from "expo-image";\n\nexport const catalogImageAssets: Record<string, ImageSource> = {\n${imports}\n};\n`,
);

console.log(`Geradas ${items.length} imagens em assets/catalog.`);
