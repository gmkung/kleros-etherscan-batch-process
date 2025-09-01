import {
  getDataFromCurate,
  getExplorerNameBasedOnRichAddress,
  transformTagData,
} from "./utils.js";
import { Tag, RawTag } from "./types.js";
import dotenv from "dotenv";

dotenv.config();

const registry = "0x66260c69d03837016d88c9877e61e08ef74c59f2".toLowerCase();
const endpoint = process.env.THEGRAPH_API_KEY 
  ? `https://gateway.thegraph.com/api/${process.env.THEGRAPH_API_KEY}/subgraphs/id/9hHo5MpjpC1JqfD3BsgFnojGurXRHTrHWcUcZPPCo6m8`
  : "https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/v0.1.1";
const contractAddressField = "Contract Address"; // Configure the field name here

export async function processKlerosTags(
  customRegistry?: string,
  customEndpoint?: string
) {
  const data = await getDataFromCurate(
    customRegistry || registry,
    customEndpoint || endpoint
  );
  const groupedData: { [key: string]: Tag[] } = {};

  data.forEach((item) => {
    const contractAddress = item[contractAddressField];
    if (!contractAddress) {
      console.error("Item missing contract address field:", JSON.stringify(item, null, 2));
      return; // Skip this item
    }
    
    const transformedItem = transformTagData(item);
    const explorer = getExplorerNameBasedOnRichAddress(contractAddress);
    if (!groupedData[explorer]) {
      groupedData[explorer] = [];
    }
    groupedData[explorer].push(transformedItem);
  });

  return groupedData;
}
