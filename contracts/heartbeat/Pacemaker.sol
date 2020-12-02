// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";


/** @title Pacemaker
    @author Lendroid Foundation
    @notice Smart contract based on which various events in the Protocol take place
    @dev Audit certificate : Pending
*/


abstract contract Pacemaker {

    using SafeMath for uint256;

    // uint256 constant HEART_BEAT_START_TIME = 1607040000;// 2020-12-04 00:00:00 (UTC UTC +00:00)
    uint256 constant public HEART_BEAT_START_TIME = 1602288000;// 2020-10-10 00:00:00 (UTC UTC +00:00)
    uint256 constant public EPOCH_PERIOD = 8 hours;

    function epochFromTimestamp(uint256 timestamp) pure public returns (uint256) {
        if (timestamp > HEART_BEAT_START_TIME) {
            return timestamp.sub(HEART_BEAT_START_TIME).div(EPOCH_PERIOD).add(1);
        }
        return 0;
    }

    function epochStartTimeFromTimestamp(uint256 timestamp) pure public returns (uint256) {
        if (timestamp <= HEART_BEAT_START_TIME) {
            return HEART_BEAT_START_TIME;
        }
        else {
            return HEART_BEAT_START_TIME.add((epochFromTimestamp(timestamp).sub(1)).mul(EPOCH_PERIOD));
        }
    }

    function epochEndTimeFromTimestamp(uint256 timestamp) pure public returns (uint256) {
        if (timestamp < HEART_BEAT_START_TIME) {
            return HEART_BEAT_START_TIME;
        }
        else if (timestamp == HEART_BEAT_START_TIME) {
            return HEART_BEAT_START_TIME.add(EPOCH_PERIOD);
        }
        else {
            return epochStartTimeFromTimestamp(timestamp).add(EPOCH_PERIOD);
        }
    }

    /**
        @notice Calculates current epoch value from the block timestamp
        @dev Calculates the nth 8-hour window frame since the heartbeat's start time
        @return uint256 : Current epoch value
    */
    function currentEpoch() view public returns (uint256) {
        return epochFromTimestamp(block.timestamp);
    }

}
