import { getDataFromCurate, transformTokenData } from "./utils.js";
import { processKlerosTags } from "./kleros-tag-processor.js";

const registry = "0xee1502e29795ef6c2d60f8d7120596abe3bad990".toLowerCase();
const endpoint =
  "https://api.goldsky.com/api/public/project_cm5y7hx91t6zd01vzfnfchtf9/subgraphs/legacy-curate-gnosis/v1.1.4/gn";

export async function processTokens() {
  const tagData = await processKlerosTags();
  const data = await getDataFromCurate(registry, endpoint);
  const groupedData: { [key: string]: any[] } = {};

  data.forEach((item) => {
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
