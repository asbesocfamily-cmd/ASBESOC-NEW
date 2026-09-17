import sharp from "sharp";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";

const images = [
  {
    input: "src/assets/hero.jpg",
    output: "src/assets/hero.webp",
    width: 1600,
    quality: 78,
  },
  {
    input: "src/assets/membership.jpg",
    output: "src/assets/membership.webp",
    width: 1400,
    quality: 78,
  },
  {
    input: "src/assets/executives/image1.jpg",
    output: "src/assets/executives/image1.webp",
    width: 900,
    quality: 80,
  },
  {
    input: "src/assets/executives/image2.jpg",
    output: "src/assets/executives/image2.webp",
    width: 900,
    quality: 80,
  },
  {
    input: "src/assets/executives/image3.jpeg",
    output: "src/assets/executives/image3.webp",
    width: 900,
    quality: 80,
  },
];

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeImage(image) {
  const inputPath = resolve(image.input);
  const outputPath = resolve(image.output);

  const originalFile = await stat(inputPath);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: image.width,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: image.quality,
      effort: 6,
    })
    .toFile(outputPath);

  const optimizedFile = await stat(outputPath);

  const savedPercentage = (
    ((originalFile.size - optimizedFile.size) / originalFile.size) *
    100
  ).toFixed(1);

  console.log(`Optimized: ${image.input}`);
  console.log(`Created: ${image.output}`);
  console.log(
    `${formatSize(originalFile.size)} → ${formatSize(optimizedFile.size)}`
  );
  console.log(`Saved: ${savedPercentage}%`);
  console.log("");
}

async function runOptimizer() {
  console.log("Starting ASBESOC Home image optimization...\n");

  for (const image of images) {
    try {
      await optimizeImage(image);
    } catch (error) {
      console.error(`Could not optimize ${image.input}`);
      console.error(error.message);
      console.log("");
    }
  }

  console.log("ASBESOC Home image optimization completed.");
  console.log("Your original images were not deleted or changed.");
}

runOptimizer();