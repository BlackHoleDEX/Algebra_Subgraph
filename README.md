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

**config/project-name-network/chain.ts:**

Update all analytics contract addresses 
```typescript
import { BigDecimal } from '@graphprotocol/graph-ts'

export const FACTORY_ADDRESS = '0x5E4F01767A1068C5570c29fDF9bf743b0Aa637d7'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x9ea4459c8defbf561495d95414b9cf1e2242a3e2'
```

Update the list of tokens that will be used for pricing
```typescript
export const REFERENCE_TOKEN = '0x4200000000000000000000000000000000000006' // Wrapped ETH
export const STABLE_TOKEN_POOL = '0x47e8ca40666102ac217286e51660a4e6e6d7f9a3' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0x4200000000000000000000000000000000000006', // WETH
  '0xABAC6F23FDF1313FC2E9C9244F666157CCD32990' // USDC
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xABAC6F23FDF1313FC2E9C9244F666157CCD32990' // USDC
]
```

If you will use farming or limit orders also update
```typescript
// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x0000000000000000000000000000000000000000'  

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x822ddb9EECc3794790B8316585FebA5b8F7C7507'
```

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
yarn graph auth <DEPLOY_KEY>
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

#### Deploy to Goldsky

```bash
# Deploy to goldsky
goldsky subgraph deploy your-subgraph-name --path ./subgraphs/analytics

# Examples
goldsky subgraph deploy blocks/v1.0.0 --path ./subgraphs/blocks
```

## Network Configuration Tips

1. **Start Block**: Use the block number when the factory contract was deployed
2. **Reference Token**: Should be the most liquid token (usually native token)
3. **Stable Token Pool**: Use the highest liquidity stable/native token pool for USD pricing
4. **Whitelist Tokens**: Include major tokens for volume/liquidity tracking
5. **Stable Coins**: Include all stable coins for accurate USD pricing