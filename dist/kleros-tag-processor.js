var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getDataFromCurate, getExplorerNameBasedOnRichAddress, } from "./utils.js";
const registry = "0x66260c69d03837016d88c9877e61e08ef74c59f2".toLowerCase();
const endpoint = "https://api.goldsky.com/api/public/project_cm5y7hx91t6zd01vzfnfchtf9/subgraphs/legacy-curate-gnosis/v1.1.4/gn";
const contractAddressField = "Contract Address"; // Configure the field name here
function transformData(item) {
    const richAddress = item[contractAddressField];
    return {
        address: richAddress.split(":")[2],
        nametag: `${item["Project Name"].trim()}: ${item["Public Name Tag"].trim()}`,
        website: item["UI/Website Link"],
        shortDescription: item["Public Name Tag"].trim(),
        publicNote: item["Public Note"],
        explorer: getExplorerNameBasedOnRichAddress(richAddress),
    };
}
export function processKlerosTags(customRegistry, customEndpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getDataFromCurate(customRegistry || registry, customEndpoint || endpoint);
        const groupedData = {};
        data.forEach((item) => {
            const transformedItem = transformData(item);
            const explorer = transformedItem.explorer;
            if (!groupedData[explorer]) {
                groupedData[explorer] = [];
            }
            groupedData[explorer].push({
                Address: transformedItem.address,
                Nametag: transformedItem.nametag,
                Website: transformedItem.website,
                "Short Description": transformedItem.shortDescription,
                "Public Note": transformedItem.publicNote,
            });
        });
        return groupedData;
    });
}
