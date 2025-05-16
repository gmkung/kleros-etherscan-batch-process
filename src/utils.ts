import axios from "axios";
import { Tag, RawTag, Token, RawToken } from "./types.js";

export async function getDataFromCurate(registry: string, endpoint: string) {
  let skip = 0;
  const dataArray: any[] = [];

  while (true) {
    const query = `
      {litems(first: 1000, skip: ${skip}, where:{status: Registered, registryAddress:"${registry}"}) {
        itemID
        latestRequestSubmissionTime
        metadata{
          props {
            type
            label
            value
          }
        }
      }
    }`;

    const response = await axios.post(endpoint, { query });
    const data = response.data.data.litems;
    if (data.length === 0) break;

    data.forEach((litem: any) => {
      try {
        const flattenedItem: any = {
          itemID: litem.itemID,
          latestRequestSubmissionTime: litem.latestRequestSubmissionTime,
        };

        if (litem.metadata && Array.isArray(litem.metadata.props)) {
          litem.metadata.props.forEach((prop: any) => {
            flattenedItem[prop.label] = prop.value;
          });
        }

        dataArray.push(flattenedItem);
      } catch (error) {
        console.error("Error processing item:", litem, error);
      }
    });

    skip += 1000;
  }

  return dataArray;
}

export function getExplorerNameBasedOnRichAddress(richAddress: string) {
  if (richAddress.startsWith("solana")) {
    return "solana";
  }

  const match = richAddress.match(/eip155:(\d+):/);
  if (!match) return "Invalid address format";

  const number = parseInt(match[1], 10);
  switch (number) {
    case 1:
      return "etherscan.io";
    case 10:
      return "optimistic.etherscan.io";
    case 56:
      return "bscscan.com";
    case 100:
      return "gnosisscan.io";
    case 137:
      return "polygonscan.com";
    case 8453:
      return "basescan.org";
    case 42161:
      return "arbiscan.io";
    case 1284:
      return "moonscan.io";
    case 59144:
      return "lineascan.build";
    case 250:
      return "ftmscan.com";
    case 324:
      return "era.zksync.network";
    case 1285:
      return "moonriver.moonscan.io";
    case 43114:
      return "snowscan.xyz";
    case 25:
      return "cronoscan.com";
    case 199:
      return "bttcscan.com";
    case 1101:
      return "zkevm.polygonscan.com";
    case 1111:
      return "wemixscan.com";
    case 534352:
      return "scrollscan.com";
    case 42220:
      return "celoscan.io";
    case 81457:
      return "blastscan.io";
    case 146:
      return "sonicscan.org";
    default:
      return "Unknown chainId";
  }
}

export function getCurrentUTCDateForSheets() {
  const now = new Date();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = now.getUTCDate().toString().padStart(2, "0");
  const year = now.getUTCFullYear();
  const hours = now.getUTCHours().toString().padStart(2, "0");
  const minutes = now.getUTCMinutes().toString().padStart(2, "0");
  return `${month}/${day}/${year} ${hours}:${minutes} UTC`;
}

// Generic function to parse address from rich address string (for tokens/ATQ)
export function parseAddressFromRichAddress(richAddress: string): string {
  if (richAddress.startsWith("solana")) {
    return richAddress.split(":")[2];
  } else if (richAddress.startsWith("eip155")) {
    return richAddress.split(":")[2];
  } else {
    return "Unknown chain";
  }
}

// Generic function to parse chain id from rich address string (for tokens/ATQ)
export function parseChainIdFromRichAddress(richAddress: string): string {
  if (richAddress.startsWith("solana")) {
    return "solana";
  } else if (richAddress.startsWith("eip155")) {
    return richAddress.split(":")[1];
  } else {
    return "Unknown chain";
  }
}

export function transformTagData(item: RawTag): Tag {
  // Create the full nametag
  const projectName = item["Project Name"].trim();
  const publicNameTag = item["Public Name Tag"].trim();
  const fullNametag = `${projectName}: ${publicNameTag}`;

  // Truncate nametag if it exceeds 80 characters, ensuring project name ends with ...
  let nametag = fullNametag;
  if (fullNametag.length > 80) {
    // Calculate available space for project name (accounting for ": " and public name tag)
    const availableSpace = 80 - (publicNameTag.length + 2); // +2 for ": "
    if (availableSpace > 3) {
      // Need at least 3 chars for "..."
      const truncatedProjectName =
        projectName.substring(0, availableSpace - 3) + "...";
      nametag = `${truncatedProjectName}: ${publicNameTag}`;
    } else {
      // If we can't fit even a minimal project name, just use the public name tag
      nametag = publicNameTag.substring(0, 80);
    }
  }

  // Format public note with Kleros attribution
  const publicNote = item["Public Note"] || "";
  const attribution =
    'This nametag was submitted by <a href="https://klerosscout.eth.limo" target="_blank" rel="nofollow">Kleros Scout</a>.';
  const formattedPublicNote = publicNote
    ? `${publicNote}${!/[.!?]$/.test(publicNote) ? ". " : " "}${attribution}`
    : attribution;

  return {
    Address: parseAddressFromRichAddress(item["Contract Address"]),
    Nametag: nametag,
    Website: item["UI/Website Link"],
    "Public Note": formattedPublicNote,
    "Chain ID": parseChainIdFromRichAddress(item["Contract Address"]),
  };
}

// Token transformation function (moved from kleros-token-processor.ts)
export function transformTokenData(
  item: RawToken,
  tagData: { [key: string]: any[] }
): Token {
  const contractAddressField = "Address";
  const richAddress = item[contractAddressField];
  const address = parseAddressFromRichAddress(richAddress);
  const chainid = parseChainIdFromRichAddress(richAddress);
  const explorer = getExplorerNameBasedOnRichAddress(richAddress);
  let tagInfo: any = {};

  // Use the explorer to find the tag info for the current address
  const explorerData = tagData[explorer] || [];
  const foundTag = explorerData.find((tag: any) => tag.Address === address);
  if (foundTag) {
    tagInfo = foundTag;
  }
  if (item["Website"]) {
    console.log(item["Website"]);
  }
  return {
    address,
    tokenName: item["Name"] || "",
    symbol: item["Symbol"] || "",
    imageUrl: "https://cdn.kleros.link" + item["Logo"] || "",
    tokenWebsite: item["Website"] || tagInfo.Website || "",
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
    chainid,
  };
}
