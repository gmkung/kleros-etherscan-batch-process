import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { stringify } from "csv-stringify/sync";
import { processKlerosTags } from "./kleros-tag-processor.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

async function main() {
  const groupedData = await processKlerosTags();
  const groupedAbsentData = await processKlerosTags(undefined, undefined, {
    status: "Absent",
    minNumberOfRequests: 1,
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Ensure output and tags directories exist
  const outputDir = path.join(__dirname, "../output");
  const tagsDir = path.join(outputDir, "tags");
  ensureDirectoryExists(outputDir);
  ensureDirectoryExists(tagsDir);

  const regularSets: { [explorer: string]: Set<string> } = {};
  const removalSets: { [explorer: string]: Set<string> } = {};

  for (const explorer in groupedData) {
    const filePath = path.join(
      tagsDir,
      `kleros-tags-${explorer}-${timestamp}.csv`
    );
    const csvContent = stringify(groupedData[explorer], {
      header: true,
      columns: [
        "Address",
        "Nametag",
        "Website",
        "Public Note",
        "Chain ID"
      ],
    });
    fs.writeFileSync(filePath, csvContent);
    console.log(`File written: ${filePath}`);

    regularSets[explorer] = new Set(
      groupedData[explorer]
        .map((item) => item.Address?.toLowerCase())
        .filter((addr): addr is string => Boolean(addr))
    );
  }

  for (const explorer in groupedAbsentData) {
    const removalItems = groupedAbsentData[explorer] || [];
    if (!removalItems.length) {
      continue;
    }
    removalSets[explorer] = new Set(
      removalItems
        .map((item) => item.Address?.toLowerCase())
        .filter((addr): addr is string => Boolean(addr))
    );
    const regularSet = regularSets[explorer];
    const filteredRemovalItems = regularSet
      ? removalItems.filter(
          (item) => !regularSet.has(item.Address?.toLowerCase() || "")
        )
      : removalItems;

    if (!filteredRemovalItems.length) {
      continue;
    }

    const filePath = path.join(
      tagsDir,
      `kleros-tags-${explorer}-REMOVAL-${timestamp}.csv`
    );
    const csvContent = stringify(filteredRemovalItems, {
      header: true,
      columns: ["Address", "Nametag", "Website", "Public Note", "Chain ID"],
    });
    fs.writeFileSync(filePath, csvContent);
    console.log(`File written: ${filePath}`);
  }

  for (const explorer in groupedData) {
    const removalSet = removalSets[explorer];
    if (!removalSet || removalSet.size === 0) {
      continue;
    }
    const overlap = groupedData[explorer].filter((item) =>
      removalSet.has(item.Address?.toLowerCase() || "")
    );
    if (!overlap.length) {
      continue;
    }
    const filePath = path.join(
      tagsDir,
      `kleros-tags-${explorer}-UPDATE-${timestamp}.csv`
    );
    const csvContent = stringify(overlap, {
      header: true,
      columns: [
        "Address",
        "Nametag",
        "Website",
        "Public Note",
        "Chain ID",
      ],
    });
    fs.writeFileSync(filePath, csvContent);
    console.log(`File written: ${filePath}`);
  }
}

const resolvedArg = process.argv[1]
  ? path.resolve(process.argv[1])
  : null;
const isDirectExecution =
  resolvedArg !== null &&
  import.meta.url === pathToFileURL(resolvedArg).href;

if (isDirectExecution) {
  main().catch(console.error);
}
