# Kleros Etherscan GitHub Workflow

This repository contains scripts for processing and exporting Kleros tags and token data. The scripts interact with the Kleros Curate subgraph to retrieve and process data, which is then exported to CSV files for further analysis or use.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Individual Data Export](#individual-data-export)
    - [Exporting Tags](#exporting-tags)
    - [Exporting Tokens](#exporting-tokens)
  - [Batch Address Tag Query (ATQ)](#batch-address-tag-query-atq)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/kleros-etherscan-github-workflow.git
   cd kleros-etherscan-github-workflow
   ```

2. **Install dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   yarn install
   ```

3. **Compile TypeScript:**

   Compile the TypeScript files to JavaScript:

   ```bash
   tsc
   ```

## Usage

### Individual Data Export

These commands export data directly from the Kleros Curate subgraph.

#### Exporting Tags

To export Kleros tags, run the following command:

```bash
node dist/src/cli-individual-tags-export.js
```

This will generate CSV files in the `output/tags` directory, organized by explorer.

#### Exporting Tokens

To export Kleros tokens, run the following command:

```bash
node dist/src/cli-individual-tokens-export.js
```

This will generate CSV files in the `output/tokens` directory, organized by explorer.

### Batch Address Tag Query (ATQ)

The Address Tags Query (ATQ) process allows for batch retrieval of tags from multiple submodules.

#### Prerequisites

Before running the ATQ scripts, ensure you have:
- Git
- Node.js (Version 14 or higher recommended)
- Yarn package manager

#### Setup

1. **Create a .env file** with The Graph's API Key:
   ```
   THEGRAPH_API_KEY=your_api_key_here
   ```

2. **Make the scripts executable**:
   ```bash
   chmod +x 1_fetch.sh 2_pull_submodules.sh
   ```

#### Running the ATQ Process

1. **Fetch and update submodules**:
   ```bash
   ./1_fetch.sh && ./2_pull_submodules.sh
   ```

2. **Export tags to CSV in Etherscan format**:
   ```bash
   yarn build && yarn retrieve
   ```
   This will generate CSV files in the `dist/exports` directory.

3. **Combined workflow** (fetch, update, build, and export):
   ```bash
   ./1_fetch.sh && ./2_pull_submodules.sh && yarn build && yarn start
   ```

#### Testing a Specific Module

To test a specific ATQ module:
```bash
./atq_unit_test.sh <git repo URL> <commitID> <chainID>
```

Example:
```bash
./atq_unit_test.sh https://github.com/greentea135/aave-v3-tokens-atq-module.git 2b0edde 1
```

#### Counting Entries

To count the total number of contract tags retrieved:
```bash
find ./dist/exports -name "*.csv" -type f -exec sh -c 'total=0; for file do count=$(grep -c "" "$file"); echo "$file: $count lines"; total=$((total + count)); done; echo "Total: $total lines"' sh {} +
```

## Project Structure

- **src/**: Contains the source TypeScript files.

  - **cli-export.ts**: CLI script for exporting Kleros tags.
  - **cli-token-export.ts**: CLI script for exporting Kleros tokens.
  - **kleros-tag-processor.ts**: Processes Kleros tags.
  - **kleros-token-processor.ts**: Processes Kleros tokens.
  - **utils.ts**: Utility functions used across the project.
  - **3_export-to-csv-etherscan-v2.mts**: Script for batch exporting ATQ tags.

- **dist/**: Contains the compiled JavaScript files.

- **output/**: Directory where the individual export CSV files are saved.
  - **tags/**: Contains CSV files with Kleros tags data.
  - **tokens/**: Contains CSV files with Kleros tokens data.

- **dist/exports/**: Directory where the batch ATQ CSV files are saved.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.