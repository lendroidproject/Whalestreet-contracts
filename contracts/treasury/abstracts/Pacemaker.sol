// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.3;

import "@openzeppelin/contracts/math/SafeMath.sol";


abstract contract Pacemaker {

    using SafeMath for uint256;

    // uint256 constant HEARTBEATSTARTTIME = 1609459200;// 2021-01-01 00:00:00 (UTC UTC +00:00)
    uint256 constant HEARTBEATSTARTTIME = 1602316800;// 2020-10-10 08:00:00 (UTC UTC +00:00)
    uint256 constant EPOCHPERIOD = 28800;// 8 hours
    uint256 constant WARMUPPERIOD = 2419200;// 28 days

    function _currentEpoch() view internal returns (uint256) {
        if (block.timestamp > HEARTBEATSTARTTIME) {
            return block.timestamp.sub(HEARTBEATSTARTTIME).div(EPOCHPERIOD).add(1);
        }
        return 0;
    }

    function currentEpoch() view external returns (uint256) {
        return _currentEpoch();
    }

}
