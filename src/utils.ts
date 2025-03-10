import axios from "axios";

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
