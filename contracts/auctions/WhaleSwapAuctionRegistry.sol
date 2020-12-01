// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "./BaseAuctionRegistry.sol";


contract WhaleSwapAuctionRegistry is BaseAuctionRegistry {

    constructor(address rewardTokenAddress, address auctionTokenAddress,
        address probabilityDistributionAddress,
        address vrfCoordinator, address linkToken, bytes32 vrfKeyHash, uint256 vrfFee)
        BaseAuctionRegistry(rewardTokenAddress, auctionTokenAddress,
            probabilityDistributionAddress,
            vrfCoordinator, linkToken, vrfKeyHash, vrfFee) {
    }

}
