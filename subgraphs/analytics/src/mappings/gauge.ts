/* eslint-disable prefer-const */
import { RewardAdded } from '../types/templates/Gauge/GaugeCL'
import { Pool } from '../types/schema'
import { log } from '@graphprotocol/graph-ts'
import { GaugeCL } from '../types/templates/Gauge/GaugeCL'

export function handleRewardAdded(event: RewardAdded): void {
  let gaugeAddress = event.address.toHexString()
  
  // Load the gauge contract to get the pool address
  let gaugeContract = GaugeCL.bind(event.address)
  let poolAddressResult = gaugeContract.try_poolAddress()
  
  if (poolAddressResult.reverted) {
    log.warning('Could not get pool address from gauge: {}', [gaugeAddress])
    return
  }
  
  let poolAddress = poolAddressResult.value.toHexString()
  
  // Load the pool entity
  let pool = Pool.load(poolAddress)
  
  if (pool === null) {
    log.warning('Pool not found for reward added event: {}', [poolAddress])
    return
  }
  
  // Update reward timestamp
  pool.lastRewardTimestamp = event.block.timestamp
  
  pool.save()
  
  log.info('Reward added to gauge {} for pool {} at timestamp {}', [
    gaugeAddress,
    poolAddress,
    event.block.timestamp.toString()
  ])
}
