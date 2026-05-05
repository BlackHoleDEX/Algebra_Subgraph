/* eslint-disable prefer-const */
import { BigDecimal } from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph
export const FACTORY_ADDRESS = '0xdA1dD379e97370BD3f03ea8340626324973aAc99'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x897198e83Cc3aD4a5bE8f9Ef98dDc4f585B3953a'
export const GAUGE_MANAGER_ADDRESS = '0x8152FF4dFF0fa036e8c8718Ed36e3f61D5263B73'

export const REFERENCE_TOKEN = '0xb3B3CbEd8243682845C2ff23Ea1FD48e6144E34F' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x6ac1efFa0F55A64D3bFb77a47fF1dA88C0f504D8' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0xb3B3CbEd8243682845C2ff23Ea1FD48e6144E34F',
  '0x0ea98bf8ff474639f6cbeb4c4bdd1ba74aa9a4a4',
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = ['0x0ea98bf8ff474639f6cbeb4c4bdd1ba74aa9a4a4']

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0x1C5E8C41B5B119dc8fc5ac8e53692E323a6D78D7'

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x05F9E353559da6f2Bfe9A0980D5C3e84eA5d4238'

export const EPOCH_FLIP_DURATION = 1800
