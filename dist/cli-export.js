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
import { processKlerosTags } from "./kleros-tag-processor.js";
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const groupedData = yield processKlerosTags();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        for (const explorer in groupedData) {
            const filePath = path.join(__dirname, `../output/tags/kleros-tags-${explorer}-${timestamp}.csv`);
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
    });
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
