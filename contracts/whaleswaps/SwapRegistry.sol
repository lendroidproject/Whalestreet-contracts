// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;


import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISwapRegistry.sol";


contract SwapRegistry is Ownable {

    struct RegistryInfo {
        address factory;
        address swap;
    }

    mapping(uint256 => RegistryInfo) public registry;

    mapping(address => bool) public approvedFactories;

    function toggleFactoryApproval(address factoryAddress, bool toggle) external onlyOwner {
        approvedFactories[factoryAddress] = toggle;
    }

    function register(
            uint256 tokenId,
            address swapFactoryAddress,
            address swapAddress
        ) external {
        require(approvedFactories[msg.sender], "factory not approved");
        require(swapAddress != address(0), "invalid swapAddress");
        require(swapFactoryAddress != address(0), "invalid swapFactoryAddress");
        RegistryInfo storage entry = registry[tokenId];
        // swap check is enough
        require(entry.swap == address(0), "swap exists");
        // save swap and factory
        entry.factory = swapFactoryAddress;
        entry.swap = swapAddress;
    }

}
