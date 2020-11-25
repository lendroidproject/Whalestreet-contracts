// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


/**
 * @dev Required interface of a Swap compliant contract.
 */
interface ISwapRegistry {
    function register(uint256 tokenId, address factoryAddress, address swapAddress) external;
}
