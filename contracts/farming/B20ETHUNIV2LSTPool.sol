// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "./BasePool.sol";


/** @title UNIV2SHRIMPPool
    @author Lendroid Foundation
    @notice Inherits the BasePool contract, and contains reward distribution
        logic for the LST token.
*/


// solhint-disable-next-line
contract B20ETHUNIV2LSTPool is BasePool {

    using SafeMath for uint256;

    /**
        @notice Registers the Pool name as B20ETHUNIV2LSTPool as Pool name,
                B20-WETH-UNIV2 as the LP Token, and
                LST as the Reward Token.
        @param rewardTokenAddress : LST Token address
        @param lpTokenAddress : B20-WETH-UNIV2 Token address
    */
    // solhint-disable-next-line func-visibility
    constructor(address rewardTokenAddress, address lpTokenAddress) BasePool("B20ETHUNIV2LSTPool",
        rewardTokenAddress, lpTokenAddress) {}// solhint-disable-line no-empty-blocks

    /**
        @notice Displays total LST rewards distributed per second in a given epoch.
        @dev Series 1 :
                Epochs : 162-254
                Total LST distributed : 4 M
                Distribution duration : 31 days and 8 hours (Jan 28:16:00 to Feb 29 59:59:59 GMT)
            Series 2 :
                Epochs : 255-347
                Total LST distributed : 3 M
                Distribution duration : 31 days (Mar 1 00:00:00 GMT to Mar 31 59:59:59 GMT)
            Series 3 :
                Epochs : 348-437
                Total LST distributed : 1.5 M
                Distribution duration : 30 days (Apr 1 00:00:00 GMT to Apr 30 59:59:59 GMT)
            Series 4 :
                Epochs : 438-530
                Total LST distributed : 0.5 M
                Distribution duration : 31 days (May 1 00:00:00 GMT to May 31 59:59:59 GMT)
            Series 5 :
                Epochs : 531-620
                Total LST distributed : 0.5 M
                Distribution duration : 30 days (Jun 1 00:00:00 GMT to Jun 30 59:59:59 GMT)
            Series 6 :
                Epochs : 621-713
                Total LST distributed : 0.5 M
                Distribution duration : 31 days (Jul 1 00:00:00 GMT to Jul 31 59:59:59 GMT)
        @param epoch : 8-hour window number
        @return LST Tokens distributed per second during the given epoch
    */
    function rewardRate(uint256 epoch) public pure override returns (uint256) {
        uint256 seriesRewards = 0;
        require(epoch > 0, "epoch cannot be 0");
        if (epoch > 161 && epoch <= 254) {
            seriesRewards = 4000000;// 4 M
            return seriesRewards.mul(1e18).div(752 hours);
        } else if (epoch > 254 && epoch <= 347) {
            seriesRewards = 3000000;// 3 M
            return seriesRewards.mul(1e18).div(31 days);
        } else if (epoch > 347 && epoch <= 437) {
            seriesRewards = 1500000;// 1.5 M
            return seriesRewards.mul(1e18).div(30 days);
        } else if (epoch > 437 && epoch <= 530) {
            seriesRewards = 500000;// 0.5 M
            return seriesRewards.mul(1e18).div(31 days);
        } else if (epoch > 530 && epoch <= 620) {
            seriesRewards = 500000;// 0.5 M
            return seriesRewards.mul(1e18).div(30 days);
        } else if (epoch > 620 && epoch <= 713) {
            seriesRewards = 500000;// 0.5 M
            return seriesRewards.mul(1e18).div(31 days);
        } else {
            return 0;
        }
    }

}
