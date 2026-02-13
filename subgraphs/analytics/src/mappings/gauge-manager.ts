/* eslint-disable prefer-const */
import { GaugeCreated } from '../types/GaugeManager/GaugeManager'
import { Pool } from '../types/schema'
import { Gauge as GaugeTemplate } from '../types/templates'
import { ZERO_BI } from '../utils/constants'
import { log } from '@graphprotocol/graph-ts'

export function handleGaugeCreated(event: GaugeCreated): void {
  let gaugeAddress = event.params.gauge.toHexString()
  let poolAddress = event.params.pool.toHexString()

  // Load the pool entity
  let pool = Pool.load(poolAddress)
  
  if (pool === null) {
    log.warning('Pool not found for gauge creation: {}', [poolAddress])
    return
  }

  // Update the pool with the gauge address
  pool.gauge = event.params.gauge
  
  // Initialize reward timestamp if not already set (for pools created before this feature)
  pool.lastRewardTimestamp = ZERO_BI
  
  pool.save()

  // Create template instance for the gauge to listen to its events
  GaugeTemplate.create(event.params.gauge)

  log.info('Gauge {} created for pool {}', [gaugeAddress, poolAddress])
}
