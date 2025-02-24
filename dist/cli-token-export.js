var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stringify } from "csv-stringify/sync";
import { processTokens } from "./kleros-token-processor.js";
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function exportTokenData() {
    return __awaiter(this, void 0, void 0, function* () {
        const groupedData = yield processTokens();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        for (const explorer in groupedData) {
            const filePath = path.join(__dirname, `../output/tokens/kleros-tokens-${explorer}-${timestamp}.csv`);
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
    });
}
if (import.meta.url === `file://${process.argv[1]}`) {
    exportTokenData().catch(console.error);
}
