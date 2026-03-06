/* eslint-disable prefer-const */
import { EPOCH_FLIP_DURATION, FACTORY_ADDRESS, WHITELIST_TOKENS } from '../utils/chain'
import { ZERO_BI, ONE_BI, ZERO_BD, ZERO_ADDRESS } from '../utils/constants'
import { BurnFeeCache, Factory, SwapFeeCache, PositionTransferCache } from '../types/schema'
import { Pool as PoolEvent } from '../types/Factory/Factory'
import { DefaultCommunityFee, CustomPool } from '../types/Factory/Factory'
import { Pool, Token, Bundle } from '../types/schema'
import { Pool as PoolTemplate } from '../types/templates'
import { fetchTokenSymbol, fetchTokenName, fetchTokenTotalSupply, fetchTokenDecimals } from '../utils/token'
import { log, BigInt, Address } from '@graphprotocol/graph-ts'

export function handlePoolCreated(event: PoolEvent): void {
  let pool = event.params.pool.toHexString()
  let token0 = event.params.token0.toHexString()
  let token1 = event.params.token1.toHexString()
  let deployer = ZERO_ADDRESS
  let timestamp = event.block.timestamp
  let blockNumber = event.block.number

  createPool(pool, token0, token1, deployer, timestamp, blockNumber)
}

export function handleCustomPoolCreated(event: CustomPool): void {
  let pool = event.params.pool.toHexString()
  let token0 = event.params.token0.toHexString()
  let token1 = event.params.token1.toHexString()
  let deployer = event.params.deployer.toHexString()
  let timestamp = event.block.timestamp
  let blockNumber = event.block.number

  createPool(pool, token0, token1, deployer, timestamp, blockNumber)
}

function createPool(
  poolAddress: string,
  token0Address: string,
  token1Address: string,
  deployer: string,
  timestamp: BigInt,
  blockNumber: BigInt,
): void {
  // load factory
  let factory = Factory.load(FACTORY_ADDRESS)
  if (factory == null) {
    factory = new Factory(FACTORY_ADDRESS)
    factory.poolCount = ZERO_BI
    factory.totalVolumeMatic = ZERO_BD
    factory.totalVolumeUSD = ZERO_BD
    factory.untrackedVolumeUSD = ZERO_BD
    factory.totalFeesUSD = ZERO_BD
    factory.totalFeesMatic = ZERO_BD
    factory.defaultCommunityFee = ZERO_BI
    factory.totalValueLockedMatic = ZERO_BD
    factory.totalValueLockedUSD = ZERO_BD
    factory.totalValueLockedUSDUntracked = ZERO_BD
    factory.totalValueLockedMaticUntracked = ZERO_BD
    factory.txCount = ZERO_BI
    factory.owner = ZERO_ADDRESS

    let burnFee = new BurnFeeCache('1')
    burnFee.pluginFee = ZERO_BI
    burnFee.save()

    let swapFee = new SwapFeeCache('1')
    swapFee.pluginFee = ZERO_BI
    swapFee.overrideFee = ZERO_BI
    swapFee.save()

    let transferCache = new PositionTransferCache('1')
    transferCache.owner = Address.fromHexString(ZERO_ADDRESS)
    transferCache.save()

    // create new bundle for tracking matic price
    let bundle = new Bundle('1')
    bundle.maticPriceUSD = ZERO_BD
    bundle.save()
  }

  // Check if pool already exists (might have been created by handleMint in same transaction)
  let pool = Pool.load(poolAddress)
  let poolAlreadyExists = pool !== null

  if (!poolAlreadyExists) {
    // Only increment pool count if pool doesn't exist yet
    factory.poolCount = factory.poolCount.plus(ONE_BI)
    pool = new Pool(poolAddress) as Pool
  } else {
    // Pool already exists, update fields that might be missing or need updating
    // Update deployer and creation info if they're still default values
    if (pool !== null) {
      if (pool.deployer.toHexString() == ZERO_ADDRESS && deployer != ZERO_ADDRESS) {
        pool.deployer = Address.fromString(deployer)
      }
      if (pool.createdAtTimestamp.equals(ZERO_BI)) {
        pool.createdAtTimestamp = timestamp
        pool.createdAtBlockNumber = blockNumber
      }
    }
  }

  // At this point, pool should never be null, but add safety check
  if (pool === null) {
    log.error('Failed to create or load pool', [])
    return
  }

  let token0 = Token.load(token0Address)
  let token1 = Token.load(token1Address)
  // Only initialize tokens if they don't exist yet (don't reset existing token data)
  if (token0 === null) {
    token0 = new Token(token0Address)
    token0.symbol = fetchTokenSymbol(Address.fromString(token0Address))
    token0.name = fetchTokenName(Address.fromString(token0Address))
    token0.totalSupply = fetchTokenTotalSupply(Address.fromString(token0Address))
    let decimals = fetchTokenDecimals(Address.fromString(token0Address))

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token0.decimals = decimals
    token0.derivedMatic = ZERO_BD
    token0.volume = ZERO_BD
    token0.volumeUSD = ZERO_BD
    token0.feesUSD = ZERO_BD
    token0.untrackedVolumeUSD = ZERO_BD
    token0.totalValueLocked = ZERO_BD
    token0.totalValueLockedUSD = ZERO_BD
    token0.totalValueLockedUSDUntracked = ZERO_BD
    token0.txCount = ZERO_BI
    token0.poolCount = ZERO_BI
    token0.whitelistPools = []
  }
  if (token1 === null) {
    token1 = new Token(token1Address)
    token1.symbol = fetchTokenSymbol(Address.fromString(token1Address))
    token1.name = fetchTokenName(Address.fromString(token1Address))
    token1.totalSupply = fetchTokenTotalSupply(Address.fromString(token1Address))
    let decimals = fetchTokenDecimals(Address.fromString(token1Address))
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }
    token1.decimals = decimals
    token1.derivedMatic = ZERO_BD
    token1.volume = ZERO_BD
    token1.volumeUSD = ZERO_BD
    token1.untrackedVolumeUSD = ZERO_BD
    token1.feesUSD = ZERO_BD
    token1.totalValueLocked = ZERO_BD
    token1.totalValueLockedUSD = ZERO_BD
    token1.totalValueLockedUSDUntracked = ZERO_BD
    token1.txCount = ZERO_BI
    token1.poolCount = ZERO_BI
    token1.whitelistPools = []
  }

  // update white listed pools (only if not already added)
  if (WHITELIST_TOKENS.includes(token0.id)) {
    let whitelistPools = token1.whitelistPools
    if (!whitelistPools.includes(pool.id)) {
      whitelistPools.push(pool.id)
      token1.whitelistPools = whitelistPools
    }
  }
  if (WHITELIST_TOKENS.includes(token1.id)) {
    let whitelistPools = token0.whitelistPools
    if (!whitelistPools.includes(pool.id)) {
      whitelistPools.push(pool.id)
      token0.whitelistPools = whitelistPools
    }
  }

  // Only set fields if pool is new, or update specific fields if pool already exists
  if (!poolAlreadyExists) {
    // New pool - set all fields
    pool.deployer = Address.fromString(deployer)
    pool.plugin = Address.fromString(ZERO_ADDRESS)
    pool.token0 = token0.id
    pool.token1 = token1.id
    pool.fee = BigInt.fromI32(100)
    pool.pluginConfig = 0
    pool.createdAtTimestamp = timestamp
    pool.createdAtBlockNumber = blockNumber
    pool.liquidityProviderCount = ZERO_BI
    pool.tickSpacing = BigInt.fromI32(60)
    pool.tick = ZERO_BI
    pool.txCount = ZERO_BI
    pool.liquidity = ZERO_BI
    pool.sqrtPrice = ZERO_BI
    pool.communityFee = factory.defaultCommunityFee
    pool.token0Price = ZERO_BD
    pool.token1Price = ZERO_BD
    pool.observationIndex = ZERO_BI
    pool.totalValueLockedToken0 = ZERO_BD
    pool.totalValueLockedToken1 = ZERO_BD
    pool.totalValueLockedUSD = ZERO_BD
    pool.lastMintIndex = ZERO_BI
    pool.totalValueLockedMatic = ZERO_BD
    pool.totalValueLockedUSDUntracked = ZERO_BD
    pool.volumeToken0 = ZERO_BD
    pool.volumeToken1 = ZERO_BD
    pool.volumeToken0InEpoch = ZERO_BD
    pool.volumeToken1InEpoch = ZERO_BD
    pool.epochFlipTimestamp = BigInt.fromU64((timestamp.toU64() / EPOCH_FLIP_DURATION) * EPOCH_FLIP_DURATION)
    pool.volumeUSD = ZERO_BD
    pool.feesUSD = ZERO_BD
    pool.feesToken0 = ZERO_BD
    pool.feesToken1 = ZERO_BD
    pool.untrackedVolumeUSD = ZERO_BD
    pool.untrackedFeesUSD = ZERO_BD
    pool.collectedFeesToken0 = ZERO_BD
    pool.collectedFeesToken1 = ZERO_BD
    pool.collectedFeesUSD = ZERO_BD
    pool.lastRewardTimestamp = ZERO_BI
  } else {
    // Pool already exists - only update fields that might be missing or need updating
    if (pool.deployer.toHexString() == ZERO_ADDRESS && deployer != ZERO_ADDRESS) {
      pool.deployer = Address.fromString(deployer)
    }
    // Ensure token references are correct (should already be set, but double-check)
    if (pool.token0 != token0.id) {
      pool.token0 = token0.id
    }
    if (pool.token1 != token1.id) {
      pool.token1 = token1.id
    }
  }

  pool.save()

  // Create template - if pool already exists, it was created by handleMint which doesn't create templates
  // Template creation is idempotent, so safe to call in both cases
  PoolTemplate.create(Address.fromString(poolAddress))

  token0.save()
  token1.save()
  factory.save()
}

export function handleNewCommunityFee(event: DefaultCommunityFee): void {
  let factory = Factory.load(FACTORY_ADDRESS)
  if (factory == null) {
    factory = new Factory(FACTORY_ADDRESS)
    factory.poolCount = ZERO_BI
    factory.totalVolumeMatic = ZERO_BD
    factory.totalVolumeUSD = ZERO_BD
    factory.untrackedVolumeUSD = ZERO_BD
    factory.totalFeesUSD = ZERO_BD
    factory.totalFeesMatic = ZERO_BD
    factory.totalValueLockedMatic = ZERO_BD
    factory.totalValueLockedUSD = ZERO_BD
    factory.totalValueLockedUSDUntracked = ZERO_BD
    factory.totalValueLockedMaticUntracked = ZERO_BD
    factory.txCount = ZERO_BI
    factory.owner = ZERO_ADDRESS

    // create new bundle for tracking matic price
    let bundle = new Bundle('1')
    bundle.maticPriceUSD = ZERO_BD
    bundle.save()

    let burnFee = new BurnFeeCache('1')
    burnFee.pluginFee = ZERO_BI
    burnFee.save()

    let swapFee = new SwapFeeCache('1')
    swapFee.pluginFee = ZERO_BI
    swapFee.overrideFee = ZERO_BI
    swapFee.save()

    let transferCache = new PositionTransferCache('1')
    transferCache.owner = Address.fromHexString(ZERO_ADDRESS)
    transferCache.save()
  }
  factory.defaultCommunityFee = BigInt.fromI32(event.params.newDefaultCommunityFee)
  factory.save()
}
