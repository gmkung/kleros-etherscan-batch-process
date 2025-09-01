#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

interface DataItem {
  itemID: string;
  url: string;
  commit: string;
  chainId: string;
}

interface FailureItem {
  chainId: string;
  commit: string;
  dir: string;
  error: string;
}

interface SubmodulesReport {
  timestamp: string;
  totalProcessed: number;
  failedCount: number;
  failures: FailureItem[];
}

function filterDataByReport(dataPath: string, reportPath: string, outputPath: string, mode: 'failed' | 'successful' = 'failed'): void {
  try {
    // Read the current data.json
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const data: DataItem[] = JSON.parse(dataContent);
    
    // Read the submodules report
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const report: SubmodulesReport = JSON.parse(reportContent);
    
    // Create a set of failed combinations for fast lookup
    const failedCombinations = new Set(
      report.failures.map(failure => `${failure.chainId}:${failure.commit.trim()}`)
    );
    
    // Filter based on mode
    const filteredData = data.filter(item => {
      const key = `${item.chainId}:${item.commit.trim()}`;
      const isFailed = failedCombinations.has(key);
      return mode === 'failed' ? isFailed : !isFailed;
    });
    
    // Write the filtered data
    fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2));
    
    console.log(`Original items: ${data.length}`);
    console.log(`Failed items: ${report.failedCount}`);
    console.log(`Mode: ${mode} items`);
    console.log(`Filtered items: ${filteredData.length}`);
    console.log(`Filtered data written to: ${outputPath}`);
    
    // Log verification
    if (mode === 'failed' && filteredData.length !== report.failedCount) {
      console.warn(`Warning: Expected ${report.failedCount} failed items but found ${filteredData.length}`);
    }
    
  } catch (error) {
    console.error('Error filtering data:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node filter_data.mjs <report-path> [output-path] [mode]');
  console.log('  mode: "failed" (default) or "successful"');
  console.log('Example: node filter_data.mjs dist/logs/submodules-report-2025-08-05_16-59-57-684Z.json data.json failed');
  process.exit(1);
}

const reportPath = args[0];
const outputPath = args[1] || 'data.json';
const mode = (args[2] as 'failed' | 'successful') || 'failed';
const dataPath = 'data.json';

filterDataByReport(dataPath, reportPath, outputPath, mode);