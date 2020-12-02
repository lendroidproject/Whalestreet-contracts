// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/Math.sol";
import "../heartbeat/Pacemaker.sol";
import "./LPTokenWrapper.sol";


/** @title BasePool
    @author Lendroid Foundation
    @notice Inherits the LPTokenWrapper contract, performs additional functions
        on the stake and unstake functions, and includes logic to calculate and
        withdraw rewards.
        This contract is inherited by all Pool contracts.
    @dev Audit certificate : Pending
*/


abstract contract BasePool is LPTokenWrapper, Pacemaker {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address;

    string public poolName;
    IERC20 public rewardToken;

    uint256 public lastUpdateTime;
    uint256 public cachedRewardPerStake;

    mapping(address => uint256) public userRewardPerStakePaid;
    mapping(address => uint256) public lastEpochStaked;
    mapping(address => uint256) public rewards;

    uint256 public startTime = HEART_BEAT_START_TIME;// 2020-12-04 00:00:00 (UTC UTC +00:00)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    /**
        @notice Registers the Pool name, Reward Token address, and LP Token address.
        @param name : Name of the Pool
        @param rewardTokenAddress : address of the Reward Token
        @param lpTokenAddress : address of the LP Token
    */
    constructor(string memory name, address rewardTokenAddress, address lpTokenAddress) LPTokenWrapper(lpTokenAddress) {
        require(rewardTokenAddress.isContract(), "invalid rewardTokenAddress");
        rewardToken = IERC20(rewardTokenAddress);
        poolName = name;
    }

    /**
        @notice modifier to check if the startTime has been reached
    */
    modifier checkStart(){
        require(block.timestamp >= startTime, "startTime has not yet been reached");
        _;
    }

    function rewardPerStake() public view returns (uint256) {
        if (totalSupply() == 0) {
            return cachedRewardPerStake;
        }
        return
            cachedRewardPerStake.add(
                block.timestamp.sub(lastUpdateTime).mul(rewardRate(currentEpoch())).mul(1e18).div(totalSupply())
            );
    }

    /**
        @notice Displays earnings of an address so far.
        @param account : the given user address
        @return earnings of given address
    */
    function earned(address account) public view returns (uint256) {
        return balanceOf(account).mul(rewardPerStake().sub(userRewardPerStakePaid[account])).div(1e18).add(rewards[account]);
    }

    modifier updateRewards(address account) {
        cachedRewardPerStake = rewardPerStake();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerStakePaid[account] = cachedRewardPerStake;
        }
        _;
    }

    /**
        @notice Displays reward tokens per second for a given epoch. This
        function is implemented in contracts that inherit this contract.
    */
    function rewardRate(uint256 epoch) virtual pure public returns (uint256);

    /**
        @notice Stake / Deposit LP Token into the Pool.
        @dev Increases count of total LP Token staked in the current epoch.
             Increases count of LP Token staked for the caller in the current epoch.
             Register that caller last staked in the current epoch.
             Perform actions from BasePool.stake().
        @param amount : Amount of LP Token to stake
    */
    function stake(uint256 amount) public checkStart updateRewards(msg.sender) override {
        require(amount > 0, "Cannot stake 0");
        lastEpochStaked[msg.sender] = currentEpoch();
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    /**
        @notice Unstake / Withdraw staked LP Token from the Pool
        @inheritdoc LPTokenWrapper
    */
    function unstake(uint256 amount) public checkStart updateRewards(msg.sender) override {
        require(amount > 0, "Cannot unstake 0");
        require(lastEpochStaked[msg.sender] < currentEpoch(), "Cannot unstake if staked during current epoch.");
        super.unstake(amount);
        emit Unstaked(msg.sender, amount);
    }

    /**
        @notice Transfers earnings from previous epochs to the caller
    */
    function claim() public checkStart updateRewards(msg.sender) {
        require(rewards[msg.sender] > 0, "No rewards to claim");
        uint256 rewardsEarned = rewards[msg.sender];
        rewards[msg.sender] = 0;
        rewardToken.safeTransfer(msg.sender, rewardsEarned);
        emit RewardClaimed(msg.sender, rewardsEarned);
    }

    /**
        @notice Unstake the staked LP Token and claim corresponding earnings from the Pool
        @dev : Perform actions from unstake()
               Perform actions from claim()
    */
    function unstakeAndClaim() checkStart updateRewards(msg.sender) external {
        unstake(balanceOf(msg.sender));
        claim();
    }

}
