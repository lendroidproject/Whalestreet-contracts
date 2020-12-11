// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


import "./WhaleStreetToken.sol";


contract WhaleSwapToken is WhaleStreetToken {
    // solhint-disable-next-line func-visibility
    constructor() ERC721("WhaleSwap Token", "WST") {}// solhint-disable-line no-empty-blocks

}
