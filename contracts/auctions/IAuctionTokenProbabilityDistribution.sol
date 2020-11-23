// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


/**
 * @dev Required interface of an AuctionTokenProbabilityDistribution compliant contract.
 */
interface IAuctionTokenProbabilityDistribution {
    function tokenUriFromRandomResult(uint256 randomResult) view external returns(string memory tokenUri);

    function feePercentage(string calldata tokenUri) view external returns(uint256 feePercent);
}
