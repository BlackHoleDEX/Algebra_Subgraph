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
    let pool = Pool.load(poolAddress)!
    position.token0 = pool.token0
    position.token1 = pool.token1
    let transaction = loadTransaction(event)
    let mint = Mint.load(transaction.id.toString() + '#' + pool.lastMintIndex.toString())!
    position.tickLower = position.pool.concat('#').concat(mint.tickLower.toString())
    position.tickUpper = position.pool.concat('#').concat(mint.tickUpper.toString())
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
