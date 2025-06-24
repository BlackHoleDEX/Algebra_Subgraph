/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address, bigDecimal } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'


export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5E4F01767A1068C5570c29fDF9bf743b0Aa637d7'
export const FEE_DENOMINATOR = BigDecimal.fromString('1000000') 

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))