import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const thumbnailDirectory = path.join(
  projectRoot,
  "src/assets/gallery/thumbnails"
);

const fullscreenDirectory = path.join(
  projectRoot,
  "src/assets/gallery/fullscreen"
);

// Keep the same photos and order as your current Gallery.tsx.
const communityPhotos = [
  "IMGL0989.jpg",
  "IMGL0990.jpg",
  "IMGL0992.jpg",
  "IMGL0994.jpg",
  "IMGL0996.jpg",
  "IMGL0999.jpg",
  "IMGL1001.jpg",
  "IMGL1005.jpg",
  "IMGL1008.jpg",
  "IMGL1009.jpg",
  "IMGL1014.jpg",
  "IMGL1019.jpg",
  "IMGL1020.jpg",
  "IMGL1023.jpg",
  "IMGL1024.jpg",
  "IMGL1025.jpg",
  "IMGL1027.jpg",
  "IMGL1031.jpg",
  "IMGL1035.jpg",
  "IMGL1041.jpg",
  "IMGL1042.jpg",
  "IMGL1045.jpg",
  "IMGL1046.jpg",
  "IMGL1048.jpg",
  "IMGL1051.jpg",
  "IMGL1054.jpg",
  "IMGL1060.jpg",
  "IMGL1063.jpg",
  "IMGL1067.jpg",
  "IMGL1069.jpg",
  "IMGL1070.jpg",
  "IMGL1073.jpg",
  "IMGL1078.jpg",
  "IMGL1082.jpg",
  "IMGL1085.jpg",
  "IMGL1086.jpg",
  "IMGL1088.jpg",
  "IMGL1091.jpg",
  "IMGL1093.jpg",
  "IMGL1102.jpg",
  "IMGL1103.jpg",
  "IMGL1106.jpg",
  "IMGL1107.jpg",
  "IMGL1111.jpg",
  "IMGL1112.jpg",
  "IMGL1113.jpg",
  "IMGL1115.jpg",
  "IMGL1121.jpg",
  "IMGL1126.jpg",
  "IMGL1127.jpg",
  "IMGL1131.jpg",
  "IMGL1133.jpg",
  "IMGL1135.jpg",
  "IMGL1138.jpg",
  "IMGL1140.jpg",
  "IMGL1142.jpg",
  "IMGL1144.jpg",
  "IMGL1145.jpg",
  "IMGL1150.jpg",
  "IMGL1152.jpg",
  "IMGL1153.jpg",
  "IMGL1154.jpg",
  "IMGL1158.jpg",
  "IMGL1161.jpg",
  "IMGL1164.jpg",
];

const images = [
  {
    source: "src/assets/hero.jpg",
    name: "hero",
  },
  {
    source: "src/assets/membership.jpg",
    name: "membership",
  },
  {
    source: "src/assets/executives/image1.jpg",
    name: "executive-1",
  },
  {
    source: "src/assets/executives/image2.jpg",
    name: "executive-2",
  },
  ...communityPhotos.map((fileName) => ({
    source: fileName,
    name: path.parse(fileName).name,
  })),
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function optimizeImage(image) {
  const sourcePath = path.join(projectRoot, image.source);
  const original = await stat(sourcePath);

  if (!original.isFile()) {
    throw new Error("The source path is not an image file.");
  }

  const thumbnailPath = path.join(
    thumbnailDirectory,
    `${image.name}.webp`
  );

  const fullscreenPath = path.join(
    fullscreenDirectory,
    `${image.name}.webp`
  );

  // Small grid preview.
  // Preserve the complete photo without cropping or stretching.
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: 640,
      height: 800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 74,
      effort: 5,
    })
    .toFile(thumbnailPath);

  // Larger version for the fullscreen viewer.
  // This will only be requested when a photo is opened.
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 5,
    })
    .toFile(fullscreenPath);

  const thumbnail = await stat(thumbnailPath);
  const fullscreen = await stat(fullscreenPath);

  return {
    originalBytes: original.size,
    thumbnailBytes: thumbnail.size,
    fullscreenBytes: fullscreen.size,
  };
}

async function main() {
  await mkdir(thumbnailDirectory, { recursive: true });
  await mkdir(fullscreenDirectory, { recursive: true });

  let successful = 0;
  let failed = 0;

  let totalOriginalBytes = 0;
  let totalThumbnailBytes = 0;
  let totalFullscreenBytes = 0;

  const failures = [];

  console.log("\nStarting ASBESOC Gallery optimization.");
  console.log(`Photos to process: ${images.length}`);
  console.log("Creating one thumbnail and one fullscreen copy per photo.");
  console.log("This may take a few minutes.\n");

  // Process sequentially to avoid overloading your laptop.
  for (const [index, image] of images.entries()) {
    console.log(
      `[${index + 1}/${images.length}] Processing ${image.source}...`
    );

    try {
      const result = await optimizeImage(image);

      successful += 1;
      totalOriginalBytes += result.originalBytes;
      totalThumbnailBytes += result.thumbnailBytes;
      totalFullscreenBytes += result.fullscreenBytes;

      console.log(
        `Original: ${formatSize(result.originalBytes)}`
      );
      console.log(
        `Thumbnail: ${formatSize(result.thumbnailBytes)}`
      );
      console.log(
        `Fullscreen: ${formatSize(result.fullscreenBytes)}`
      );
      console.log("OK\n");
    } catch (error) {
      failed += 1;
      failures.push(image.source);

      console.error(`FAILED: ${image.source}`);
      console.error(
        error instanceof Error ? error.message : String(error)
      );
      console.error("");
    }
  }

  console.log("========================================");
  console.log(`Results: ${successful} successful, ${failed} failed.`);
  console.log("========================================");

  if (successful > 0) {
    console.log(
      `Original photos processed: ${formatSize(totalOriginalBytes)}`
    );
    console.log(
      `All grid thumbnails: ${formatSize(totalThumbnailBytes)}`
    );
    console.log(
      `All fullscreen copies: ${formatSize(totalFullscreenBytes)}`
    );

    const reduction =
      (1 - totalThumbnailBytes / totalOriginalBytes) * 100;

    if (reduction >= 0) {
      console.log(
        `Grid image size reduction: ${reduction.toFixed(1)}%`
      );
    } else {
      console.log(
        "The thumbnail total is larger than the original total. " +
          "Send the results for review."
      );
    }
  }

  console.log("\nYour original photos have not been changed or deleted.");
  console.log("Your website still uses its existing images for now.");

  if (failed > 0) {
    console.error("\nThese photos need attention:");

    for (const source of failures) {
      console.error(`- ${source}`);
    }

    console.error("\nSend the results before replacing Gallery.tsx.");
    process.exitCode = 1;
  } else {
    console.log(
      `\nAll ${images.length} gallery photos are ready in both sizes.`
    );
    console.log("Next step: connect them in Gallery.tsx.");
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});
