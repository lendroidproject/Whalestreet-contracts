// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;

import "./BaseAuctionRegistry.sol";


contract WhaleSwapAuctionRegistry is BaseAuctionRegistry {

    constructor(address rewardTokenAddress, uint256 firstAuctionPriceValue,
                address auctionTokenAddress, address probabilityDistributionAddress,
                address vrfCoordinator, address linkToken, bytes32 vrfKeyHash, uint256 vrfFee)
        BaseAuctionRegistry(rewardTokenAddress, firstAuctionPriceValue,
                            auctionTokenAddress, probabilityDistributionAddress,
                            vrfCoordinator, linkToken, vrfKeyHash, vrfFee) {
    }

}
