// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MockERC20 is ERC20, Ownable {
    // solhint-disable-next-line func-visibility
    constructor (string memory name, string memory symbol) ERC20(name, symbol) {}// solhint-disable-line no-empty-blocks

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
}
