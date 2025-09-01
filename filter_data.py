import json

# Read the current data.json file
with open('data.json', 'r') as f:
    data = json.load(f)

# Define the failed items (chainId + commit combinations)
failed_items = [
    {"chainId": "1", "commit": "50c7a12"},      # uniswap-v3-pools
    {"chainId": "1", "commit": "ff0ce56"},      # uniswap-v2-pairs
    {"chainId": "100", "commit": "ca6428f"},    # aave-v3-tokens
    {"chainId": "56", "commit": "ca6428f"},     # aave-v3-tokens
    {"chainId": "8453", "commit": "8174f03"},   # aave-v3-tokens
    {"chainId": "1", "commit": "36ad7ca"},      # silo
    {"chainId": "42161", "commit": "02efa78"},  # karak-tokens
    {"chainId": "59144", "commit": "86f12cd"},  # zerolend-tokens
    {"chainId": "196", "commit": "86f12cd"},    # zerolend-tokens
    {"chainId": "1101", "commit": "17f14ad"},   # pancakeswap-v2-pools
    {"chainId": "1284", "commit": "e841ae4 "},  # sushiswap-v2-pools (note the trailing space)
]

print(f"Original data has {len(data)} items")

# Filter out the failed items
filtered_data = []
removed_count = 0

for item in data:
    is_failed = False
    for failed_item in failed_items:
        if item["chainId"] == failed_item["chainId"] and item["commit"] == failed_item["commit"]:
            is_failed = True
            print(f"Filtering out: chainId {item['chainId']}, commit {item['commit']}")
            removed_count += 1
            break
    
    if not is_failed:
        filtered_data.append(item)

print(f"Filtered data has {len(filtered_data)} items")
print(f"Removed {removed_count} items")

# Convert to JSON string and print
json_output = json.dumps(filtered_data, indent=2)
print("\nFiltered JSON:")
print(json_output)