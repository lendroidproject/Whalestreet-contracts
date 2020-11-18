// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


/**
 * @dev Required interface of an AuctionTokenProbabilityDistribution compliant contract.
 */
interface IAuctionTokenProbabilityDistribution {
    function tokenUrlFromRandomResult(uint256 randomResult) pure external returns(string memory tokenUri);
}
