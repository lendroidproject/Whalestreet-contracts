// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


/**
 * @dev Required interface of a Swap compliant contract.
 */
interface ISwap {

    function initialize(
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[2] memory uint256Values// epoch, tokenId
        ) external;

    function update(uint256 startEpoch) external;

    function addLiquidity(address token, uint256 amount) external;
}
