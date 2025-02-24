import {
  getDataFromCurate,
  getExplorerNameBasedOnRichAddress,
} from "./utils.js";
import { processKlerosTags } from "./kleros-tag-processor.js";

const registry = "0xee1502e29795ef6c2d60f8d7120596abe3bad990".toLowerCase();
const endpoint =
  "https://api.goldsky.com/api/public/project_cm5y7hx91t6zd01vzfnfchtf9/subgraphs/legacy-curate-gnosis/v1.1.4/gn";
const contractAddressField = "Address"; // Configure the field name here

// Define an interface for the expected structure of tagInfo
interface TagInfo {
  Website?: string;
  "Short Description"?: string;
  "Public Note"?: string;
  Nametag?: string;
}

function transformData(item: any, tagData: { [key: string]: any[] }) {
  const richAddress = item[contractAddressField];
  const address = richAddress.split(":")[2];
  const explorer = getExplorerNameBasedOnRichAddress(richAddress);
  let tagInfo: TagInfo = {};

  // Use the explorer to find the tag info for the current address
  const explorerData = tagData[explorer] || [];
  const foundTag = explorerData.find((tag: any) => tag.Address === address);
  if (foundTag) {
    tagInfo = foundTag as TagInfo; // Use type assertion here
  }

  return {
    address,
    tokenName: item["Name"] || "",
    symbol: item["Symbol"] || "",
    imageUrl: "https://cdn.kleros.link" + item["Logo"] || "",
    tokenWebsite: tagInfo.Website || "",
    tokenEmail: "",
    shortDescription: tagInfo["Short Description"] || "",
    longDescription: tagInfo["Short Description"] || "",
    publicNote: tagInfo["Public Note"] || "",
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
    projectName: tagInfo.Nametag || item["Name"] || "",
    explorer,
  };
}

export async function processTokens() {
  const tagData = await processKlerosTags();
  const data = await getDataFromCurate(registry, endpoint);
  const groupedData: { [key: string]: any[] } = {};

  data.forEach((item) => {
    const transformedItem = transformData(item, tagData);
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

  return groupedData;
}
