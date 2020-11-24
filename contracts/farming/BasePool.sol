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
    string public poolName;
    IERC20 public rewardToken;

    mapping(address => uint256) public lastEpochStaked;
    mapping(address => uint256) public lastEpochRewardsCalculated;
    mapping(address => uint256) public rewards;

    uint256 public starttime = HEARTBEATSTARTTIME;// 2020-12-04 00:00:00 (UTC UTC +00:00)

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
        rewardToken = IERC20(rewardTokenAddress);
        poolName = name;
    }

    /**
        @notice modifier to check if the starttime has been reached
    */
    modifier checkStart(){
        require(block.timestamp >= starttime,"not start");
        _;
    }

    /**
        @notice Displays total reward tokens available for a given epoch. This
        function is implemented in contracts that inherit this contract.
    */
    function totalRewardsInEpoch(uint256 epoch) virtual pure public returns (uint256 totalRewards);

    function calculateRewards(address account) view internal returns(uint256 updatedRewards) {
        updatedRewards = 0;
        if (lastEpochRewardsCalculated[account] < currentEpoch()) {
            for (uint256 epoch = lastEpochRewardsCalculated[account]; epoch < currentEpoch(); epoch++) {
                updatedRewards = updatedRewards.add(balanceOf(account).mul(totalRewardsInEpoch(epoch)).div(totalSupply()));
            }
        }
    }

    function updateRewards(address account) internal {
        if (totalSupply() > 0) {
            rewards[account] = calculateRewards(account);
        }
        lastEpochRewardsCalculated[account] = currentEpoch();
    }

    /**
        @notice Stake / Deposit LP Token into the Pool.
        @dev Increases count of total LP Token staked in the current epoch.
             Increases count of LP Token staked for the caller in the current epoch.
             Register that caller last staked in the current epoch.
             Perform actions from BasePool.stake().
        @param amount : Amount of LP Token to stake
    */
    function stake(uint256 amount) public checkStart override {
        require(amount > 0, "Cannot stake 0");
        lastEpochStaked[msg.sender] = currentEpoch();
        if (lastEpochRewardsCalculated[msg.sender] == 0) {
            lastEpochRewardsCalculated[msg.sender] = currentEpoch();
        }
        else {
            updateRewards(msg.sender);
        }
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    /**
        @notice Unstake / Withdraw staked LP Token from the Pool
        @inheritdoc LPTokenWrapper
    */
    function unstake(uint256 amount) public checkStart override {
        require(amount > 0, "Cannot unstake 0");
        require(lastEpochStaked[msg.sender] < currentEpoch(), "Cannot unstake if staked during current epoch.");
        updateRewards(msg.sender);
        super.unstake(amount);
        emit Unstaked(msg.sender, amount);
    }

    /**
        @notice Transfers earnings from previous epochs to the caller
    */
    function claim() public checkStart {
        updateRewards(msg.sender);
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
    function unstakeAndClaim() checkStart external {
        unstake(balanceOf(msg.sender));
        claim();
    }

    /**
        @notice Displays earnings of a given address from previous epochs.
        @param account : the given user address
        @return earnings of given address since last withdrawn epoch
    */
    function earned(address account) public view returns (uint256 earnings) {
        earnings = 0;
        if (currentEpoch() > 1) {
            earnings = calculateRewards(account);
        }
    }

}
