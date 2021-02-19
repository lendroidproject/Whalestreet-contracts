// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "./BasePool.sol";


/** @title $HRIMPETHUNIV2B20Pool
    @author Lendroid Foundation
    @notice Inherits the BasePool contract, and contains reward distribution
        logic for the B20 token.
*/


// solhint-disable-next-line
contract LSTETHUNIV2B20Pool is BasePool {

    using SafeMath for uint256;

    /**
        @notice Registers the Pool name as B20ETHUNIV2B20Pool as Pool name,
                LST-WETH-UNIV2 as the LP Token, and
                B20 as the Reward Token.
        @param rewardTokenAddress : B20 Token address
        @param lpTokenAddress : LST-WETH-UNIV2 Token address
    */
    // solhint-disable-next-line func-visibility
    constructor(address rewardTokenAddress, address lpTokenAddress) BasePool("LSTETHUNIV2B20Pool",
        rewardTokenAddress, lpTokenAddress) {}// solhint-disable-line no-empty-blocks

    /**
        @notice Displays total B20 rewards distributed per second in a given epoch.
        @dev Series 1 :
                Epochs : 162-254
                Total B20 distributed : 18,750
                Distribution duration : 31 days and 8 hours (Jan 28:16:00 to Feb 29 59:59:59 GMT)
            Series 2 :
                Epochs : 255-347
                Total B20 distributed : 11,250
                Distribution duration : 31 days (Mar 1 00:00:00 GMT to Mar 31 59:59:59 GMT)
            Series 3 :
                Epochs : 348-437
                Total B20 distributed : 7,500
                Distribution duration : 30 days (Apr 1 00:00:00 GMT to Apr 30 59:59:59 GMT)
        @param epoch : 8-hour window number
        @return B20 Tokens distributed per second during the given epoch
    */
    function rewardRate(uint256 epoch) public pure override returns (uint256) {
        uint256 seriesRewards = 0;
        require(epoch > 0, "epoch cannot be 0");
        if (epoch > 161 && epoch <= 254) {
            seriesRewards = 18750;// 18,750
            return seriesRewards.mul(1e18).div(752 hours);
        } else if (epoch > 254 && epoch <= 347) {
            seriesRewards = 11250;// 11,250
            return seriesRewards.mul(1e18).div(31 days);
        } else if (epoch > 347 && epoch <= 437) {
            seriesRewards = 7500;// 7,500
            return seriesRewards.mul(1e18).div(30 days);
        } else {
            return 0;
        }
    }

}
