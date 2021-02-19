// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


import "./MockERC20.sol";


contract MockLST is MockERC20 {
    // solhint-disable-next-line func-visibility
    constructor () MockERC20("Mock Lendroid Support Token", "MockLST") {}// solhint-disable-line no-empty-blocks
}
