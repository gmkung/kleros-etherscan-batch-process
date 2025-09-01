# CSV Export Chunking Upgrade

## Overview
The main export script has been upgraded to automatically split large CSV exports into chunks of no more than 100,000 lines (including headers). This prevents issues with extremely large files and improves manageability.

## What Changed

### Main Export Script (`src/3_export-to-csv-etherscan-v2.mts`)
- Added `MAX_LINES_PER_FILE = 100000` constant
- New `splitDataIntoChunks()` function to divide data into manageable pieces
- New `writeCSVChunks()` function to handle file splitting logic
- Modified main export loop to use chunking instead of single file export

## How It Works

### File Naming Convention
- **Single files** (≤100k lines): `filename.csv`
- **Multiple chunks** (>100k lines): `filename-part001.csv`, `filename-part002.csv`, etc.

### Chunking Logic
- Maximum 99,999 data rows + 1 header row per file
- Each chunk includes the complete header row
- Chunks are numbered with 3-digit padding (001, 002, 003...)
- Only creates multiple files when necessary

### Example Output
For a dataset with 250,000 records:
```
kleros-batch-queried-tags-abc123-etherscan.io-2025-08-06-part001.csv (99,999 records)
kleros-batch-queried-tags-abc123-etherscan.io-2025-08-06-part002.csv (99,999 records)
kleros-batch-queried-tags-abc123-etherscan.io-2025-08-06-part003.csv (50,002 records)
```

## Benefits

1. **File Size Management**: No more files exceeding 100k lines
2. **Better Performance**: Smaller files are easier to process and transfer
3. **Improved Compatibility**: Works better with various CSV tools and applications
4. **Maintainability**: Easier to work with individual chunks for analysis
5. **Backward Compatibility**: Existing functionality preserved for small datasets

## Technical Details

### Constants
```typescript
const MAX_LINES_PER_FILE = 100000;
```

### Key Functions
- `splitDataIntoChunks<T>(data: T[], maxItemsPerChunk: number): T[][]`
- `writeCSVChunks(tags: RawTag[], baseFileName: string, exportsDir: string): Promise<void>`

### Build Process
- TypeScript files compiled to JavaScript in `dist/src/`
- Use `npm run build` to recompile after changes
- Main export script now includes chunking functionality

## Usage

The upgrade is transparent - existing scripts will continue to work as before, but now large exports will automatically be split into manageable chunks. No changes to existing workflows are required.

## Files Modified

1. `src/3_export-to-csv-etherscan-v2.mts` - Main batch export script
2. `dist/src/3_export-to-csv-etherscan-v2.mjs` - Compiled JavaScript version (updated via build)

## Testing

The chunking functionality has been tested with various dataset sizes:
- ✅ Small datasets (≤100k): Single file export
- ✅ Medium datasets (100k): Split into 2 files
- ✅ Large datasets (250k): Split into 3 files
- ✅ Very large datasets (350k): Split into 4 files
