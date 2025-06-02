/* eslint-disable prefer-const */
import { Resolved } from '../types/LiquidityHub/LiquidityHub'
import { Order, Token } from '../types/schema'
import { convertTokenToDecimal } from '../utils'
import { getEthPriceInUSD } from '../utils/pricing'
import { ZERO_BD } from '../utils/constants'


export function handleResolved(event: Resolved): void {
  
  // Create new Order entity using orderHash as ID
  let order = new Order(event.params.orderHash.toHexString())
  
  // Set basic order information
  order.transactionHash = event.transaction.hash
  order.blockNumber = event.block.number
  order.timestamp = event.block.timestamp
  order.swapper = event.params.swapper
  order.ref = event.params.ref
  order.inToken = event.params.inToken
  order.outToken = event.params.outToken
  order.inAmount = event.params.inAmount
  order.outAmount = event.params.outAmount
    // Set transaction details
  order.gasUsed = event.transaction.gasLimit
  order.gasPrice = event.transaction.gasPrice
  
  // Calculate USD amount using outToken
  let outToken = Token.load(event.params.outToken.toHexString())
  if (outToken !== null) {
    // Convert outAmount to decimal format
    let outAmountDecimal = convertTokenToDecimal(event.params.outAmount, outToken.decimals)
    
    // Convert to native token amount using derivedMatic
    let outAmountInMatic = outAmountDecimal.times(outToken.derivedMatic)
    
    // Convert to USD using current ETH/MATIC price
    let maticPriceUSD = getEthPriceInUSD()
    order.outAmountUSD = outAmountInMatic.times(maticPriceUSD)
  } else {
    // If token not found, set USD amount to 0
    order.outAmountUSD = ZERO_BD
  }
  
  // Save the order entity
  order.save()
  
}