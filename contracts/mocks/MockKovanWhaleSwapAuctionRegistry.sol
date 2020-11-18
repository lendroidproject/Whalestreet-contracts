// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;

import "../auctions/WhaleSwapAuctionRegistry.sol";


contract MockKovanWhaleSwapAuctionRegistry is WhaleSwapAuctionRegistry {

    /**
     * Constructor inherits BaseAuctionRegistry
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     *
     */
    constructor(address rewardTokenAddress, uint256 firstAuctionPriceValue,
                address auctionTokenAddress, address probabilityDistributionAddress)
        WhaleSwapAuctionRegistry(rewardTokenAddress, firstAuctionPriceValue,
            auctionTokenAddress, probabilityDistributionAddress,
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088,  // LINK Token
            0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4, // keyHash
            0.1 * 10 ** 18 // 0.1 LINK
            ) {}

}
