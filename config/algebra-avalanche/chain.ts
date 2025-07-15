/* eslint-disable prefer-const */
import { BigDecimal} from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph 
export const FACTORY_ADDRESS = '0x512eb749541B7cf294be882D636218c84a5e9E5F'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x3fED017EC0f5517Cdf2E8a9a4156c64d74252146'

export const REFERENCE_TOKEN = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x41100C6D2c6920B10d12Cd8D59c8A9AA2eF56fC7' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x01A8A00A6fC8106B94f84aAbAef689Fd0D77271A'

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x05F9E353559da6f2Bfe9A0980D5C3e84eA5d4238'
