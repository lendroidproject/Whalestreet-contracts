// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../chainlink/VRFConsumerBase.sol";
import "../heartbeat/Pacemaker.sol";
import "../erc721/IERC721WhaleStreet.sol";
import "./IAuctionTokenProbabilityDistribution.sol";


// solhint-disable-next-line
abstract contract LinearCurve is Pacemaker, Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Y {
        uint256 epoch;
        uint256 y;
        uint256 timestamp;
        uint256 auctionTokenId;
        address account;
    }

    // calulations
    Y[] public Ys;// solhint-disable-line var-name-mixedcase
    uint256 public maxY;
    uint256 public minY;

    function setMaxY(uint256 value) external onlyOwner {
        require(value > 0, "maxY cannot be 0 or negative");
        maxY = value;
    }

    function setMinY(uint256 value) external onlyOwner {
        require(value > 0, "minY cannot be 0 or negative");
        minY = value;
    }

    function y() internal view returns (uint256 value) {
        value = ((_y1().sub(1)).mul((EPOCHPERIOD.sub(_x()))).add(EPOCHPERIOD)).div(EPOCHPERIOD);
        if (value > maxY) {
            value = maxY;
        }
        if (value < minY) {
            value = minY;
        }
    }

    function totalYs() internal view returns (uint256) {
        return Ys.length;
    }

    function _x() private view returns (uint256) {
        // solhint-disable-next-line not-rely-on-time
        return block.timestamp.sub(epochStartTimeFromTimestamp(block.timestamp));
    }

    function _y1() private view returns (uint256) {
        if (Ys.length == 0) {
            return maxY;
        } else if (currentEpoch().sub(Ys[Ys.length - 1].epoch) == 1) {
            return Ys[Ys.length - 1].epoch.mul(2);
        } else {
            return Ys[Ys.length - 1].y;
        }
    }

}
