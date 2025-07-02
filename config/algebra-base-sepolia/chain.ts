/* eslint-disable prefer-const */
import { BigDecimal} from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph 
export const FACTORY_ADDRESS = '0xcD58521ecaC7724d1752F941C56490c27bAe9ab0'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x5baD56bfBABEC1A5A7848399762f54566FA22557'

export const REFERENCE_TOKEN = '0x4200000000000000000000000000000000000006' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x6ac1efFa0F55A64D3bFb77a47fF1dA88C0f504D8' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0x4200000000000000000000000000000000000006',
  '0xABAC6F23FDF1313FC2E9C9244F666157CCD32990', 
  '0x5aefba317baba46eaf98fd6f381d07673bca6467',
  '0x49A390A3DFD2D01389F799965F3AF5961F87D228' 
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xabac6f23fdf1313fc2e9c9244f666157ccd32990'
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x1C5E8C41B5B119dc8fc5ac8e53692E323a6D78D7'  

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x05F9E353559da6f2Bfe9A0980D5C3e84eA5d4238'
