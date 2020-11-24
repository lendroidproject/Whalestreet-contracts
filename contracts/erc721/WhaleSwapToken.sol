// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


import "./WhaleStreetToken.sol";


contract WhaleSwapToken is WhaleStreetToken {

    address public swapFactory;
    address public swap;

    constructor(address swapFactoryAddress) ERC721("WhaleSwap Token", "WST") {
        swapFactory = swapFactoryAddress;
    }

    function setSwap(address swapAddress) external {
        require(msg.sender == swapFactory, "invalid caller");
        swap = swapAddress;
    }

}
