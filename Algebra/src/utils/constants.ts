/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address, bigDecimal } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x13fcE0acbe6Fb11641ab753212550574CaD31415'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)
export let Q96 = BigDecimal.fromString('79228162514264337593543950336')
export let Q128 = BigDecimal.fromString('340282366920938463463374607431768211456')
export let FEE_DENOMINATOR = BigDecimal.fromString('1000000')

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))

export let pools_list = [""]