/* eslint-disable prefer-const */
import { ONE_BD, ZERO_BD, ZERO_BI } from './constants'
import { Bundle, Pool, Token } from './../types/schema'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { exponentToBigDecimal, safeDiv } from '../utils/index'

const WMatic_ADDRESS = '0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7'
const USDC_WMatic_03_POOL = '0xf89c918f0ee8a2f752fedcca012acf930bda2905'

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export let WHITELIST_TOKENS: string[] = [
  "0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7",
  "0xb75d0b03c06a926e488e2659df1a861f860bd3d1",
  "0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1",
  "0x5cf6826140c1c56ff49c808a1a75407cd1df9423",
  "0x51121bcae92e302f19d06c193c95e1f7b81a444b",
  "0x160345fc359604fc6e70e3c5facbde5f7a9342d8",
  "0x0555e30da8f98308edb960aa94c0db47230d2b9c",
  "0x37a4dd9ced2b19cfe8fac251cd727b5787e45269",
  "0x059a6b0ba116c63191182a0956cf697d0d2213ec",
  "0x541fd749419ca806a8bc7da8ac23d346f2df8b77",
  "0x9151434b16b9763660705744891fa906f660ecc5",
  "0x5f0e07dfee5832faa00c63f2d33a0d79150e8598",
  "0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1",
  "0xf9bdbf259ece5ae17e29bf92eb7abd7b8b465db9",
  "0x80eede496655fb9047dd39d9f418d5483ed600df",
  "0x93919784c523f39cacaa98ee0a9d96c3f32b593e",
  "0x9bfa177621119e64cecbeabe184ab9993e2ef727"
]

let MINIMUM_Matic_LOCKED = BigDecimal.fromString('500')

let Q192 = Math.pow(2, 192)

let STABLE_COINS: string[] = [
  '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1', // USDC
  '0x9151434b16b9763660705744891fA906F660EcC5', // SUDT
  '0x059a6b0ba116c63191182a0956cf697d0d2213ec'
]


export function priceToTokenPrices(price: BigInt, token0: Token, token1: Token): BigDecimal[] {
  let num = price.times(price).toBigDecimal()
  let denom = BigDecimal.fromString(Q192.toString())
  let price1 = num
    .div(denom)
    .times(exponentToBigDecimal(token0.decimals))
    .div(exponentToBigDecimal(token1.decimals))

  let price0 = safeDiv(BigDecimal.fromString('1'), price1)
  return [price0, price1]
}

export function getEthPriceInUSD(): BigDecimal {
  let usdcPool = Pool.load(USDC_WMatic_03_POOL) // dai is token0
  if (usdcPool !== null) {
    return usdcPool.token0Price
  } else {
    return ZERO_BD
  }
} 


/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived Matic (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WMatic_ADDRESS) {
    return ONE_BD
  }
  let whiteList = token.whitelistPools
  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let largestLiquidityMatic = ZERO_BD
  let priceSoFar = ZERO_BD
  let bundle = Bundle.load('1')

  // hardcoded fix for incorrect rates
  // if whitelist includes token - get the safe price
  if (STABLE_COINS.includes(token.id)) {
    priceSoFar = safeDiv(ONE_BD, bundle!.maticPriceUSD)
  } else {
  for (let i = 0; i < whiteList.length; ++i) {
    let poolAddress = whiteList[i]
    let pool = Pool.load(poolAddress)!
    if (pool.liquidity.gt(ZERO_BI)) {

      if (pool.token0 == token.id) {
        // whitelist token is token1
        let token1 = Token.load(pool.token1)!
        // get the derived Matic in pool
        let maticLocked = pool.totalValueLockedToken1.times(token1.derivedMatic)
        if (maticLocked.gt(largestLiquidityMatic) && maticLocked.gt(MINIMUM_Matic_LOCKED)) {
          largestLiquidityMatic = maticLocked
          // token1 per our token * Eth per token1
          priceSoFar = pool.token1Price.times(token1.derivedMatic as BigDecimal)
        }
      }
      if (pool.token1 == token.id) {
        let token0 = Token.load(pool.token0)!
        // get the derived Matic in pool
        let maticLocked = pool.totalValueLockedToken0.times(token0.derivedMatic)
        if (maticLocked.gt(largestLiquidityMatic) && maticLocked.gt(MINIMUM_Matic_LOCKED)) {
          largestLiquidityMatic = maticLocked
          // token0 per our token * Matic per token0
          priceSoFar = pool.token0Price.times(token0.derivedMatic as BigDecimal)
        }
      }
    }
  }
}
  return priceSoFar // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedAmountUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0USD = token0.derivedMatic.times(bundle.maticPriceUSD)
  let price1USD = token1.derivedMatic.times(bundle.maticPriceUSD)

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).plus(tokenAmount1.times(price1USD))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount1.times(price1USD).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD
}
