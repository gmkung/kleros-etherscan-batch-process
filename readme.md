# Kleros Etherscan GitHub Workflow

This repository contains scripts for processing and exporting Kleros tags and token data. The scripts interact with the Kleros Curate subgraph to retrieve and process data, which is then exported to CSV files for further analysis or use.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Exporting Tags](#exporting-tags)
  - [Exporting Tokens](#exporting-tokens)
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
   npm install
   ```

3. **Compile TypeScript:**

   Compile the TypeScript files to JavaScript:

   ```bash
   npx tsc
   ```

## Usage

### Exporting Tags

To export Kleros tags, run the following command:

```bash
node dist/cli-export.js
```

This will generate CSV files in the `output/tags` directory, organized by explorer.

### Exporting Tokens

To export Kleros tokens, run the following command:

```bash
node dist/cli-token-export.js
```

This will generate CSV files in the `output/tokens` directory, organized by explorer.

## Project Structure

- **src/**: Contains the source TypeScript files.

  - **cli-export.ts**: CLI script for exporting Kleros tags.
  - **cli-token-export.ts**: CLI script for exporting Kleros tokens.
  - **kleros-tag-processor.ts**: Processes Kleros tags.
  - **kleros-token-processor.ts**: Processes Kleros tokens.
  - **utils.ts**: Utility functions used across the project.

- **dist/**: Contains the compiled JavaScript files.

- **output/**: Directory where the CSV files are saved.
  - **tags/**: Contains CSV files with Kleros tags data.
  - **tokens/**: Contains CSV files with Kleros tokens data.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
