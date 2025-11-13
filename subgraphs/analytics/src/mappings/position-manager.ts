/* eslint-disable prefer-const */
import {
  Collect,
  IncreaseLiquidity,
  DecreaseLiquidity,
  Transfer
} from '../types/NonfungiblePositionManager/NonfungiblePositionManager'
import { Pool, Position, PositionSnapshot, PositionTransferCache, Token, Mint} from '../types/schema'
import { ZERO_ADDRESS, ZERO_BD, ZERO_BI} from '../utils/constants'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal, loadTransaction } from '../utils'
import { Pool as PoolABI } from '../types/Factory/Pool'
import { NonfungiblePositionManager } from '../types/NonfungiblePositionManager/NonfungiblePositionManager'
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from '../utils/chain'



function getPosition(tokenId: BigInt): Position | null {
  let position = Position.load(tokenId.toString())
  return position
}

function createPositionIfNeccessary(event: ethereum.Event, tokenId: BigInt, poolAddress: string): Position{
  let position = Position.load(tokenId.toString())
  if (position === null ) {
    let transferCache = PositionTransferCache.load('1')!

    position = new Position(tokenId.toString())
    position.owner = transferCache.owner
    position.pool = poolAddress
    
    // Handle edge case where pool might not exist yet (created in same transaction)
    let pool = Pool.load(poolAddress)
    let token0Address: string
    let token1Address: string
    let lastMintIndex: BigInt = ZERO_BI
    
    if (pool === null) {
      // Pool doesn't exist yet, query the pool contract directly
      let poolContract = PoolABI.bind(Address.fromString(poolAddress))
      let token0Result = poolContract.try_token0()
      let token1Result = poolContract.try_token1()
      
      if (token0Result.reverted || token1Result.reverted) {
        // If pool contract query fails, try to get tokens from position manager as fallback
        let positionManager = NonfungiblePositionManager.bind(Address.fromString(NONFUNGIBLE_POSITION_MANAGER_ADDRESS))
        let positionResult = positionManager.try_positions(tokenId)
        
        if (positionResult.reverted) {
          // If we can't query either contract, we can't create the position properly
          // This should not happen in practice, but handle gracefully
          return position
        }
        
        // Get token addresses from position manager (value2 is token0, value3 is token1)
        token0Address = positionResult.value.value2.toHexString()
        token1Address = positionResult.value.value3.toHexString()
      } else {
        token0Address = token0Result.value.toHexString()
        token1Address = token1Result.value.toHexString()
      }
    } else {
      // Pool exists, use it
      token0Address = pool.token0
      token1Address = pool.token1
      lastMintIndex = pool.lastMintIndex
    }
    
    position.token0 = token0Address
    position.token1 = token1Address
    
    let transaction = loadTransaction(event)
    // Try to load the mint - it might not exist if pool was just created
    let mint = Mint.load(transaction.id.toString() + '#' + lastMintIndex.toString())
    
    if (mint === null && pool !== null) {
      // Mint doesn't exist yet, try to find it by checking txCount (which equals lastMintIndex when mint happens)
      mint = Mint.load(transaction.id.toString() + '#' + pool.txCount.toString())
    }
    
    let tickLower: BigInt
    let tickUpper: BigInt
    
    if (mint !== null) {
      // Use tick values from the mint
      tickLower = mint.tickLower
      tickUpper = mint.tickUpper
    } else {
      // Mint doesn't exist yet (edge case: position created before mint is processed)
      // Query the position manager contract directly for tick values
      let positionManager = NonfungiblePositionManager.bind(Address.fromString(NONFUNGIBLE_POSITION_MANAGER_ADDRESS))
      let positionResult = positionManager.try_positions(tokenId)
      
      if (positionResult.reverted) {
        // If we can't query the contract, we can't create the position properly
        // This should not happen in practice, but handle gracefully
        return position
      }
      
      // Extract tick values from position result (indices 5 and 6 are tickLower and tickUpper)
      tickLower = BigInt.fromI32(positionResult.value.value5)
      tickUpper = BigInt.fromI32(positionResult.value.value6)
    }
    
    position.tickLower = position.pool.concat('#').concat(tickLower.toString())
    position.tickUpper = position.pool.concat('#').concat(tickUpper.toString())
    
    position.liquidity = ZERO_BI
    position.depositedToken0 = ZERO_BD
    position.depositedToken1 = ZERO_BD
    position.withdrawnToken0 = ZERO_BD
    position.withdrawnToken1 = ZERO_BD
    position.collectedToken0 = ZERO_BD
    position.collectedToken1 = ZERO_BD
    position.collectedFeesToken0 = ZERO_BD
    position.collectedFeesToken1 = ZERO_BD
    position.transaction = transaction.id

  }
  return position
}
function savePositionSnapshot(position: Position, event: ethereum.Event): void {
  
  let positionSnapshot = new PositionSnapshot(position.id.concat('#').concat(event.block.number.toString()))
  positionSnapshot.owner = position.owner
  positionSnapshot.pool = position.pool
  positionSnapshot.position = position.id
  positionSnapshot.blockNumber = event.block.number
  positionSnapshot.timestamp = event.block.timestamp
  positionSnapshot.liquidity = position.liquidity
  positionSnapshot.depositedToken0 = position.depositedToken0
  positionSnapshot.depositedToken1 = position.depositedToken1
  positionSnapshot.withdrawnToken0 = position.withdrawnToken0
  positionSnapshot.withdrawnToken1 = position.withdrawnToken1
  positionSnapshot.collectedFeesToken0 = position.collectedFeesToken0
  positionSnapshot.collectedFeesToken1 = position.collectedFeesToken1
  positionSnapshot.transaction = loadTransaction(event).id


  positionSnapshot.save()
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {

  let position = createPositionIfNeccessary(event, event.params.tokenId, event.params.pool.toHexString())

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)

  let amount0 = convertTokenToDecimal(event.params.amount0, token0!.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1!.decimals)

  position.liquidity = position.liquidity.plus(event.params.actualLiquidity)
  position.depositedToken0 = position.depositedToken0.plus(amount0)
  position.depositedToken1 = position.depositedToken1.plus(amount1)

  position.save()

  savePositionSnapshot(position, event)
  
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  let position = getPosition(event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)

  let amount0 = convertTokenToDecimal(event.params.amount0, token0!.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1!.decimals)

  position.liquidity = position.liquidity.minus(event.params.liquidity)
  position.withdrawnToken0 = position.withdrawnToken0.plus(amount0)
  position.withdrawnToken1 = position.withdrawnToken1.plus(amount1)

  position.save()

  savePositionSnapshot(position, event)
}


export function handleCollect(event: Collect): void {
  let position = getPosition(event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)

  let amount0 = convertTokenToDecimal(event.params.amount0, token0!.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1!.decimals)
  
  position.collectedToken0 = position.collectedToken0.plus(amount0)
  position.collectedToken1 = position.collectedToken1.plus(amount1)

  position.collectedFeesToken0 = position.collectedToken0.minus(position.withdrawnToken0)
  position.collectedFeesToken1 = position.collectedToken1.minus(position.withdrawnToken1)

  position.save()

  savePositionSnapshot(position, event)
}

export function handleTransfer(event: Transfer): void {
  let position = getPosition(event.params.tokenId)

  let transferCache = PositionTransferCache.load('1')!
  transferCache.owner = event.params.to
  transferCache.save()

  // position was not able to be fetched
  if (position == null) {
    return
  }

  position.owner = event.params.to
  position.save()

  savePositionSnapshot(position, event)
}
