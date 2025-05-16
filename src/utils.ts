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
  return chainIdToExplorer(number);
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

// Shared chain id to explorer mapping
export const CHAIN_ID_TO_EXPLORER: { [key: number]: string } = {
  1: "etherscan.io",
  10: "optimistic.etherscan.io",
  56: "bscscan.com",
  100: "gnosisscan.io",
  137: "polygonscan.com",
  8453: "basescan.org",
  42161: "arbiscan.io",
  1284: "moonscan.io",
  59144: "lineascan.build",
  250: "ftmscan.com",
  324: "era.zksync.network",
  1285: "moonriver.moonscan.io",
  43114: "snowscan.xyz",
  25: "cronoscan.com",
  199: "bttcscan.com",
  1101: "zkevm.polygonscan.com",
  1111: "wemixscan.com",
  534352: "scrollscan.com",
  42220: "celoscan.io",
  81457: "blastscan.io",
  146: "sonicscan.org",
};

export function chainIdToExplorer(chainId: number): string {
  return CHAIN_ID_TO_EXPLORER[chainId] || "Unknown ChainID";
}
