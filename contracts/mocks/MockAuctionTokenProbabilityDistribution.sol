// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


import "../auctions/IAuctionTokenProbabilityDistribution.sol";


contract MockAuctionTokenProbabilityDistribution is IAuctionTokenProbabilityDistribution {


    function tokenUrlFromRandomResult(uint256 randomResult) override pure public returns(string memory tokenUri) {
        require((randomResult > 0) && (randomResult <= 100), "Invalid randomResult");
        if (randomResult > 0 && randomResult <= 10) {
            tokenUri = "RARE";
        }
        else if (randomResult > 15 && randomResult <= 30) {
            tokenUri = "UNIQUE";
        }
        else {
            tokenUri = "REGULAR";
        }
    }

}
