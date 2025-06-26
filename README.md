# Algebra Subgraph

This repository contains subgraphs for the Algebra Protocol, supporting multi-network deployments with a unified configuration system.

## Available Subgraphs

- **analytics** - Core Algebra protocol analytics (pools, swaps, liquidity, etc.)
- **farming** - Algebra farming protocol events and positions
- **blocks** - Block data indexing
- **limits** - Limit order protocol events

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Network

Create network configuration files in `config/<project-name-network>/`, e.g. 'clamm-base-sepolia':

**config/project-name-network/config.json:**
```json
{
  "network": "network",
  "startBlock": 12345678
}
```

**config/network/chain.ts:**

Update all contract addresses according to the deployed contracts
Update the list of tokens that will be used for pricing 

### 3. Prepare Network Configuration

```bash
# Prepare configuration
yarn prepare-network '<project-name-network>'
```

This will:
- Generate `subgraph.yaml` files for all subgraphs
- Copy network-specific chain configuration
- Normalize all addresses to lowercase

### 4. Build Subgraphs

Build subgraphs:
```bash
# Build specific subgraph
yarn build-subgraph analytics

# Or build all subgraphs
yarn build-all
```

### 5. Deploy Subgraphs

#### Deploy to The Graph Studio

First, create your subgraph at https://thegraph.com/studio/

Then authenticate with The Graph Studio:
```bash
# Authenticate with your deploy key
yarn graph auth --studio <DEPLOY_KEY>
```

Then deploy your subgraph:
```bash
# Deploy subgraph (use the subgraph name from Studio)
yarn deploy-subgraph analytics studio your-subgraph-name --access-token YOUR_ACCESS_TOKEN

# Examples
yarn deploy-subgraph analytics studio algebra-analytics-polygon
yarn deploy-subgraph farming studio algebra-farming-polygon --access-token YOUR_TOKEN
```

#### Deploy to Custom Graph Node

```bash
# Deploy to custom endpoint
yarn deploy-subgraph analytics custom your-subgraph-name \
  --node http://your-graph-node:8020 \
  --ipfs http://your-ipfs:5001 \
  --access-token YOUR_TOKEN
```

## Network Configuration Tips

1. **Start Block**: Use the block number when the factory contract was deployed
2. **Reference Token**: Should be the most liquid token (usually native token)
3. **Stable Token Pool**: Use the highest liquidity stable/native token pool for USD pricing
4. **Whitelist Tokens**: Include major tokens for volume/liquidity tracking
5. **Stable Coins**: Include all stable coins for accurate USD pricing