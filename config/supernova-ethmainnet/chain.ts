/* eslint-disable prefer-const */
import { BigDecimal } from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph
export const FACTORY_ADDRESS = '0x44B7fBd4D87149eFa5347c451E74B9FD18E89c55'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x00d5BbD0Fe275EFEE371a2B34d0a4b95B0C8aaaa'

export const REFERENCE_TOKEN = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x6ac1efFa0F55A64D3bFb77a47fF1dA88C0f504D8' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x00Da8466B296E382E5Da2Bf20962D0cB87200c78', // NOVA
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x1e862624EdA92B8Fe532c16253356d17dd70A337'

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x05F9E353559da6f2Bfe9A0980D5C3e84eA5d4238'
export const EPOCH_FLIP_DURATION = 7 * 86400 // 7 days
