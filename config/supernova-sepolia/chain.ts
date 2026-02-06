/* eslint-disable prefer-const */
import { BigDecimal } from '@graphprotocol/graph-ts'

// Addresses for analytics subgraph
export const FACTORY_ADDRESS = '0x91338Bae259c467aCB5e09F0d734d69624b38D63'
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = '0x9A77766C2b722806982e25A843c1a63Be4d53772'

export const REFERENCE_TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14' // Wrapped Native Token
export const STABLE_TOKEN_POOL = '0x8F6B80999d31AF9d36DA5187085A95B5602Fedbb' // USDC/WETH pool

// Minimum reference token locked in pool for pricing calculations
export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('0')

// Token lists for tracking volume and liquidity
export const WHITELIST_TOKENS: string[] = [
  '0xBD3fA4dFCd97F8A9Ff0D6c92aa2a13953e88Af7f',
  '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  '0x513E40f940A24b248202F31e54EfEE4beC6f86b3',
  '0xD3093D9F0293820D2dA062178da08A1014b7aC2f',
  '0xC4CE1cd87bE5e40761Ee6224e8638C07f334daed',
  '0x62D5AE5062D39D210281a93A9B5eB610d6C4c18e',
  '0xF458c5A5485479599094f8283b4ffecF0ae6B3b4',
  '0xD248Efe6a3AfB97085798245fc7E86c2df9C743F',
  '0x471CD45F7fb0E0B605c8365EcFEA820a0a644cF8',
  '0x0D5B4D44f9436E4fA0883145E45De570F42Ffc0d',
  '0xC7C4095300eF04Ff01E9cBE6A7b5186fdF6Bb0c2',
  '0xfD0fba3F9058e8daB38e59BC9f8417393327F40B',
  '0xe259dB67FB6B2B7C8750B5917DcC0B8c95Bd468C',
  '0xc4340E3Aa5f1828aC1C98FFDF6fDd7E92Fb929c7',
  '0xcA45290C26aA51e40dfF0e5b23720f41C9654a69',
  '0xb2Ef7B653DbeD27E36c005091c6112F181E3b29a',
]

// Stable coins for USD pricing (tokens with stable $1 value)
export const STABLE_COINS: string[] = [
  '0xD3093D9F0293820D2dA062178da08A1014b7aC2f',
  '0xC4CE1cd87bE5e40761Ee6224e8638C07f334daed',
  '0x471CD45F7fb0E0B605c8365EcFEA820a0a644cF8',
]

// Addresses for farming subgraph
// Farming contracts
export const ETERNAL_FARMING_ADDRESS = '0xd6Ca86BF3FA1d43766f9cf1335C96fA8BEAb0122'

// Addresses for limit order subgraph
// Limit order contract
export const LIMIT_ORDER_ADDRESS = '0x05F9E353559da6f2Bfe9A0980D5C3e84eA5d4238'
export const EPOCH_FLIP_DURATION = 1800
