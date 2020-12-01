const timeMachine = require('ganache-time-traveler');
const rewardsCalculator = require('../helpers/$HRIMPRewardsCalculator');

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,         // Converts to Time
  ether,        // Converts to ether
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

contract("UNIV2SHRIMPPool", (accounts) => {

  const UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");
  const MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
  const Mock$HRIMP = artifacts.require("Mock$HRIMP");

  const owner = accounts[0]
  const tester = accounts[1]
  const tester2 = accounts[2]
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
  const EPOCHPERIOD = 28800

  let pool, lpToken, rewardToken

  this.printstats = async () => {
      console.log(`\ncurrentEpoch : ${await pool.currentEpoch()}`)
      console.log("--- POOL STATS ---")
      console.log(`totalSupply : ${await pool.totalSupply()}`)
      // console.log(`lastUpdateTime : ${await pool.lastUpdateTime()}`)
      // console.log(`cachedRewardPerStake : ${await pool.cachedRewardPerStake()}`)
      // console.log(`rewardPerStake : ${await pool.rewardPerStake()}`)
      console.log("--- GENERAL STATS ---")
      console.log(`currentTime : ${await time.latest()}`)
      console.log("--- TESTER 1 STATS ---")
      console.log(`tester1 lastEpochStaked : ${await pool.lastEpochStaked(tester)}`)
      console.log(`tester1 balanceOf : ${await pool.balanceOf(tester)}`)
      // console.log(`tester1 userRewardPerStakePaid : ${await pool.userRewardPerStakePaid(tester)}`)
      console.log(`tester1 rewards : ${await pool.rewards(tester)}`)
      console.log(`tester1 earned : ${await pool.earned(tester)}`)
      // console.log("--- TESTER 2 STATS ---")
      // console.log(`tester2 lastEpochStaked : ${await pool.lastEpochStaked(tester2)}`)
      // console.log(`tester2 balanceOf : ${await pool.balanceOf(tester2)}`)
      // console.log(`tester2 userRewardPerStakePaid : ${await pool.userRewardPerStakePaid(tester2)}`)
      // console.log(`tester2 rewards : ${await pool.rewards(tester2)}`)
      // console.log(`tester2 earned : ${await pool.earned(tester2)}`)
    }

  beforeEach(async () => {
    pool = await UNIV2SHRIMPPool.deployed()
    lpToken = await MockLSTWETHUNIV2.deployed()
    rewardToken = await Mock$HRIMP.deployed()
  })

  describe('constructor', () => {

    after(async () => {
      // Mint .1 Lp token to the tester
      await lpToken.mint(tester, ether("0.1"));
      // Mint .1 Lp token to the tester2
      await lpToken.mint(tester2, ether("0.1"));
      // Mint 240,000,000 reward token to the pool contract
      await rewardToken.mint(pool.address, ether("240000000"));
      // Approve .1 Lp token to the Pool from tester
      await lpToken.approve(pool.address, ether("0.1"), {from: tester})
      // Approve .1 Lp token to the Pool from tester2
      await lpToken.approve(pool.address, ether("0.1"), {from: tester2})
    })

    it('deploys successfully', async () => {
      assert.equal(await pool.lpToken(), lpToken.address, "lpToken cannot be zero address")
      assert.equal(await pool.rewardToken(), rewardToken.address, "rewardToken cannot be zero address")
      assert.equal(await pool.poolName(), "UNIV2SHRIMPPool", "poolName is incorrect")
    })
  })

  describe('stake', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('succeeds', async () => {
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
      expect(await pool.totalSupply()).to.be.bignumber.equal("0");
      expect(await pool.balanceOf(tester)).to.be.bignumber.equal("0");
      // tester stakes .01 Lp tokens
      const txReceipt = await pool.stake(ether("0.01"), {from: tester})
      expectEvent(txReceipt, 'Staked', {
        user: tester,
        amount: ether("0.01"),
      });
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      expect(await pool.totalSupply()).to.be.bignumber.equal(ether("0.01"));
      expect(await pool.balanceOf(tester)).to.be.bignumber.equal(ether("0.01"));
    })

    it('fails when stake amount is 0', async () => {
      await expectRevert(
        pool.stake(ether("0"), {from: tester}),
        'Cannot stake 0',
      );
    })
  })

  describe('unstake', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('fails when unstake amount is 0', async () => {
      // tester stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester})
      await expectRevert(
        pool.unstake(ether("0"), {from: tester}),
        'Cannot unstake 0',
      );
    })

    it('fails when unstake happens in same epoch as stake', async () => {
      // tester stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester})
      await expectRevert(
        pool.unstake(ether("0.01"), {from: tester}),
        'Cannot unstake if staked during current epoch.',
      );
    })

    it('succeeds', async () => {
      // tester stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester})
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      // tester unstakes .01 Lp tokens
      const txReceipt = await pool.unstake(ether("0.01"), {from: tester})
      expectEvent(txReceipt, 'Unstaked', {
        user: tester,
        amount: ether("0.01"),
      });
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
    })
  })

  describe('earned', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('returns expected values', async () => {
      expectedTester1Rewards = 0
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
      // tester stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester})
      // wait for next epoch
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedTester1Rewards = (await pool.rewardRate(await pool.currentEpoch())).mul(new BN(60 * 60 * 8))
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
      // tester2 stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester2})
      // wait for next epoch
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedTester2Rewards = expectedTester1Rewards.div(new BN(2))
      expect(await pool.earned(tester2)).to.be.bignumber.equal(expectedTester2Rewards.toString());
      expectedTester1Rewards = expectedTester1Rewards.add(expectedTester2Rewards)
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
      // tester claims rewards
      await pool.claim({from: tester})
      // wait for next epoch
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedTester1Rewards = expectedTester2Rewards
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
    })
  })

  describe('claim', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('succeeds', async () => {
      // tester stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester})
      // wait for next epoch
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      epochRewards = (await pool.rewardRate(await pool.currentEpoch())).mul(new BN(60 * 60 * 8))
      // tester2 stakes .01 Lp tokens
      await pool.stake(ether("0.01"), {from: tester2})
      // wait for next epoch
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedRewards1 = epochRewards.add(epochRewards.div(new BN(2)))
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
      // Claim rewards for tester
      const txReceipt1 = await pool.claim({from: tester})
      expectEvent(txReceipt1, 'RewardClaimed', {
        user: tester,
        reward: expectedRewards1.toString(),
      });
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards1.toString());
      expect(await pool.earned(tester)).to.be.bignumber.equal(ether("0"))
      // wait for next epoch
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedRewards2 = epochRewards.div(new BN(2))
      // Claim rewards for tester
      const txReceipt2 = await pool.claim({from: tester})
      expectEvent(txReceipt2, 'RewardClaimed', {
        user: tester,
        reward: expectedRewards2.toString(),
      });
      // reward token balance has increased
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards1.add(expectedRewards2).toString());
    })
  })

  describe('unstakeAndClaim', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('succeeds', async () => {
      await pool.stake(ether("0.01"), {from: tester})
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedRewards = (await pool.rewardRate(await pool.currentEpoch())).mul(new BN(60 * 60 * 8))
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedRewards.toString());
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
      await pool.unstakeAndClaim({from: tester})
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards.toString());
      // revert on claim again
      expect(await pool.earned(tester)).to.be.bignumber.equal(ether("0"))
      await expectRevert(
        pool.claim({from: tester}),
        'No rewards to claim.',
      );
      // reward token balance has not changed
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards.toString());
    })
  })

  describe('rewardRate', () => {

    it('returns expected values', async () => {
      await expectRevert(
        pool.rewardRate(0),
        'epoch cannot be 0',
      );
      expect(await pool.rewardRate(81)).to.be.bignumber.equal(ether("4.960317460317460317"));// 12000000 / (28 * 86400)
      expect(await pool.rewardRate(90)).to.be.bignumber.equal(ether("2.976190476190476190"));// 21600000 / (84 * 86400)
      expect(await pool.rewardRate(350)).to.be.bignumber.equal(ether("1.488095238095238095"));// 10800000 / (84 * 86400)
      expect(await pool.rewardRate(650)).to.be.bignumber.equal(ether("0.744047619047619047"));// 5400000 / (84 * 86400)
      expect(await pool.rewardRate(1000)).to.be.bignumber.equal(ether("0.372023809523809523"));// 2700000 / (84 * 86400)
      expect(await pool.rewardRate(1200)).to.be.bignumber.equal(ether("0.186011904761904761"));// 1350000 / (84 * 86400)
    })
  })
});
