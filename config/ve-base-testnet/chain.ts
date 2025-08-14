/* eslint-disable prefer-const */
import { BigDecimal} from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph 
export const FACTORY_ADDRESS = '0xE4e7d1b09faE61B12F07EF86ED7eC590F1B6c6CF'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x07b10e41B97aC181143698964f7bBBb7969C3cC6'

export const REFERENCE_TOKEN = '0x4200000000000000000000000000000000000006' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x9eaA52647425A15f3Bd992cc94f2A9567D2a4743' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0x4200000000000000000000000000000000000006',
  '0xBfc131442fe1eA6c7912d40fb4df68b792128ae1', 
  '0xaff9ae92Ef4362117D64fE51C20011a6EE456815',
  '0xba59071d5804E1EdD1E871b895dDC1dc3692dA22' 
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xBfc131442fe1eA6c7912d40fb4df68b792128ae1'
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x3f8350ae86E7ABbE67B1f5Fd1CA6E85c309d4e21'  

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x822ddb9EECc3794790B8316585FebA5b8F7C7507'
