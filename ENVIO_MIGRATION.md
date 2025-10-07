# Envio Migration Summary

## Overview
All GraphQL queries in the codebase have been migrated to use **Envio by default** with The Graph as an optional fallback.

## Changes Made

### 1. **Centralized Toggle** (`src/utils.ts`)
- Added `USE_ENVIO` constant controlled by `process.env.USE_THEGRAPH`
- Default: Envio (when `USE_THEGRAPH !== "true"`)
- Single place to control all GraphQL queries

### 2. **Dual-Format Query Support** (`src/utils.ts`)
```typescript
// Envio format (default)
LItem(limit: 1000, offset: N, order_by: {...}, where: {_eq: ...})

// The Graph format (fallback)
litems(first: 1000, skip: N, where: {...})
```

### 3. **Updated Files**

#### `src/utils.ts`
- ✅ Dual query builder for Envio/The Graph
- ✅ Dual response parser (LItem vs litems)
- ✅ Dual metadata handling (flat props vs nested metadata.props)
- ✅ Changed pagination from skip → offset

#### `src/kleros-tag-processor.ts`
- ✅ Default endpoint: `https://indexer.hyperindex.xyz/1a2f51c/v1/graphql`
- ✅ Fallback to The Graph when `USE_THEGRAPH=true`

#### `src/kleros-token-processor.ts`
- ✅ Default endpoint: `https://indexer.hyperindex.xyz/1a2f51c/v1/graphql`
- ✅ Fallback to The Graph when `USE_THEGRAPH=true`

#### `1_fetch.sh`
- ✅ Already migrated (Envio by default)

### 4. **Environment Variable** (`.env`)
```bash
USE_THEGRAPH=false  # Default to Envio
THEGRAPH_API_KEY=...  # Only used if USE_THEGRAPH=true
```

## How to Toggle

### Use Envio (Default)
```bash
# In .env file
USE_THEGRAPH=false
# or simply omit/comment out USE_THEGRAPH
```

### Use The Graph
```bash
# In .env file
USE_THEGRAPH=true
THEGRAPH_API_KEY=your_api_key_here
```

## Query Differences

| Feature | The Graph | Envio |
|---------|-----------|-------|
| Entity | `litems` | `LItem` |
| Pagination | `first/skip` | `limit/offset` |
| Sorting | `orderBy/orderDirection` | `order_by: {field: asc}` |
| Filters | `field: value` | `field: {_eq: value}` |
| Metadata | Nested `metadata.props` | Flat `props` |
| Response path | `data.litems` | `data.LItem` |

## Testing Results

✅ **Tags Export**: Working via Envio
✅ **Tokens Export**: Working via Envio  
✅ **Batch Export**: Working via Envio (1_fetch.sh)
✅ **Dual Format**: Both Envio and The Graph queries work
✅ **Pagination**: Correctly handles offset-based pagination

## Benefits

1. **No API Key Required**: Envio is free, no authentication needed
2. **Better Performance**: Envio's Hasura-based indexer is faster
3. **Future-Proof**: Decentralized indexing without rate limits
4. **Backward Compatible**: The Graph still works as fallback
5. **Single Toggle Point**: One environment variable controls all queries

## Files with GraphQL Queries

1. ✅ `1_fetch.sh` - ATQ module entries (Envio default)
2. ✅ `src/utils.ts` - getDataFromCurate function (Envio default)
3. ✅ `src/kleros-tag-processor.ts` - Tag registry endpoint (Envio default)
4. ✅ `src/kleros-token-processor.ts` - Token registry endpoint (Envio default)

All submodule queries are handled within each submodule's code (not part of this repo).

