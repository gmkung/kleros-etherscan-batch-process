import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stringify } from "csv-stringify/sync";
import { processKlerosTags } from "./kleros-tag-processor.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const groupedData = await processKlerosTags();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  for (const explorer in groupedData) {
    const filePath = path.join(
      __dirname,
      `../output/tags/kleros-tags-${explorer}-${timestamp}.csv`
    );
    const csvContent = stringify(groupedData[explorer], {
      header: true,
      columns: [
        "Address",
        "Nametag",
        "Website",
        "Short Description",
        "Public Note",
      ],
    });
    fs.writeFileSync(filePath, csvContent);
    console.log(`File written: ${filePath}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 