// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


/**
 * @dev Required interface of a Swap compliant contract.
 */
interface ISwapFactory {

    function totalSwaps() external returns (uint256);

    function create(
            uint256 tokenId,
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[4] memory uint256Values// feePercent, date, token0Amount, token1Amount
        ) external returns (address swap);
}
