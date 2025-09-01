import { promises as fs } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Tag, RawTag } from "./types.js";
import { transformTagData, chainIdToExplorer } from "./utils.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUBMODULES_DIR = join(__dirname, "../../submodules");
const DATA_FILE = join(__dirname, "../../data.json");
const EXPORTS_DIR = join(__dirname, "../batch_exports/tags");
const LOGS_DIR = join(__dirname, "../logs");

// Maximum lines per file (including header)
const MAX_LINES_PER_FILE = 100000;

interface SubmoduleData {
  url: string;
  commit: string;
  chainId: number;
}

interface FailedSubmodule {
  chainId: number;
  commit: string;
  dir: string;
  error: string;
}

function getCurrentUTCDateForSheets(): string {
  return new Date().toISOString().split("T")[0];
}

function jsonToCSV(items: RawTag[]): string {
  const header = Object.keys(transformTagData(items[0])) as (keyof Tag)[];

  const rows = items.map((item) => {
    const transformed = transformTagData(item);
    return header
      .map((col) => JSON.stringify(transformed[col] || ""))
      .join(",");
  });

  return [header.join(","), ...rows].join("\r\n");
}

function splitDataIntoChunks<T>(data: T[], maxItemsPerChunk: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += maxItemsPerChunk) {
    chunks.push(data.slice(i, i + maxItemsPerChunk));
  }
  return chunks;
}

async function writeCSVChunks(
  tags: RawTag[],
  baseFileName: string,
  exportsDir: string
): Promise<void> {
  const header = Object.keys(transformTagData(tags[0])) as (keyof Tag)[];
  const maxDataRowsPerChunk = MAX_LINES_PER_FILE - 1; // -1 for header
  
  if (tags.length <= maxDataRowsPerChunk) {
    // Single file - no splitting needed
    const csv = jsonToCSV(tags);
    await fs.writeFile(join(exportsDir, baseFileName), csv);
    console.log(`Tags have been written to ${baseFileName}`);
  } else {
    // Split into multiple files
    const chunks = splitDataIntoChunks(tags, maxDataRowsPerChunk);
    const totalChunks = chunks.length;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkNumber = i + 1;
      const suffix = totalChunks > 1 ? `-part${chunkNumber.toString().padStart(3, '0')}` : '';
      const chunkFileName = baseFileName.replace('.csv', `${suffix}.csv`);
      
      const csv = [header.join(","), ...chunk.map((item) => {
        const transformed = transformTagData(item);
        return header
          .map((col) => JSON.stringify(transformed[col] || ""))
          .join(",");
      })].join("\r\n");
      
      await fs.writeFile(join(exportsDir, chunkFileName), csv);
      console.log(`Tags chunk ${chunkNumber}/${totalChunks} written to ${chunkFileName} (${chunk.length} records)`);
    }
    
    console.log(`Total: ${tags.length} tags split into ${totalChunks} files`);
  }
}

async function fetchAndProcessSubmodules() {
  try {
    const data: SubmoduleData[] = JSON.parse(
      await fs.readFile(DATA_FILE, "utf-8")
    );

    await fs.mkdir(EXPORTS_DIR, { recursive: true });
    await fs.mkdir(LOGS_DIR, { recursive: true });

    const failedSubmodules: FailedSubmodule[] = [];

    for (const { url, commit, chainId } of data) {
      try {
        new URL(url);
      } catch (e) {
        console.log(`Invalid URL format: ${url} - skipping...`);
        failedSubmodules.push({
          chainId,
          commit,
          dir: url,
          error: `Invalid URL format: ${
            e instanceof Error ? e.message : String(e)
          }`,
        });
        continue;
      }

      const DIR_NAME = `${basename(url, ".git")}-${commit}`;
      const modulePath = join(SUBMODULES_DIR, DIR_NAME, "dist", "main.mjs");

      try {
        const submoduleImport = await import(modulePath);
        const tags = await submoduleImport.returnTags(
          chainId.toString(),
          process.env.THEGRAPH_API_KEY
        );
        // console.log("Tags: ", tags); // Commented out to avoid printing large data to console
        if (Array.isArray(tags) && tags.length > 0) {
          console.log(__dirname);
          const explorer = chainIdToExplorer(chainId);
          const datetime = getCurrentUTCDateForSheets();
          const baseFileName = `kleros-batch-queried-tags-${commit}-${explorer}-${datetime}.csv`;
          
          await writeCSVChunks(tags, baseFileName, EXPORTS_DIR);
        }
      } catch (error) {
        console.error(`Error in processing submodule ${DIR_NAME}:`);
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Stack trace:", error.stack);
        }
        if (typeof error === "object" && error !== null) {
          console.error(
            "Full error object:",
            JSON.stringify(error, Object.getOwnPropertyNames(error))
          );
        }
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          console.error("Error response:", JSON.stringify(error.response));
        }
        failedSubmodules.push({
          chainId,
          commit,
          dir: DIR_NAME,
          error:
            error instanceof Error
              ? `${error.name}: ${error.message}`
              : `Unknown error: ${JSON.stringify(error)}`,
        });
      }
    }

    const date = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")
      .join("_");
    const logFile = join(LOGS_DIR, `submodules-report-${date}.json`);
    await fs.writeFile(
      logFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalProcessed: data.length,
          failedCount: failedSubmodules.length,
          failures: failedSubmodules,
        },
        null,
        2
      )
    );
    console.log(`Processing report has been logged to ${logFile}`);
  } catch (error) {
    console.error("Error in fetchAndProcessSubmodules:", error);
  }
}

fetchAndProcessSubmodules();
