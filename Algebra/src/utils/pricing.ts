/* eslint-disable prefer-const */
import { ONE_BD, ZERO_BD, ZERO_BI } from './constants'
import { Bundle, Pool, Token } from './../types/schema'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { exponentToBigDecimal, safeDiv } from '../utils/index'


const WEth_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_WEth_03_POOL = '0xcd927c5800d1d4e896a135ce0a4528979c8d24b3'

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export let WHITELIST_TOKENS: string[] = [
  '0x4200000000000000000000000000000000000006', // WETH
  '0x46dda6a5a559d861c06ec9a95fb395f5c3db0742', // USDT
  '0xfd418e42783382e86ae91e445406600ba144d162', // ZRC
  '0x19df5689cfce64bc2a55f7220b0cd522659955ef', // BTC
  '0x3b952c8c9c44e8fe201e2b26f6b2200203214cff', // USDC
  '0x58024021fe3ef613fa76e2f36a3da97eb1454c36', // OCELEX
  '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34' // ETHENA 
]

let MINIMUM_Eth_LOCKED = BigDecimal.fromString('0.1')

let Q192 = Math.pow(2, 192)

let STABLE_COINS: string[] = [
  '0x46dda6a5a559d861c06ec9a95fb395f5c3db0742', // USDT
  '0x3b952c8c9c44e8fe201e2b26f6b2200203214cff', // USDC
  '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34' // ETHENA 
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
  let usdcPool = Pool.load(USDC_WEth_03_POOL) // dai is token0
  if (usdcPool !== null) {
    return usdcPool.token1Price
  } else {
    return ZERO_BD
  }
} 


/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived Eth (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WEth_ADDRESS) {
    return ONE_BD
  }
  let whiteList = token.whitelistPools
  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let largestLiquidityEth = ZERO_BD
  let priceSoFar = ZERO_BD
  let bundle = Bundle.load('1')

  // hardcoded fix for incorrect rates
  // if whitelist includes token - get the safe price
  if (STABLE_COINS.includes(token.id)) {
    priceSoFar = safeDiv(ONE_BD, bundle!.ethPriceUSD)
  } else {
  for (let i = 0; i < whiteList.length; ++i) {
    let poolAddress = whiteList[i]
    let pool = Pool.load(poolAddress)!
    if (pool.liquidity.gt(ZERO_BI)) {

      if (pool.token0 == token.id) {
        // whitelist token is token1
        let token1 = Token.load(pool.token1)!
        // get the derived Eth in pool
        let ethLocked = pool.totalValueLockedToken1.times(token1.derivedEth)
        if (ethLocked.gt(largestLiquidityEth) && ethLocked.gt(MINIMUM_Eth_LOCKED)) {
          largestLiquidityEth = ethLocked
          // token1 per our token * Eth per token1
          priceSoFar = pool.token1Price.times(token1.derivedEth as BigDecimal)
        }
      }
      if (pool.token1 == token.id) {
        let token0 = Token.load(pool.token0)!
        // get the derived Eth in pool
        let ethLocked = pool.totalValueLockedToken0.times(token0.derivedEth)
        if (ethLocked.gt(largestLiquidityEth) && ethLocked.gt(MINIMUM_Eth_LOCKED)) {
          largestLiquidityEth = ethLocked
          // token0 per our token * Eth per token0
          priceSoFar = pool.token0Price.times(token0.derivedEth as BigDecimal)
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
  let price0USD = token0.derivedEth.times(bundle.ethPriceUSD)
  let price1USD = token1.derivedEth.times(bundle.ethPriceUSD)

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
