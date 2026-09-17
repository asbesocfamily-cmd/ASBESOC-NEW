import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.join(projectRoot, "src/assets/programs");

const images = [
  {
    source: "IMGL1078.jpg",
    output: "programs-hero.webp",
    width: 1600,
    quality: 76,
  },
  {
    source: "IMGL1085.jpg",
    output: "programs-intro.webp",
    width: 1000,
    quality: 78,
  },
  {
    source: "IMGL1102.jpg",
    output: "vpad-main.webp",
    width: 1100,
    quality: 78,
  },
  {
    source: "IMGL1070.jpg",
    output: "vpad-community.webp",
    width: 700,
    quality: 78,
  },
  {
    source: "IMGL1140.jpg",
    output: "vpad-participants.webp",
    width: 700,
    quality: 78,
  },
  {
    source: "src/assets/executives/vpad.png",
    output: "housing-programme.webp",
    width: 1400,
    quality: 88,
  },
];

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });

  let successful = 0;
  let failed = 0;
  let totalOriginal = 0;
  let totalOptimized = 0;

  console.log("\nOptimizing ASBESOC Programs images...\n");

  for (const image of images) {
    const sourcePath = path.join(projectRoot, image.source);
    const outputPath = path.join(outputDirectory, image.output);

    try {
      const original = await stat(sourcePath);

      if (!original.isFile()) {
        throw new Error("The source path is not an image file.");
      }

      await sharp(sourcePath)
        .rotate()
        .resize({
          width: image.width,
          withoutEnlargement: true,
        })
        .webp({
          quality: image.quality,
          effort: 6,
        })
        .toFile(outputPath);

      const optimized = await stat(outputPath);
      const saved =
        ((original.size - optimized.size) / original.size) * 100;

      successful += 1;
      totalOriginal += original.size;
      totalOptimized += optimized.size;

      console.log(`OK: ${image.source}`);
      console.log(`Created: src/assets/programs/${image.output}`);
      console.log(
        `${formatSize(original.size)} -> ${formatSize(optimized.size)}`
      );

      if (saved >= 0) {
        console.log(`Size reduced by ${saved.toFixed(1)}%`);
      } else {
        console.log(
          `Warning: this copy is ${Math.abs(saved).toFixed(1)}% larger.`
        );
      }

      console.log("");
    } catch (error) {
      failed += 1;
      console.error(`FAILED: ${image.source}`);
      console.error(
        error instanceof Error ? error.message : String(error)
      );
      console.error("");
    }
  }

  console.log(`Results: ${successful} successful, ${failed} failed.`);

  if (successful > 0) {
    console.log(
      `Successful images: ${formatSize(totalOriginal)} -> ${formatSize(
        totalOptimized
      )}`
    );
  }

  console.log("Your original images have not been changed or deleted.");
  console.log("The website still uses its existing images for now.");

  if (failed > 0) {
    console.error(
      "\nSend the terminal results before updating Programs.tsx."
    );
    process.exitCode = 1;
  } else {
    console.log("\nAll six optimized images are ready.");
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});