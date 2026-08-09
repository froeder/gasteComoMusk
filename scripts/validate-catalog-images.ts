import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

type ManifestEntry = {
  itemId: string;
  itemName: string;
  file: string;
  sourcePage: string;
  originalImageUrl: string;
  author: string;
  license: string;
  attributionRequired: boolean;
  attributionText: string;
  imageType: string;
  isIllustrative: boolean;
  notes: string;
};

type CatalogItem = {
  id: string;
  name: string;
  category: string;
};

const root = process.cwd();
const catalogPath = join(root, "src/data/catalog.ts");
const assetsMapPath = join(root, "src/data/catalogImageAssets.ts");
const assetsDir = join(root, "assets/catalog");
const manifestPath = join(assetsDir, "image-sources.json");
const maxReasonableBytes = 2_500_000;
const minWidth = 800;
const minHeight = 600;
const targetRatio = 4 / 3;
const ratioTolerance = 0.03;

const errors: string[] = [];
const warnings: string[] = [];

function parseCatalog(): CatalogItem[] {
  const source = readFileSync(catalogPath, "utf8");
  return [...source.matchAll(/^\s+\["([^"]+)",\s+"([^"]+)",\s+"([^"]+)"/gm)].map((match) => ({
    id: match[1],
    name: match[2],
    category: match[3],
  }));
}

function parseAssetMap(): Map<string, string> {
  const source = readFileSync(assetsMapPath, "utf8");
  return new Map([...source.matchAll(/"([^"]+)":\s+require\("@\/assets\/catalog\/([^"]+\.png)"\)/g)].map((match) => [match[1], match[2]]));
}

function parsePngHeader(filePath: string): { width: number; height: number } {
  const buffer = readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("assinatura PNG invalida");
  }

  const chunkType = buffer.subarray(12, 16).toString("ascii");
  if (chunkType !== "IHDR") {
    throw new Error("IHDR ausente");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function exactHash(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function perceptualHash(filePath: string): string | null {
  const file = readFileSync(filePath);
  let offset = 8;
  const idatChunks: Buffer[] = [];
  let width = 0;
  let height = 0;
  let colorType = 0;
  let bitDepth = 0;

  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.subarray(offset + 4, offset + 8).toString("ascii");
    const data = file.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === "IDAT") idatChunks.push(data);
    offset += length + 12;
  }

  if (bitDepth !== 8 || colorType !== 6 || width <= 0 || height <= 0) return null;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const sampleSize = 8;
  const samples: number[] = [];

  for (let sy = 0; sy < sampleSize; sy += 1) {
    for (let sx = 0; sx < sampleSize; sx += 1) {
      const x = Math.floor((sx / sampleSize) * width);
      const y = Math.floor((sy / sampleSize) * height);
      const rowStart = y * (stride + 1);
      const filter = inflated[rowStart];
      if (filter !== 0) return null;
      const pixel = rowStart + 1 + x * bytesPerPixel;
      samples.push(Math.round((inflated[pixel] + inflated[pixel + 1] + inflated[pixel + 2]) / 3));
    }
  }

  const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  return samples.map((value) => (value >= avg ? "1" : "0")).join("");
}

function main() {
  const items = parseCatalog();
  const assetMap = parseAssetMap();
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ManifestEntry[];
  const manifestById = new Map(manifest.map((entry) => [entry.itemId, entry]));
  const ids = new Set(items.map((item) => item.id));
  const pngFiles = readdirSync(assetsDir).filter((file) => file.endsWith(".png"));
  const exactHashes = new Map<string, string>();
  const perceptualHashes = new Map<string, string>();

  if (items.length !== 94) errors.push(`catalogo deveria ter 94 itens, encontrou ${items.length}`);

  for (const item of items) {
    const mappedFile = assetMap.get(item.id);
    if (!mappedFile) {
      errors.push(`${item.id}: sem entrada em catalogImageAssets`);
      continue;
    }

    const expectedFile = `${item.id}.png`;
    if (mappedFile !== expectedFile) errors.push(`${item.id}: require aponta para ${mappedFile}, esperado ${expectedFile}`);

    const filePath = join(assetsDir, expectedFile);
    if (!existsSync(filePath)) {
      errors.push(`${item.id}: arquivo fisico ausente`);
      continue;
    }

    const stats = statSync(filePath);
    if (stats.size <= 0) errors.push(`${item.id}: arquivo vazio`);
    if (stats.size > maxReasonableBytes) warnings.push(`${item.id}: arquivo acima de ${(maxReasonableBytes / 1024).toFixed(0)} KB`);

    try {
      const dimensions = parsePngHeader(filePath);
      if (dimensions.width < minWidth || dimensions.height < minHeight) {
        errors.push(`${item.id}: dimensoes ${dimensions.width}x${dimensions.height} abaixo do minimo`);
      }
      const ratio = dimensions.width / dimensions.height;
      if (Math.abs(ratio - targetRatio) > ratioTolerance) {
        errors.push(`${item.id}: proporcao ${ratio.toFixed(3)} distante de 4:3`);
      }
    } catch (error) {
      errors.push(`${item.id}: ${(error as Error).message}`);
    }

    const hash = exactHash(filePath);
    const existingHash = exactHashes.get(hash);
    if (existingHash) errors.push(`${item.id}: duplicata exata de ${existingHash}`);
    exactHashes.set(hash, item.id);

    const pHash = perceptualHash(filePath);
    if (pHash) {
      const existingPHash = perceptualHashes.get(pHash);
      if (existingPHash) warnings.push(`${item.id}: hash perceptual igual a ${existingPHash}; revisar visualmente`);
      perceptualHashes.set(pHash, item.id);
    }

    const source = manifestById.get(item.id);
    if (!source) {
      errors.push(`${item.id}: sem registro em image-sources.json`);
    } else {
      if (source.itemName !== item.name) errors.push(`${item.id}: itemName no manifesto diverge do seed`);
      if (source.file !== expectedFile) errors.push(`${item.id}: file no manifesto diverge do arquivo esperado`);
      if (!source.author) errors.push(`${item.id}: author vazio no manifesto`);
      if (!source.license) errors.push(`${item.id}: license vazio no manifesto`);
      if (!source.sourcePage && source.imageType !== "generated") {
        errors.push(`${item.id}: sourcePage vazio em imagem nao original`);
      }
      if (!source.originalImageUrl && source.imageType !== "generated" && source.imageType !== "conceptual" && source.imageType !== "documentary") {
        errors.push(`${item.id}: originalImageUrl vazio sem justificativa de imagem original/ilustrativa`);
      }
    }
  }

  for (const [itemId] of assetMap) {
    if (!ids.has(itemId)) errors.push(`${itemId}: entrada orfa em catalogImageAssets`);
  }

  for (const file of pngFiles) {
    const id = file.replace(/\.png$/, "");
    if (!ids.has(id)) errors.push(`${file}: PNG orfao em assets/catalog`);
  }

  for (const source of manifest) {
    if (!ids.has(source.itemId)) errors.push(`${source.itemId}: manifesto possui item orfao`);
  }

  if (!existsSync(join(assetsDir, "catalog-contact-sheet.jpg"))) {
    errors.push("catalog-contact-sheet.jpg ausente");
  }

  for (const warning of warnings) console.warn(`Aviso: ${warning}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`Erro: ${error}`);
    process.exit(1);
  }

  console.log(`OK: ${items.length} itens, ${pngFiles.length} PNGs, ${manifest.length} registros de fonte.`);
}

main();
