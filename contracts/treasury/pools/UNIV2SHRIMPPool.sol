// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.3;

import "./BasePool.sol";


contract UNIV2SHRIMPPool is BasePool {

    using SafeMath for uint256;

    uint256 public constant HALFLIFE = 7257600;// 84 days

    mapping(uint256 => uint256) public rewardsPerEpochSeries;
    uint256 public rewardsInCurrentEpochSeries;


    constructor(address poolTokenAddress, address lpTokenAddress)
        BasePool("UNIV2SHRIMPPool", poolTokenAddress, lpTokenAddress) {
    }

    function totalRewardsInEpoch(uint256 epoch) override pure public returns (uint256 totalRewards) {
        if (epoch == 0) {
            totalRewards = 2400000 * (10 ** 18);// 2.4 M
        }
        else if (epoch > 0 && epoch <= 84) {
            totalRewards = 12000000 * (10 ** 18);// 12 M
        }
        else if (epoch > 84 && epoch <= 336) {
            totalRewards = 41850000 * (10 ** 18);// 21.6 M
        }
        else if (epoch > 336 && epoch <= 588) {
            totalRewards = 10800000 * (10 ** 18);// 10.8 M
        }
        else if (epoch > 588 && epoch <= 840) {
            totalRewards = 5400000 * (10 ** 18);// 5.4 M
        }
        else if (epoch > 840 && epoch <= 1092) {
            totalRewards = 2700000 * (10 ** 18);// 2.7 M
        }
        else {
            totalRewards = 1350000 * (10 ** 18);// 1.35 M
        }

        return (epoch == 0) ? totalRewards : totalRewards.div(HALFLIFE.mul(3));
    }

}
