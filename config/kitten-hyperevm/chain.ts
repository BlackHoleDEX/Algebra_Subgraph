/* eslint-disable prefer-const */
import { BigDecimal} from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph 
export const FACTORY_ADDRESS = '0x9CAa8F20B7CE0bD2D97F614a473A68ba6140970d'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x805F104051415863Bbdf458cDCd52ceB5FEd9c01'

export const REFERENCE_TOKEN = '0x5555555555555555555555555555555555555555' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x13e0ace1ee157f21a253DFEC9397E3A8025A5140' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0x5555555555555555555555555555555555555555',
  '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', 
  '0x5aefba317baba46eaf98fd6f381d07673bca6467',
  '0x49A390A3DFD2D01389F799965F3AF5961F87D228' 
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb'
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0xc8A85FD6511bf875646B3632Aedd60d5752610BC'  

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x0000000000000000000000000000000000000000'
