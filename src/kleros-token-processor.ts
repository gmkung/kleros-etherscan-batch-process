import {
  getDataFromCurate,
  transformTokenData,
  CurateQueryOptions,
} from "./utils.js";
import { processKlerosTags } from "./kleros-tag-processor.js";
import dotenv from "dotenv";

dotenv.config({ override: false });

const registry = "0xee1502e29795ef6c2d60f8d7120596abe3bad990".toLowerCase();

// Default to Envio, use The Graph only if USE_THEGRAPH=true
const endpoint =
  process.env.USE_THEGRAPH === "true" && process.env.THEGRAPH_API_KEY
    ? `https://gateway.thegraph.com/api/${process.env.THEGRAPH_API_KEY}/subgraphs/id/9hHo5MpjpC1JqfD3BsgFnojGurXRHTrHWcUcZPPCo6m8`
    : "https://indexer.hyperindex.xyz/1a2f51c/v1/graphql";

const contractAddressField = "Address"; // Configure the field name here

export async function processTokens(options: CurateQueryOptions = {}) {
  const tagData = await processKlerosTags();
  const data = await getDataFromCurate(registry, endpoint, options);
  const groupedData: { [key: string]: any[] } = {};
  const minNumberOfRequests = options.minNumberOfRequests;

  data.forEach((item) => {
    if (
      typeof minNumberOfRequests === "number" &&
      Number(item.numberOfRequests ?? 0) <= minNumberOfRequests
    ) {
      return;
    }

    // Skip items without the required Address field
    if (!item[contractAddressField]) {
      console.warn(
        "Skipping item without Address field:",
        JSON.stringify(item, null, 2)
      );
      return;
    }

    const transformedItem = transformTokenData(item, tagData);
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
      chainid: transformedItem.chainid,
    });
  });

  return groupedData;
}
