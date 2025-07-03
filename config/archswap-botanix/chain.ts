/* eslint-disable prefer-const */
import { BigDecimal} from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph 
export const FACTORY_ADDRESS = '0x57Fd247Ce7922067710452923806F52F4b1c2D34'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x4b5B0a7eC836325cdb2740EDE241aA7c727184C2'

export const REFERENCE_TOKEN = '0x0d2437f93fed6ea64ef01ccde385fb1263910c56' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x6Ca8C1B5cac47E2ff2AcC00aD2802CAa6417B7c3' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0.001')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  "0x0d2437f93fed6ea64ef01ccde385fb1263910c56", //wnative
  "0x29ee6138dd4c9815f46d34a4a1ed48f46758a402", // usdc.e
  "0x325eeb3aa50014f35861e3374f54b3997aa8357d" // usdc
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0x29ee6138dd4c9815f46d34a4a1ed48f46758a402', // usdc.e
  '0x325eeb3aa50014f35861e3374f54b3997aa8357d' // usdc
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x6Ed6Ee624a70c56dEaD8C91b11B8c4e602102Ee5'  

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x6Ed6Ee624a70c56dEaD8C91b11B8c4e602102Ee5'
