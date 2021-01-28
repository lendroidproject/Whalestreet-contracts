// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../heartbeat/Pacemaker.sol";
import "../erc721/IERC721WhaleStreet.sol";
import "./Swap.sol";
import "./ISwap.sol";
import "./ISwapFactory.sol";
import "./ISwapRegistry.sol";


contract SwapFactory is Pacemaker, ISwapFactory {

    address[] public swaps;

    ISwapRegistry public registry;
    IERC721WhaleStreet public auctionToken;

    // solhint-disable-next-line func-visibility
    constructor(address auctionTokenAddress, address registryAddress) {
        registry = ISwapRegistry(registryAddress);
        auctionToken = IERC721WhaleStreet(auctionTokenAddress);
    }

    function createSwap(
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[2] memory uint256Values// epoch, tokenId
        ) external override returns (address swapAddress) {
        require(IERC721WhaleStreet(auctionToken).tokenIdExists(uint256Values[1]), "invalid tokenId");
        require(msg.sender == auctionToken.ownerOf(uint256Values[1]), "invalid caller");
        bytes memory bytecode = type(Swap).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(address(this), addresses[0], addresses[1],
            auctionToken.ownerOf(uint256Values[1]), block.timestamp));// solhint-disable-line not-rely-on-time
        // solhint-disable-next-line no-inline-assembly
        assembly {
            swapAddress := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ISwap(swapAddress).initialize(swapName, addresses, uint256Values);
        swaps.push(swapAddress);
        registry.register(uint256Values[1], address(this), swapAddress);
    }

    function totalSwaps() external view override returns (uint256) {
        return swaps.length;
    }

}
