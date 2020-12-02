// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "./BasePool.sol";


/** @title UNIV2SHRIMPPool
    @author Lendroid Foundation
    @notice Inherits the BasePool contract, and contains reward distribution
        logic for the $HRIMP token.
    @dev Audit certificate : Pending
*/


// solhint-disable-next-line
contract UNIV2SHRIMPPool is BasePool {

    using SafeMath for uint256;

    /**
        @notice Registers the Pool name as “UNIV2SHRIMPPool” as Pool name,
                LST-WETH-UNIV2 as the LP Token, and
                $HRIMP as the Reward Token.
        @param rewardTokenAddress : $HRIMP Token address
        @param lpTokenAddress : LST-WETH-UNIV2 Token address
    */
    // solhint-disable-next-line func-visibility
    constructor(address rewardTokenAddress, address lpTokenAddress) BasePool("UNIV2SHRIMPPool",
        rewardTokenAddress, lpTokenAddress) {}// solhint-disable-line no-empty-blocks

    /**
        @notice Displays total $HRIMP rewards distributed per second in a given epoch.
        @dev Series 1 :
                Epochs : 1-84
                Total $HRIMP distributed : 12 M
                Distribution duration : 28 days
            Series 2 :
                Epochs : 85-337
                Total $HRIMP distributed : 21.6 M
                Distribution duration : 84 days
            Series 3 :
                Epochs : 337-589
                Total $HRIMP distributed : 10.8 M
                Distribution duration : 84 days
            Series 4 :
                Epochs : 589-841
                Total $HRIMP distributed : 5.4 M
                Distribution duration : 84 days
            Series 5 :
                Epochs : 841-1093
                Total $HRIMP distributed : 2.7 M
                Distribution duration : 84 days
            Series 6 :
                Epochs : 1094+
                Total $HRIMP distributed : 1.35 M
                Distribution duration : Forever, at 84 day intervals
        @param epoch : 8-hour window number
        @return $HRIMP Tokens distributed per second during the given epoch
    */
    function rewardRate(uint256 epoch) public pure override returns (uint256) {
        uint256 seriesRewards = 0;
        require(epoch > 0, "epoch cannot be 0");
        if (epoch <= 84) {
            seriesRewards = 12000000;// 12 M
        } else if (epoch > 84 && epoch <= 336) {
            seriesRewards = 21600000;// 21.6 M
        } else if (epoch > 336 && epoch <= 588) {
            seriesRewards = 10800000;// 10.8 M
        } else if (epoch > 588 && epoch <= 840) {
            seriesRewards = 5400000;// 5.4 M
        } else if (epoch > 840 && epoch <= 1092) {
            seriesRewards = 2700000;// 2.7 M
        } else {
            seriesRewards = 1350000;// 1.35 M
        }

        seriesRewards = seriesRewards.mul(1e18);
        return (epoch <= 84) ? seriesRewards.div(28 days) : seriesRewards.div(84 days);
    }

}
