import { Buffer } from "node:buffer";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const catalogPath = join(root, "src/data/catalog.ts");
const assetsDir = join(root, "assets/catalog");
const manifestPath = join(assetsDir, "image-sources.json");
const contactSheetPath = join(assetsDir, "catalog-contact-sheet.jpg");
const width = 1200;
const height = 900;

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

const imageTypeByCategory = {
  Tecnologia: "generated",
  Carros: "generated",
  Imoveis: "conceptual",
  Viagens: "conceptual",
  Aviacao: "generated",
  Embarcacoes: "generated",
  Luxo: "generated",
  "Arte e raridades": "generated",
  "Animais e conservacao": "documentary",
  "Impacto social": "documentary",
  Esportes: "conceptual",
  Espaco: "conceptual",
  Infraestrutura: "conceptual",
  "Projetos extravagantes": "conceptual",
  Outros: "generated",
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

function rgb(hex) {
  return Array.isArray(hex) ? hex : hexToRgb(hex);
}

function blendPixel(buffer, x, y, color, alpha = 255) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (Math.floor(y) * width + Math.floor(x)) * 4;
  const amount = alpha / 255;
  buffer[offset] = Math.round(color[0] * amount + buffer[offset] * (1 - amount));
  buffer[offset + 1] = Math.round(color[1] * amount + buffer[offset + 1] * (1 - amount));
  buffer[offset + 2] = Math.round(color[2] * amount + buffer[offset + 2] * (1 - amount));
  buffer[offset + 3] = 255;
}

function rect(buffer, x, y, w, h, color, alpha = 255) {
  for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(height, Math.ceil(y + h)); yy += 1) {
    for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(width, Math.ceil(x + w)); xx += 1) {
      blendPixel(buffer, xx, yy, color, alpha);
    }
  }
}

function circle(buffer, cx, cy, radius, color, alpha = 255) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) blendPixel(buffer, x, y, color, alpha);
    }
  }
}

function line(buffer, x0, y0, x1, y1, color, thickness = 7, alpha = 255) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const y = y0 + ((y1 - y0) * i) / steps;
    circle(buffer, x, y, thickness, color, alpha);
  }
}

function polygon(buffer, points, color, alpha = 255) {
  const minY = Math.max(0, Math.floor(Math.min(...points.map((p) => p[1]))));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...points.map((p) => p[1]))));
  for (let y = minY; y <= maxY; y += 1) {
    const xs = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(Math.round(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2) {
      for (let x = xs[i]; x <= xs[i + 1]; x += 1) blendPixel(buffer, x, y, color, alpha);
    }
  }
}

function glow(buffer, cx, cy, radius, color, alpha = 90) {
  for (let r = radius; r > 0; r -= 8) circle(buffer, cx, cy, r, color, Math.max(4, Math.round((alpha * r) / radius / 7)));
}

function base(buffer, item) {
  const accent = rgb(palette[item.category] ?? "#8cff4f");
  const seed = hash(`${item.id}:${item.name}`);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      buffer[offset] = 4 + Math.round((x / width) * 9);
      buffer[offset + 1] = 9 + Math.round((y / height) * 18);
      buffer[offset + 2] = 24 + Math.round((x / width) * 30);
      buffer[offset + 3] = 255;
    }
  }
  for (let i = 0; i < 120; i += 1) {
    const x = (seed * (i + 19) + i * 71) % width;
    const y = (seed * (i + 31) + i * 47) % height;
    circle(buffer, x, y, 1 + (i % 3), [218, 234, 255], 35 + (i % 5) * 10);
  }
  glow(buffer, 180 + (seed % 140), 145 + (seed % 85), 170, accent, 120);
  glow(buffer, 875 + (seed % 160), 255 + (seed % 145), 220, accent, 85);
  line(buffer, 40, 770, 1140, 220, accent, 3, 42);
  line(buffer, 120, 830, 1180, 330, accent, 3, 34);
  rect(buffer, 0, 730, width, 170, [4, 10, 24], 115);
  return { accent, seed };
}

function drawPhone(buffer, accent) {
  rect(buffer, 475, 155, 250, 555, [16, 24, 42], 255);
  rect(buffer, 505, 195, 190, 470, [7, 14, 27], 255);
  circle(buffer, 548, 232, 22, accent, 220);
  circle(buffer, 622, 232, 22, accent, 190);
  circle(buffer, 585, 286, 18, accent, 160);
}

function drawLaptop(buffer, accent) {
  polygon(buffer, [[320, 650], [880, 650], [1030, 760], [170, 760]], [14, 22, 38], 255);
  rect(buffer, 355, 200, 490, 370, [18, 28, 48], 255);
  rect(buffer, 392, 238, 416, 292, [7, 14, 27], 255);
  line(buffer, 430, 515, 770, 245, accent, 7, 110);
}

function drawHeadphones(buffer, accent) {
  circle(buffer, 600, 420, 235, accent, 35);
  line(buffer, 410, 420, 410, 570, accent, 35, 235);
  line(buffer, 790, 420, 790, 570, accent, 35, 235);
  circle(buffer, 408, 578, 86, [20, 29, 47], 255);
  circle(buffer, 792, 578, 86, [20, 29, 47], 255);
}

function drawTV(buffer, accent) {
  rect(buffer, 210, 185, 780, 460, [18, 28, 48], 255);
  rect(buffer, 250, 225, 700, 380, [5, 11, 24], 255);
  line(buffer, 300, 570, 900, 260, accent, 6, 110);
  rect(buffer, 560, 650, 80, 85, [210, 218, 230], 190);
  rect(buffer, 430, 735, 340, 32, [210, 218, 230], 190);
}

function drawGaming(buffer, accent) {
  rect(buffer, 260, 245, 440, 280, [18, 28, 48], 255);
  rect(buffer, 300, 285, 360, 205, [5, 11, 24], 255);
  rect(buffer, 765, 265, 155, 380, [20, 29, 48], 255);
  for (let y = 310; y < 590; y += 62) rect(buffer, 790, y, 105, 24, accent, 110);
  rect(buffer, 415, 545, 120, 55, [210, 218, 230], 155);
}

function drawRobot(buffer, accent) {
  circle(buffer, 600, 250, 86, [220, 230, 238], 235);
  rect(buffer, 505, 350, 190, 220, [220, 230, 238], 235);
  line(buffer, 505, 390, 350, 560, accent, 20, 185);
  line(buffer, 695, 390, 850, 560, accent, 20, 185);
  line(buffer, 545, 570, 455, 735, [220, 230, 238], 20, 220);
  line(buffer, 655, 570, 745, 735, [220, 230, 238], 20, 220);
  circle(buffer, 568, 245, 14, [5, 11, 24], 255);
  circle(buffer, 632, 245, 14, [5, 11, 24], 255);
}

function drawServerRacks(buffer, accent, factory = false) {
  if (factory) {
    rect(buffer, 210, 515, 760, 195, [32, 42, 58], 235);
    polygon(buffer, [[210, 515], [350, 390], [490, 515]], [32, 42, 58], 235);
    polygon(buffer, [[490, 515], [630, 390], [770, 515]], [32, 42, 58], 235);
    rect(buffer, 820, 280, 70, 235, [210, 218, 230], 190);
    circle(buffer, 860, 230, 65, accent, 55);
    return;
  }
  for (let i = 0; i < 5; i += 1) {
    rect(buffer, 250 + i * 140, 260, 100, 430, [20, 30, 48], 255);
    for (let y = 300; y < 660; y += 55) rect(buffer, 270 + i * 140, y, 60, 16, accent, 110 + (i % 3) * 20);
  }
}

function drawHelicopter(buffer, accent) {
  rect(buffer, 420, 430, 330, 95, [220, 228, 238], 235);
  circle(buffer, 420, 475, 80, [220, 228, 238], 235);
  line(buffer, 735, 470, 950, 405, [220, 228, 238], 12, 220);
  line(buffer, 310, 350, 850, 350, accent, 7, 185);
  line(buffer, 585, 350, 585, 430, accent, 7, 185);
  line(buffer, 455, 575, 760, 575, accent, 8, 170);
}

function drawRunway(buffer, accent, airport = true) {
  polygon(buffer, [[500, 280], [700, 280], [1035, 760], [165, 760]], [22, 30, 44], 255);
  for (let y = 340; y < 730; y += 78) rect(buffer, 585, y, 32, 38, accent, 160);
  if (airport) {
    rect(buffer, 215, 390, 92, 280, [210, 218, 230], 180);
    polygon(buffer, [[180, 390], [342, 390], [300, 330], [222, 330]], [210, 218, 230], 180);
  }
}

function drawMultiplePlanes(buffer, accent) {
  drawPlane(buffer, accent, false);
  polygon(buffer, [[180, 260], [515, 195], [575, 225], [295, 315]], [180, 190, 205], 140);
  polygon(buffer, [[640, 650], [985, 585], [1045, 615], [765, 705]], [180, 190, 205], 130);
}

function drawMoney(buffer, accent) {
  for (let i = 0; i < 4; i += 1) {
    rect(buffer, 270 + i * 105, 350 + i * 35, 430, 165, [38, 129, 78], 220);
    circle(buffer, 485 + i * 105, 432 + i * 35, 48, accent, 120);
  }
}

function drawGraduation(buffer, accent) {
  polygon(buffer, [[600, 250], [895, 380], [600, 510], [305, 380]], accent, 210);
  rect(buffer, 465, 500, 270, 85, [22, 30, 44], 230);
  line(buffer, 790, 420, 850, 600, accent, 8, 190);
}

function drawHouses(buffer, accent) {
  for (let i = 0; i < 5; i += 1) {
    const x = 210 + i * 155;
    rect(buffer, x, 520, 110, 135, [225, 232, 240], 210);
    polygon(buffer, [[x - 18, 520], [x + 55, 440], [x + 128, 520]], accent, 180);
  }
}

function drawFood(buffer, accent) {
  for (let i = 0; i < 4; i += 1) {
    const x = 300 + i * 155;
    polygon(buffer, [[x, 600], [x + 120, 600], [x + 90, 700], [x + 30, 700]], [220, 228, 238], 210);
    circle(buffer, x + 60, 565, 48, accent, 150);
  }
}

function drawMicroscope(buffer, accent) {
  line(buffer, 530, 270, 700, 455, [220, 228, 238], 22, 220);
  line(buffer, 640, 455, 525, 650, [220, 228, 238], 22, 220);
  circle(buffer, 520, 665, 95, accent, 120);
  rect(buffer, 420, 710, 360, 36, [220, 228, 238], 210);
}

function drawWine(buffer, accent) {
  for (let i = 0; i < 5; i += 1) {
    const x = 360 + i * 92;
    rect(buffer, x, 320, 54, 330, [31, 55, 42], 235);
    rect(buffer, x + 10, 265, 34, 75, [31, 55, 42], 235);
    rect(buffer, x + 6, 430, 42, 90, accent, 130);
  }
}

function drawBanquet(buffer, accent) {
  rect(buffer, 210, 565, 780, 90, [92, 56, 36], 235);
  for (let i = 0; i < 10; i += 1) {
    circle(buffer, 275 + i * 72, 545, 32, [240, 243, 248], 210);
    circle(buffer, 275 + i * 72, 520, 18, accent, 145);
  }
}

function drawViolin(buffer, accent) {
  circle(buffer, 515, 420, 86, [138, 78, 34], 230);
  circle(buffer, 635, 520, 86, [138, 78, 34], 230);
  line(buffer, 600, 285, 850, 700, [95, 58, 34], 14, 240);
  for (let i = 0; i < 4; i += 1) line(buffer, 520 + i * 18, 315, 770 + i * 18, 680, accent, 3, 160);
}

function drawCrown(buffer, accent) {
  polygon(buffer, [[280, 620], [345, 320], [500, 540], [600, 285], [700, 540], [855, 320], [920, 620]], accent, 215);
  rect(buffer, 280, 620, 640, 82, accent, 230);
  for (const x of [345, 600, 855]) circle(buffer, x, x === 600 ? 285 : 320, 34, [245, 250, 255], 180);
}

function drawSatelliteNetwork(buffer, accent) {
  for (let i = 0; i < 8; i += 1) {
    const x = 180 + ((i * 127) % 860);
    const y = 210 + ((i * 83) % 420);
    rect(buffer, x, y, 72, 28, [215, 225, 236], 210);
    line(buffer, x + 36, y + 14, 600, 455, accent, 3, 100);
  }
  circle(buffer, 600, 455, 82, accent, 75);
}

function drawCar(buffer, accent, seed) {
  const body = seed % 2 ? [32, 37, 48] : [150, 28, 37];
  polygon(buffer, [[185, 570], [300, 420], [750, 405], [940, 560], [1015, 640], [165, 640]], body, 255);
  polygon(buffer, [[375, 425], [475, 320], [710, 325], [805, 425]], [15, 27, 42], 230);
  rect(buffer, 282, 548, 620, 48, accent, 65);
  circle(buffer, 330, 660, 70, [7, 10, 18], 255);
  circle(buffer, 855, 660, 70, [7, 10, 18], 255);
  circle(buffer, 330, 660, 34, accent, 140);
  circle(buffer, 855, 660, 34, accent, 140);
}

function drawPlane(buffer, accent, executive = false) {
  polygon(buffer, [[155, 500], [930, 330], [1035, 382], [380, 575]], [230, 236, 246], 240);
  polygon(buffer, [[420, 456], [325, 250], [575, 420]], accent, 160);
  polygon(buffer, [[555, 530], [430, 755], [695, 500]], accent, 160);
  rect(buffer, 500, 393, executive ? 160 : 310, 26, [10, 20, 37], 180);
  for (let x = 500; x < 790; x += 46) circle(buffer, x, 405, 10, [7, 14, 27], 220);
}

function drawBoat(buffer, accent, sail = false) {
  polygon(buffer, [[185, 570], [1010, 570], [850, 710], [330, 710]], [28, 36, 52], 255);
  if (sail) {
    polygon(buffer, [[560, 160], [560, 540], [260, 540]], [240, 244, 250], 225);
    polygon(buffer, [[585, 210], [585, 540], [920, 540]], accent, 180);
  } else {
    rect(buffer, 430, 410, 360, 130, [238, 243, 250], 215);
    rect(buffer, 475, 440, 255, 42, [7, 14, 27], 180);
  }
  line(buffer, 120, 752, 1090, 750, accent, 5, 100);
}

function drawBuilding(buffer, accent, towers = 3) {
  for (let i = 0; i < towers; i += 1) {
    const x = 260 + i * 190;
    const h = 330 + i * 78;
    rect(buffer, x, 720 - h, 130, h, [22, 33, 52], 255);
    for (let yy = 740 - h; yy < 675; yy += 48) for (let xx = x + 22; xx < x + 100; xx += 38) rect(buffer, xx, yy, 18, 24, accent, 105);
  }
  rect(buffer, 0, 720, width, 180, [5, 11, 23], 180);
}

function drawLandscape(buffer, accent, kind = "island") {
  if (kind === "snow") {
    polygon(buffer, [[0, 650], [230, 380], [420, 650]], [235, 244, 250], 220);
    polygon(buffer, [[280, 680], [610, 280], [960, 680]], [226, 235, 244], 240);
  } else if (kind === "city") {
    drawBuilding(buffer, accent, 5);
  } else {
    rect(buffer, 0, 560, width, 340, [9, 52, 73], 210);
    polygon(buffer, [[310, 570], [560, 440], [790, 575], [1010, 620], [225, 635]], [210, 178, 112], 230);
    circle(buffer, 720, 458, 62, [45, 122, 67], 220);
    line(buffer, 720, 520, 720, 620, [90, 62, 35], 16, 220);
  }
  circle(buffer, 950, 150, 62, accent, 140);
}

function drawAnimal(buffer, accent, type = "bigcat") {
  const body = type === "elephant" ? [100, 105, 112] : type === "giraffe" ? [184, 125, 56] : [178, 127, 47];
  if (type === "elephant") {
    polygon(buffer, [[300, 510], [520, 390], [760, 410], [875, 575], [735, 690], [385, 675]], body, 240);
    circle(buffer, 790, 470, 110, body, 240);
    line(buffer, 840, 540, 905, 665, body, 30, 240);
  } else if (type === "giraffe") {
    rect(buffer, 560, 240, 75, 380, body, 235);
    circle(buffer, 625, 210, 64, body, 235);
    polygon(buffer, [[375, 515], [720, 480], [795, 645], [430, 675]], body, 235);
    for (let i = 0; i < 16; i += 1) circle(buffer, 440 + ((i * 77) % 310), 505 + ((i * 43) % 140), 22, [93, 58, 34], 170);
  } else {
    polygon(buffer, [[310, 545], [525, 430], [790, 455], [900, 595], [745, 685], [390, 670]], body, 240);
    circle(buffer, 800, 438, 82, body, 240);
    circle(buffer, 760, 385, 28, body, 240);
    circle(buffer, 838, 385, 28, body, 240);
  }
  line(buffer, 140, 700, 1050, 700, accent, 8, 80);
}

function drawSocial(buffer, accent, kind = "school") {
  if (kind === "water") {
    for (let i = 0; i < 5; i += 1) circle(buffer, 320 + i * 120, 500 - i * 25, 64, accent, 80 + i * 20);
    line(buffer, 235, 672, 1000, 672, accent, 10, 120);
  } else if (kind === "forest") {
    for (let i = 0; i < 16; i += 1) {
      const x = 150 + ((i * 73) % 900);
      const y = 360 + ((i * 47) % 270);
      line(buffer, x, y, x, y + 170, [83, 59, 38], 10, 220);
      circle(buffer, x, y, 58, [44, 132, 78], 210);
    }
  } else {
    drawBuilding(buffer, accent, kind === "hospital" ? 4 : 3);
    circle(buffer, 600, 250, 120, accent, 45);
  }
}

function drawSpace(buffer, accent, kind = "rocket") {
  if (kind === "telescope") {
    polygon(buffer, [[360, 500], [720, 350], [790, 430], [430, 585]], [210, 220, 232], 230);
    line(buffer, 610, 462, 810, 690, accent, 10, 180);
    circle(buffer, 335, 520, 82, accent, 135);
  } else if (kind === "station") {
    rect(buffer, 455, 390, 290, 110, [220, 228, 238], 235);
    for (let i = 0; i < 4; i += 1) rect(buffer, 185 + i * 220, 330, 170, 230, accent, 105);
    line(buffer, 250, 445, 950, 445, [220, 228, 238], 8, 200);
  } else {
    polygon(buffer, [[600, 130], [735, 455], [600, 720], [465, 455]], [226, 234, 244], 240);
    circle(buffer, 600, 360, 52, [7, 14, 27], 240);
    polygon(buffer, [[505, 610], [360, 780], [548, 705]], accent, 150);
    polygon(buffer, [[695, 610], [840, 780], [652, 705]], accent, 150);
  }
}

function drawLuxury(buffer, accent, kind = "diamond") {
  if (kind === "watch") {
    circle(buffer, 600, 440, 165, [235, 228, 204], 230);
    circle(buffer, 600, 440, 118, [8, 15, 28], 255);
    line(buffer, 600, 440, 600, 360, accent, 8, 220);
    line(buffer, 600, 440, 680, 480, accent, 8, 220);
    rect(buffer, 548, 150, 104, 145, [28, 34, 47], 230);
    rect(buffer, 548, 585, 104, 145, [28, 34, 47], 230);
  } else if (kind === "art") {
    rect(buffer, 310, 150, 580, 590, [130, 88, 48], 240);
    rect(buffer, 360, 200, 480, 490, [22, 34, 45], 255);
    circle(buffer, 565, 385, 120, accent, 95);
    polygon(buffer, [[360, 690], [585, 420], [840, 690]], accent, 145);
  } else {
    polygon(buffer, [[600, 170], [895, 360], [600, 735], [305, 360]], accent, 220);
    polygon(buffer, [[365, 360], [500, 215], [600, 360]], [245, 250, 255], 125);
    line(buffer, 305, 360, 895, 360, [7, 14, 27], 7, 170);
  }
}

function drawSport(buffer, accent) {
  rect(buffer, 120, 540, 960, 230, [41, 112, 63], 220);
  rect(buffer, 220, 600, 760, 120, [8, 15, 28], 130);
  circle(buffer, 600, 650, 64, [235, 239, 245], 240);
  for (let i = 0; i < 5; i += 1) line(buffer, 130 + i * 235, 520, 280 + i * 220, 380, accent, 5, 80);
}

function drawTrainingCenter(buffer, accent) {
  rect(buffer, 120, 500, 960, 260, [42, 125, 66], 220);
  for (let i = 0; i < 5; i += 1) line(buffer, 190 + i * 190, 510, 190 + i * 190, 745, [220, 236, 220], 3, 120);
  for (let i = 0; i < 8; i += 1) polygon(buffer, [[220 + i * 95, 610], [250 + i * 95, 610], [260 + i * 95, 690], [210 + i * 95, 690]], accent, 175);
  rect(buffer, 810, 340, 150, 145, [210, 218, 230], 170);
}

function drawColiseum(buffer, accent) {
  rect(buffer, 235, 355, 730, 305, [184, 152, 104], 220);
  polygon(buffer, [[235, 355], [600, 250], [965, 355]], [204, 174, 124], 180);
  for (let x = 295; x < 900; x += 105) {
    circle(buffer, x, 505, 42, [7, 14, 27], 180);
    rect(buffer, x - 42, 505, 84, 125, [7, 14, 27], 180);
  }
  line(buffer, 220, 670, 980, 670, accent, 7, 130);
}

function drawPyramid(buffer, accent) {
  polygon(buffer, [[200, 700], [600, 215], [1000, 700]], [205, 174, 107], 235);
  polygon(buffer, [[600, 215], [1000, 700], [660, 700]], [169, 130, 78], 220);
  circle(buffer, 930, 165, 58, accent, 125);
  line(buffer, 120, 735, 1080, 735, [205, 174, 107], 10, 150);
}

function drawInfrastructure(buffer, accent, kind = "bridge") {
  if (kind === "solar") {
    for (let y = 420; y < 750; y += 90) for (let x = 160; x < 960; x += 140) polygon(buffer, [[x, y], [x + 105, y - 25], [x + 125, y + 30], [x + 18, y + 58]], [16, 48, 78], 245);
    circle(buffer, 930, 170, 72, accent, 130);
  } else if (kind === "metro") {
    rect(buffer, 170, 430, 860, 235, [220, 230, 239], 235);
    rect(buffer, 240, 480, 560, 70, [7, 14, 27], 180);
    circle(buffer, 325, 675, 46, [7, 14, 27], 255);
    circle(buffer, 875, 675, 46, [7, 14, 27], 255);
  } else {
    line(buffer, 100, 615, 1100, 615, accent, 15, 200);
    for (let x = 240; x < 980; x += 180) {
      line(buffer, x, 615, x + 55, 300, [220, 228, 238], 9, 210);
      line(buffer, x + 110, 615, x + 55, 300, [220, 228, 238], 9, 210);
    }
  }
}

function chooseAndDraw(buffer, item, accent, seed) {
  const n = item.name.toLowerCase();
  const id = item.id;
  if (n.includes("iphone") || n.includes("smartphone")) return drawPhone(buffer, accent);
  if (n.includes("macbook") || n.includes("notebook")) return drawLaptop(buffer, accent);
  if (n.includes("airpods") || n.includes("fone")) return drawHeadphones(buffer, accent);
  if (id === "tv-8k") return drawTV(buffer, accent);
  if (id === "estacao-gamer") return drawGaming(buffer, accent);
  if (id === "robo-humanoide") return drawRobot(buffer, accent);
  if (id === "supercomputador" || id === "data-center") return drawServerRacks(buffer, accent);
  if (id === "fabrica-chips") return drawServerRacks(buffer, accent, true);
  if (item.category === "Carros") {
    if (id === "equipe-f1") return drawSport(buffer, accent);
    if (id === "colecao-classicos") {
      drawCar(buffer, accent, seed);
      polygon(buffer, [[155, 500], [280, 410], [480, 420], [565, 515], [610, 575], [145, 575]], [35, 41, 52], 180);
      return;
    }
    return drawCar(buffer, accent, seed);
  }
  if (item.category === "Aviacao") {
    if (id === "helicoptero") return drawHelicopter(buffer, accent);
    if (id === "aeroporto-regional") return drawRunway(buffer, accent);
    if (id === "companhia-aerea") return drawMultiplePlanes(buffer, accent);
    return drawPlane(buffer, accent, n.includes("gulfstream"));
  }
  if (item.category === "Embarcacoes") {
    if (id === "porta-avioes-expo") return drawRunway(buffer, accent, false);
    return drawBoat(buffer, accent, n.includes("veleiro"));
  }
  if (item.category === "Imoveis") {
    if (id === "fazenda-br") return drawLandscape(buffer, accent, "island");
    if (id === "bairro-completo") return drawHouses(buffer, accent);
    return drawBuilding(buffer, accent, n.includes("bairro") ? 6 : 3);
  }
  if (item.category === "Viagens") return drawLandscape(buffer, accent, n.includes("antart") ? "snow" : "island");
  if (item.category === "Animais e conservacao") {
    if (n.includes("elefante")) return drawAnimal(buffer, accent, "elephant");
    if (n.includes("girafa")) return drawAnimal(buffer, accent, "giraffe");
    return drawAnimal(buffer, accent, "bigcat");
  }
  if (item.category === "Impacto social") {
    if (id === "distribuir-10k") return drawMoney(buffer, accent);
    if (id === "bolsas-estudo") return drawGraduation(buffer, accent);
    if (id === "moradias-populares") return drawHouses(buffer, accent);
    if (id === "combater-fome") return drawFood(buffer, accent);
    if (id === "pesquisa-medica") return drawMicroscope(buffer, accent);
    if (n.includes("agua") || n.includes("saneamento")) return drawSocial(buffer, accent, "water");
    if (n.includes("reflorestar")) return drawSocial(buffer, accent, "forest");
    if (n.includes("hospital")) return drawSocial(buffer, accent, "hospital");
    return drawSocial(buffer, accent, "school");
  }
  if (id === "centro-treinamento") return drawTrainingCenter(buffer, accent);
  if (item.category === "Esportes") return drawSport(buffer, accent);
  if (item.category === "Espaco") {
    if (n.includes("telesc")) return drawSpace(buffer, accent, "telescope");
    if (n.includes("estacao")) return drawSpace(buffer, accent, "station");
    return drawSpace(buffer, accent, "rocket");
  }
  if (item.category === "Infraestrutura") {
    if (id === "rede-satelites") return drawSatelliteNetwork(buffer, accent);
    if (n.includes("solar")) return drawInfrastructure(buffer, accent, "solar");
    if (n.includes("metro")) return drawInfrastructure(buffer, accent, "metro");
    return drawInfrastructure(buffer, accent, "bridge");
  }
  if (item.category === "Luxo") {
    if (id === "relogio-raro") return drawLuxury(buffer, accent, "watch");
    if (id === "vinho-colecao") return drawWine(buffer, accent);
    if (id === "jantar-chefs") return drawBanquet(buffer, accent);
    return drawLuxury(buffer, accent, "diamond");
  }
  if (item.category === "Arte e raridades") {
    if (id === "instrumento-historico") return drawViolin(buffer, accent);
    if (id === "joias-coroa") return drawCrown(buffer, accent);
    return drawLuxury(buffer, accent, "art");
  }
  if (item.category === "Projetos extravagantes") {
    if (id === "monumento") return drawColiseum(buffer, accent);
    if (id === "maravilha-mundo") return drawPyramid(buffer, accent);
    return drawLandscape(buffer, accent, n.includes("cidade") || n.includes("pais") ? "city" : "island");
  }
  if (n.includes("livro")) {
    rect(buffer, 430, 190, 340, 520, accent, 220);
    rect(buffer, 470, 230, 260, 440, [7, 14, 27], 215);
    return;
  }
  if (n.includes("cafe") || n.includes("frappuccino")) {
    rect(buffer, 455, 245, 290, 440, [238, 243, 250], 220);
    rect(buffer, 420, 225, 360, 60, accent, 170);
    circle(buffer, 600, 225, 130, [245, 250, 255], 160);
    return;
  }
  return drawLuxury(buffer, accent, "diamond");
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
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function renderItem(item) {
  const pixels = Buffer.alloc(width * height * 4);
  const { accent, seed } = base(pixels, item);
  chooseAndDraw(pixels, item, accent, seed);
  return pngFromPixels(pixels);
}

const font = {
  A: ["111", "101", "111", "101", "101"],
  B: ["110", "101", "110", "101", "110"],
  C: ["111", "100", "100", "100", "111"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "110", "100", "111"],
  F: ["111", "100", "110", "100", "100"],
  G: ["111", "100", "101", "101", "111"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  J: ["001", "001", "001", "101", "111"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101"],
  N: ["101", "111", "111", "111", "101"],
  O: ["111", "101", "101", "101", "111"],
  P: ["111", "101", "111", "100", "100"],
  Q: ["111", "101", "101", "111", "001"],
  R: ["111", "101", "111", "110", "101"],
  S: ["111", "100", "111", "001", "111"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "010"],
  W: ["101", "101", "111", "111", "101"],
  X: ["101", "101", "010", "101", "101"],
  Y: ["101", "101", "010", "010", "010"],
  Z: ["111", "001", "010", "100", "111"],
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  "-": ["000", "000", "111", "000", "000"],
};

function setJpegPixel(data, sheetWidth, x, y, color) {
  if (x < 0 || y < 0 || x >= sheetWidth || y >= data.length / 4 / sheetWidth) return;
  const offset = (y * sheetWidth + x) * 4;
  data[offset] = color[0];
  data[offset + 1] = color[1];
  data[offset + 2] = color[2];
  data[offset + 3] = 255;
}

function drawText(data, sheetWidth, x, y, text, scale = 2, color = [245, 248, 252]) {
  const safe = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  let cursor = x;
  for (const char of safe) {
    if (char === " ") {
      cursor += 4 * scale;
      continue;
    }
    const glyph = font[char] ?? font["-"];
    for (let gy = 0; gy < glyph.length; gy += 1) {
      for (let gx = 0; gx < glyph[gy].length; gx += 1) {
        if (glyph[gy][gx] === "1") {
          for (let yy = 0; yy < scale; yy += 1) for (let xx = 0; xx < scale; xx += 1) setJpegPixel(data, sheetWidth, cursor + gx * scale + xx, y + gy * scale + yy, color);
        }
      }
    }
    cursor += 4 * scale;
  }
}

function makeContactSheet(items) {
  const columns = 6;
  const thumbW = 180;
  const thumbH = 135;
  const labelH = 78;
  const gap = 18;
  const margin = 24;
  const rows = Math.ceil(items.length / columns);
  const sheetW = margin * 2 + columns * thumbW + (columns - 1) * gap;
  const sheetH = margin * 2 + rows * (thumbH + labelH + gap);
  const data = Buffer.alloc(sheetW * sheetH * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 5;
    data[i + 1] = 11;
    data[i + 2] = 24;
    data[i + 3] = 255;
  }
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + col * (thumbW + gap);
    const y = margin + row * (thumbH + labelH + gap);
    const png = PNG.sync.read(readFileSync(join(assetsDir, `${item.id}.png`)));
    for (let ty = 0; ty < thumbH; ty += 1) {
      for (let tx = 0; tx < thumbW; tx += 1) {
        const sx = Math.floor((tx / thumbW) * png.width);
        const sy = Math.floor((ty / thumbH) * png.height);
        const src = (sy * png.width + sx) * 4;
        const dst = ((y + ty) * sheetW + x + tx) * 4;
        data[dst] = png.data[src];
        data[dst + 1] = png.data[src + 1];
        data[dst + 2] = png.data[src + 2];
        data[dst + 3] = 255;
      }
    }
    drawText(data, sheetW, x, y + thumbH + 10, item.id.slice(0, 24), 2, [140, 255, 120]);
    drawText(data, sheetW, x, y + thumbH + 30, item.name.slice(0, 28), 2, [245, 248, 252]);
    drawText(data, sheetW, x, y + thumbH + 50, item.category.slice(0, 28), 2, [180, 190, 205]);
  }
  writeFileSync(contactSheetPath, jpeg.encode({ data, width: sheetW, height: sheetH }, 86).data);
}

function parseItems() {
  const source = readFileSync(catalogPath, "utf8");
  return [...source.matchAll(/^\s+\["([^"]+)",\s+"([^"]+)",\s+"([^"]+)",\s+"([^"]+)",\s+"([^"]+)"/gm)].map((match) => ({
    id: match[1],
    name: match[2],
    category: match[3],
    priceCents: match[4],
    estimateType: match[5],
  }));
}

const items = parseItems();
if (items.length === 0) throw new Error("Nenhum item encontrado em src/data/catalog.ts");

mkdirSync(assetsDir, { recursive: true });
for (const item of items) writeFileSync(join(assetsDir, `${item.id}.png`), renderItem(item));

writeFileSync(
  manifestPath,
  `${JSON.stringify(
    items.map((item) => ({
      itemId: item.id,
      itemName: item.name,
      file: `${item.id}.png`,
      sourcePage: "generated-original://gaste-como-musk/catalog-v2-specific-items",
      originalImageUrl: "",
      author: "Equipe Gaste como Musk",
      license: "Asset original do projeto; redistribuicao permitida junto ao aplicativo",
      attributionRequired: false,
      attributionText: "Imagem original gerada localmente para o aplicativo Gaste como Musk",
      imageType: imageTypeByCategory[item.category] ?? "generated",
      isIllustrative: true,
      notes: `Ilustracao original coerente com o item especifico: ${item.name}. Nao e fotografia oficial nem registro factual.`,
    })),
    null,
    2,
  )}\n`,
);

makeContactSheet(items);
console.log(`Geradas ${items.length} imagens 1200x900, manifesto e folha de contato.`);
