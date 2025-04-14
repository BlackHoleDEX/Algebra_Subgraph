import { Address, BigInt } from '@graphprotocol/graph-ts'

// Initialize a Token Definition with the attributes
export class StaticTokenDefinition {
  address: Address
  symbol: string
  name: string
  decimals: BigInt

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<StaticTokenDefinition> {
    const staticDefinitions: Array<StaticTokenDefinition> = [
      {
        address: Address.fromString('0x10253594A832f967994b44f33411940533302ACb'),
        symbol: 'WTAC',
        name: 'Wrapped TAC',
        decimals: BigInt.fromI32(18)
      },
      {
        address: Address.fromString('0x83D4a9Ea77a4dbA073cD90b30410Ac9F95F93E7C'),
        symbol: 'USDC',
        name: 'USDC',
        decimals: BigInt.fromI32(18)
      },
      {
        address: Address.fromString('0xbE3C16e14d578a24eF4B124fAf9CD1bb5F1e964B'),
        symbol: 'TON',
        name: 'TON Token',
        decimals: BigInt.fromI32(9)
      },
      {
        address: Address.fromString('0xc208e122Ff9915747eee968926be395eB5D9155C'),
        symbol: 'X',
        name: 'X Empire',
        decimals: BigInt.fromI32(9)
      },
      {
        address: Address.fromString('0x10253594A832f967994b44f33411940533302ACb'),
        symbol: 'WTAC',
        name: 'Wrapped TAC',
        decimals: BigInt.fromI32(18)
      },
      {
        address: Address.fromString('0x7336A5a3251b9259DDf8B9D02a96dA0153e0799d'),
        symbol: 'USDT',
        name: 'USDT',
        decimals: BigInt.fromI32(18)
      },
    ]
    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address): StaticTokenDefinition | null {
    let staticDefinitions = this.getStaticDefinitions()
    let tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      let staticDefinition = staticDefinitions[i]
      if (staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }

    // If not found, return null
    return null
  }
}