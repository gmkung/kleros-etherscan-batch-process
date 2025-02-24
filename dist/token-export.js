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
import { getDataFromCurate, getExplorerNameBasedOnRichAddress, } from "./utils.js";
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registry = "0xee1502e29795ef6c2d60f8d7120596abe3bad990".toLowerCase();
const endpoint = "https://api.goldsky.com/api/public/project_cm5y7hx91t6zd01vzfnfchtf9/subgraphs/legacy-curate-gnosis/v1.1.4/gn";
const contractAddressField = "Address"; // Configure the field name here
function transformData(item) {
    const richAddress = item[contractAddressField];
    return {
        address: richAddress.split(":")[2],
        tokenName: item["Name"] || "",
        symbol: item["Symbol"] || "",
        imageUrl: "https://cdn.kleros.link" + item["Logo"] || "",
        tokenWebsite: "",
        tokenEmail: "",
        shortDescription: "",
        longDescription: "",
        publicNote: "",
        blog: "",
        github: "",
        reddit: "",
        telegram: "",
        slack: "",
        wechat: "",
        facebook: "",
        linkedin: "",
        xTwitter: "",
        discord: "",
        bitcointalk: "",
        whitepaper: "",
        ticketing: "",
        opensea: "",
        coingeckoTicker: "",
        coinmarketcapTicker: "",
        projectName: item["Name"] || "",
        explorer: getExplorerNameBasedOnRichAddress(richAddress),
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getDataFromCurate(registry, endpoint);
        const groupedData = {};
        data.forEach((item) => {
            const transformedItem = transformData(item);
            const explorer = transformedItem.explorer;
            if (!groupedData[explorer]) {
                groupedData[explorer] = [];
            }
            groupedData[explorer].push({
                "contract address": transformedItem.address,
                "token name": transformedItem.tokenName,
                symbol: transformedItem.symbol,
                "image url": transformedItem.imageUrl,
                "token website": transformedItem.tokenWebsite,
                "token email": transformedItem.tokenEmail,
                "short description": transformedItem.shortDescription,
                "long description": transformedItem.longDescription,
                "public note": transformedItem.publicNote,
                blog: transformedItem.blog,
                github: transformedItem.github,
                reddit: transformedItem.reddit,
                telegram: transformedItem.telegram,
                slack: transformedItem.slack,
                wechat: transformedItem.wechat,
                facebook: transformedItem.facebook,
                linkedin: transformedItem.linkedin,
                "x(twitter)": transformedItem.xTwitter,
                discord: transformedItem.discord,
                bitcointalk: transformedItem.bitcointalk,
                whitepaper: transformedItem.whitepaper,
                ticketing: transformedItem.ticketing,
                opensea: transformedItem.opensea,
                "coingecko ticker": transformedItem.coingeckoTicker,
                "coinmarketcap ticker": transformedItem.coinmarketcapTicker,
                "project name": transformedItem.projectName,
            });
        });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        for (const explorer in groupedData) {
            const filePath = path.join(__dirname, `../output/kleros-tokens-${explorer}-${timestamp}.csv`);
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
main().catch(console.error);
