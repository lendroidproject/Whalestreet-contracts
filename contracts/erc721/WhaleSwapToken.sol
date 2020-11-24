// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


import "../whaleswaps/ISwapFactory.sol";
import "./WhaleStreetToken.sol";


contract WhaleSwapToken is WhaleStreetToken {

    ISwapFactory public swapFactory;
    mapping(uint256 => address) public swaps;

    constructor() ERC721("WhaleSwap Token", "WST") {}

    function setSwapFactory(address swapFactoryAddress) onlyOwner external {
        require(swapFactoryAddress != address(0), "invalid swapFactoryAddress");
        swapFactory = ISwapFactory(swapFactoryAddress);
    }

    function setSwap(
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[4] memory uint256Values// start, token0Amount, token1Amount, tokenId
        ) external {
        uint256 tokenId = uint256Values[3];
        require(msg.sender == ownerOf(tokenId), "invalid caller");
        require(swaps[tokenId] == address(0), "swap exists");
        swaps[tokenId] = swapFactory.createSwap(swapName, addresses, uint256Values);
    }

}
