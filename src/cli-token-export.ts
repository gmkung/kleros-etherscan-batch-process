import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stringify } from "csv-stringify/sync";
import { processTokens } from "./kleros-token-processor.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportTokenData() {
  const groupedData = await processTokens();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  for (const explorer in groupedData) {
    const filePath = path.join(
      __dirname,
      `../output/tokens/kleros-tokens-${explorer}-${timestamp}.csv`
    );
    const csvContent = stringify(groupedData[explorer], {
      header: true,
      columns: [
        "contract address",
        "token name",
        "symbol",
        "image url",
        "token website",
        "token email",
        "short description",
        "long description",
        "public note",
        "blog",
        "github",
        "reddit",
        "telegram",
        "slack",
        "wechat",
        "facebook",
        "linkedin",
        "x(twitter)",
        "discord",
        "bitcointalk",
        "whitepaper",
        "ticketing",
        "opensea",
        "coingecko ticker",
        "coinmarketcap ticker",
        "project name",
      ],
    });
    fs.writeFileSync(filePath, csvContent);
    console.log(`File written: ${filePath}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  exportTokenData().catch(console.error);
}
