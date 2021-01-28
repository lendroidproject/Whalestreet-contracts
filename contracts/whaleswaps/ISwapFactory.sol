// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


/**
 * @dev Required interface of a Swap compliant contract.
 */
interface ISwapFactory {

    function createSwap(
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[2] memory uint256Values// epoch, tokenId
        ) external returns (address swap);

    function totalSwaps() external view returns (uint256);

}
