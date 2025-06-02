/* eslint-disable prefer-const */
import { Whitelisted } from '../types/Whitelist/Whitelist'
import { WhitelistedUser } from '../types/schema'

export function handleWhitelist(event: Whitelisted): void {

  // Create new WhitelistedUser entity using user address as ID
  let whitelistedUser = new WhitelistedUser(event.params.user.toHexString())
  
  // Set user information
  whitelistedUser.user = event.params.user
  whitelistedUser.timestamp = event.block.timestamp
  whitelistedUser.transactionHash = event.transaction.hash
  whitelistedUser.blockNumber = event.block.number
  
  // Save the whitelisted user entity
  whitelistedUser.save()

}