// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.3;

import "@openzeppelin/contracts/math/SafeMath.sol";


abstract contract Pacemaker {

    using SafeMath for uint256;

    // uint256 constant HEARTBEATSTARTTIME = 1609459200;// 2021-01-01 00:00:00 (UTC UTC +00:00)
    uint256 constant HEARTBEATSTARTTIME = 1602288000;// 2020-10-10 00:00:00 (UTC UTC +00:00)
    uint256 constant EPOCHPERIOD = 28800;// 8 hours
    uint256 constant WARMUPPERIOD = 2419200;// 28 days

    function epochFromTimestamp(uint256 timestamp) pure public returns (uint256) {
        if (timestamp > HEARTBEATSTARTTIME) {
            return timestamp.sub(HEARTBEATSTARTTIME).div(EPOCHPERIOD).add(1);
        }
        return 0;
    }

    function epochStartTimeFromTimestamp(uint256 timestamp) pure public returns (uint256) {
        return HEARTBEATSTARTTIME.add(epochFromTimestamp(timestamp).mul(EPOCHPERIOD));
    }

    function epochEndTimeFromTimestamp(uint256 timestamp) pure public returns (uint256) {
        return epochStartTimeFromTimestamp(timestamp).add(EPOCHPERIOD);
    }

    function currentEpoch() view public returns (uint256) {
        return epochFromTimestamp(block.timestamp);
    }

}
