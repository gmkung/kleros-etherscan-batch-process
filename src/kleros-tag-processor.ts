import {
  getDataFromCurate,
  getExplorerNameBasedOnRichAddress,
  transformData,
} from "./utils.js";
import { Tag, RawTag } from "./types.js";

const registry = "0x66260c69d03837016d88c9877e61e08ef74c59f2".toLowerCase();
const endpoint =
  "https://api.goldsky.com/api/public/project_cm5y7hx91t6zd01vzfnfchtf9/subgraphs/legacy-curate-gnosis/v1.1.4/gn";
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
    const transformedItem = transformData(item);
    const explorer = getExplorerNameBasedOnRichAddress(
      item[contractAddressField]
    );
    if (!groupedData[explorer]) {
      groupedData[explorer] = [];
    }
    groupedData[explorer].push(transformedItem);
  });

  return groupedData;
}
