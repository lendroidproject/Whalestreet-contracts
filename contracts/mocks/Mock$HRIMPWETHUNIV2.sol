// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


import "./MockERC20.sol";


contract Mock$HRIMPWETHUNIV2 is MockERC20 {
    // solhint-disable-next-line func-visibility
    constructor () MockERC20("$HRIMP ETH Uniswap V2 Pool Token",
        "$HRIMP_WETH_UNI_V2") {}// solhint-disable-line no-empty-blocks
}
