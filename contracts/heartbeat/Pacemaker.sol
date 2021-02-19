// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";


/** @title Pacemaker
    @author Lendroid Foundation
    @notice Smart contract based on which various events in the Protocol take place
    @dev Audit certificate : https://certificate.quantstamp.com/view/lendroid-whalestreet
*/


// solhint-disable-next-line
abstract contract Pacemaker {

    using SafeMath for uint256;
    uint256 constant public HEART_BEAT_START_TIME = 1607212800;// 2020-12-06 00:00:00 UTC (UTC +00:00)
    uint256 constant public EPOCH_PERIOD = 8 hours;

    /**
        @notice Displays the epoch which contains the given timestamp
        @return uint256 : Epoch value
    */
    function epochFromTimestamp(uint256 timestamp) public pure returns (uint256) {
        if (timestamp > HEART_BEAT_START_TIME) {
            return timestamp.sub(HEART_BEAT_START_TIME).div(EPOCH_PERIOD).add(1);
        }
        return 0;
    }

    /**
        @notice Displays timestamp when a given epoch began
        @return uint256 : Epoch start time
    */
    function epochStartTimeFromTimestamp(uint256 timestamp) public pure returns (uint256) {
        if (timestamp <= HEART_BEAT_START_TIME) {
            return HEART_BEAT_START_TIME;
        } else {
            return HEART_BEAT_START_TIME.add((epochFromTimestamp(timestamp).sub(1)).mul(EPOCH_PERIOD));
        }
    }

    /**
        @notice Displays timestamp when a given epoch will end
        @return uint256 : Epoch end time
    */
    function epochEndTimeFromTimestamp(uint256 timestamp) public pure returns (uint256) {
        if (timestamp < HEART_BEAT_START_TIME) {
            return HEART_BEAT_START_TIME;
        } else if (timestamp == HEART_BEAT_START_TIME) {
            return HEART_BEAT_START_TIME.add(EPOCH_PERIOD);
        } else {
            return epochStartTimeFromTimestamp(timestamp).add(EPOCH_PERIOD);
        }
    }

    /**
        @notice Calculates current epoch value from the block timestamp
        @dev Calculates the nth 8-hour window frame since the heartbeat's start time
        @return uint256 : Current epoch value
    */
    function currentEpoch() public view returns (uint256) {
        return epochFromTimestamp(block.timestamp);// solhint-disable-line not-rely-on-time
    }

}
