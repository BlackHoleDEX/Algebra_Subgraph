/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x306F06C147f064A010530292A1EB6737c3e378e4'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)
export let TICK_SPACING = BigInt.fromI32(60)
export let MIN_SQRT_PRICE = BigInt.fromString("4295128739")
export let MAX_SQRT_PRICE = BigInt.fromString("1461446703485210103287273052203988822378723970342")
export let Q96 = BigInt.fromString("79228162514264337593543950336")
