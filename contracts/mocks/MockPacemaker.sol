// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.3;


import "@openzeppelin/contracts/access/Ownable.sol";
import "../treasury/abstracts/Pacemaker.sol";


contract MockPacemaker is Pacemaker, Ownable {}
