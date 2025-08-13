/* eslint-disable prefer-const */
import { BigDecimal} from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph 
export const FACTORY_ADDRESS = '0xe34ee083B4154F2624ECCb9A80E188b83944c2d5'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x6d63b39017F379bfd0301293022581C6EF237a19'

export const REFERENCE_TOKEN = '0x04A21a38D5E275d6023B27504beB3095dC43B0C0' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0xfA0914a2aD95bC71C38C7235734EC3e501F3636a' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0x04A21a38D5E275d6023B27504beB3095dC43B0C0',
  '0x7e942605B5028E3B751dBB5Ef8afC5CF85a5A7eD', 
  '0x5aefba317baba46eaf98fd6f381d07673bca6467',
  '0x49A390A3DFD2D01389F799965F3AF5961F87D228' 
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0x7e942605B5028E3B751dBB5Ef8afC5CF85a5A7eD'
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0xC45E0e18A82670A6Dd1D19b5D6CC7a4314B3E07d'  

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x05F9E353559da6f2Bfe9A0980D5C3e84eA5d4238'
