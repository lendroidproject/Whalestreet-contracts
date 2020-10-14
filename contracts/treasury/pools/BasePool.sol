// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.3;

import "@openzeppelin/contracts/math/Math.sol";
import "../abstracts/Pacemaker.sol";
import "../wrappers/LPTokenWrapper.sol";


abstract contract BasePool is LPTokenWrapper, Pacemaker {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    string public poolName;
    IERC20 public poolToken;

    mapping(uint256 => uint256) private _totalBalancesPerEpoch;
    mapping(address => mapping(uint256 => uint256)) private _balancesPerEpoch;
    mapping(address => uint256) public lastEpochStaked;
    mapping(address => uint256) public lastEpochRewardsClaimed;

    uint256 public starttime = HEARTBEATSTARTTIME;// 2020-12-04 00:00:00 (UTC UTC +00:00)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(string memory name, address poolTokenAddress, address lpTokenAddress) LPTokenWrapper(lpTokenAddress) {
        poolName = name;
        poolToken = IERC20(poolTokenAddress);
    }

    modifier checkStart(){
        require(block.timestamp >= starttime,"not start");
        _;
    }

    function totalRewardsInEpoch(uint256 epoch) virtual pure public returns (uint256 totalRewards);

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount) public checkStart override {
        require(amount > 0, "Cannot stake 0");
        _balancesPerEpoch[msg.sender][_currentEpoch()] = _balancesPerEpoch[msg.sender][_currentEpoch()].add(amount);
        _totalBalancesPerEpoch[_currentEpoch()] = _totalBalancesPerEpoch[_currentEpoch()].add(amount);
        lastEpochStaked[msg.sender] = _currentEpoch();
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) public checkStart override {
        require(amount > 0, "Cannot unstake 0");
        require(lastEpochStaked[msg.sender] < _currentEpoch(), "Cannot unstake if staked during current epoch.");
        super.unstake(amount);
        emit Unstaked(msg.sender, amount);
    }

    function unstakeAndClaim() checkStart external {
        unstake(balanceOf(msg.sender));
        claim();
    }

    function earned(address account)  public view returns (uint256 earnings) {
        earnings = 0;
        if (lastEpochStaked[msg.sender] > 0) {
            uint256 rewardPerEpoch = 0;
            for (uint256 epoch = lastEpochRewardsClaimed[account]; epoch < _currentEpoch(); epoch++) {
                rewardPerEpoch = _balancesPerEpoch[account][epoch].mul(totalRewardsInEpoch(epoch)).div(_totalBalancesPerEpoch[epoch]);
                earnings = earnings.add(rewardPerEpoch);
            }
        }

        return earnings;
    }

    function claim() public checkStart {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            lastEpochRewardsClaimed[msg.sender] = _currentEpoch();
            poolToken.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

}
