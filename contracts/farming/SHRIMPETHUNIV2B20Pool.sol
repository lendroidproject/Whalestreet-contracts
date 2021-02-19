// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "./BasePool.sol";


/** @title $HRIMPETHUNIV2B20Pool
    @author Lendroid Foundation
    @notice Inherits the BasePool contract, and contains reward distribution
        logic for the B20 token.
*/


// solhint-disable-next-line
contract $HRIMPETHUNIV2B20Pool is BasePool {

    using SafeMath for uint256;

    /**
        @notice Registers the Pool name as $HRIMPETHUNIV2B20Pool as Pool name,
                $HRIMP-WETH-UNIV2 as the LP Token, and
                B20 as the Reward Token.
        @param rewardTokenAddress : B20 Token address
        @param lpTokenAddress : $HRIMP-WETH-UNIV2 Token address
    */
    // solhint-disable-next-line func-visibility
    constructor(address rewardTokenAddress, address lpTokenAddress) BasePool("$HRIMPETHUNIV2B20Pool",
        rewardTokenAddress, lpTokenAddress) {}// solhint-disable-line no-empty-blocks

    /**
        @notice Displays total B20 rewards distributed per second in a given epoch.
        @dev Series 1 :
                Epochs : 162-254
                Total B20 distributed : 9,375
                Distribution duration : 31 days and 8 hours (Jan 28:16:00 to Feb 29 59:59:59 GMT)
            Series 2 :
                Epochs : 255-347
                Total B20 distributed : 5,625
                Distribution duration : 31 days (Mar 1 00:00:00 GMT to Mar 31 59:59:59 GMT)
            Series 3 :
                Epochs : 348-437
                Total B20 distributed : 3,750
                Distribution duration : 30 days (Apr 1 00:00:00 GMT to Apr 30 59:59:59 GMT)
        @param epoch : 8-hour window number
        @return B20 Tokens distributed per second during the given epoch
    */
    function rewardRate(uint256 epoch) public pure override returns (uint256) {
        uint256 seriesRewards = 0;
        require(epoch > 0, "epoch cannot be 0");
        if (epoch > 161 && epoch <= 254) {
            seriesRewards = 9375;// 9,375
            return seriesRewards.mul(1e18).div(752 hours);
        } else if (epoch > 254 && epoch <= 347) {
            seriesRewards = 5625;// 5,625
            return seriesRewards.mul(1e18).div(31 days);
        } else if (epoch > 347 && epoch <= 437) {
            seriesRewards = 3750;// 3,750
            return seriesRewards.mul(1e18).div(30 days);
        } else {
            return 0;
        }
    }

}
