// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../heartbeat/Pacemaker.sol";
import "../erc721/IERC721WhaleStreet.sol";
import "./Swap.sol";
import "./ISwap.sol";
import "./ISwapFactory.sol";


contract SwapFactory is Pacemaker, Ownable, ISwapFactory {

    enum Status { Inactive, Active, Archived }

    // whaleswap
    struct Swap {
        uint256 auctionTokenId;
        address swapMaster;
        address swap;
        Status status;
    }
    Swap[] public swaps;

    IERC721WhaleStreet public auctionToken;

    constructor(address auctionTokenAddress) {
        auctionToken = IERC721WhaleStreet(auctionTokenAddress);
    }

    function totalSwaps() external returns (uint256) {
        return swaps.length;
    }

    function create(
            uint256 tokenId,
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[4] memory uint256Values// feePercent, date, token0Amount, token1Amount
        ) external returns (address swap) {
        require(msg.sender == address(auctionToken), "invalid auction token");
        bytes memory bytecode = type(Swap).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(addresses[0], addresses[1], auctionToken.ownerOf(tokenId), block.timestamp));
        assembly {
            swap := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ISwap(swap).initialize(swapName, addresses, uint256Values);
    }

}
