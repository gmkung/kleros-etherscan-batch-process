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
  const groupedAbsentData = await processKlerosTags({
    status: "Absent",
    minNumberOfRequests: 1,
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Ensure output and tags directories exist
  const outputDir = path.join(__dirname, "../output");
  const tagsDir = path.join(outputDir, "tags");
  const removalsDir = path.join(tagsDir, "removals");
  ensureDirectoryExists(outputDir);
  ensureDirectoryExists(tagsDir);
  ensureDirectoryExists(removalsDir);

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
  }

  for (const explorer in groupedAbsentData) {
    const removalItems = groupedAbsentData[explorer] || [];
    if (!removalItems.length) {
      continue;
    }
    const filePath = path.join(
      removalsDir,
      `kleros-tags-${explorer}-REMOVAL-${timestamp}.csv`
    );
    const csvContent = stringify(removalItems, {
      header: true,
      columns: ["Address", "Nametag", "Website", "Public Note", "Chain ID"],
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
