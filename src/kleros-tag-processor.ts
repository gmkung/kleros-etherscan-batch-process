import {
  getDataFromCurate,
  getExplorerNameBasedOnRichAddress,
  transformTagData,
} from "./utils.js";
import { Tag, RawTag } from "./types.js";
import dotenv from "dotenv";

dotenv.config({ override: false });

const registry = "0x66260c69d03837016d88c9877e61e08ef74c59f2".toLowerCase();

// Default to Envio, use The Graph only if USE_THEGRAPH=true
const endpoint =
  process.env.USE_THEGRAPH === "true" && process.env.THEGRAPH_API_KEY
    ? `https://gateway.thegraph.com/api/${process.env.THEGRAPH_API_KEY}/subgraphs/id/9hHo5MpjpC1JqfD3BsgFnojGurXRHTrHWcUcZPPCo6m8`
    : "https://indexer.hyperindex.xyz/1a2f51c/v1/graphql";

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
      console.error(
        "Item missing contract address field:",
        JSON.stringify(item, null, 2)
      );
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
