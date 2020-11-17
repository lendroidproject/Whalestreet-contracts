const timeMachine = require('ganache-time-traveler');
const $HRIMPRewardsPerEpoch = require('../helpers/$HRIMPRewardsPerEpoch');

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
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
  const EPOCHPERIOD = 28800

  let pool, lpToken, rewardToken

  beforeEach(async () => {
    pool = await UNIV2SHRIMPPool.deployed()
    lpToken = await MockLSTWETHUNIV2.deployed()
    rewardToken = await Mock$HRIMP.deployed()
  })

  describe('constructor', () => {

    it('deploys successfully', async () => {
      assert.equal(await pool.lpToken(), lpToken.address, "lpToken cannot be zero address")
      assert.equal(await pool.rewardToken(), rewardToken.address, "rewardToken cannot be zero address")
      assert.equal(await pool.poolName(), "UNIV2SHRIMPPool", "poolName is incorrect")
    })
  })

  describe('stake', () => {

    before(async () => {
      // Mint .1 Lp token to the tester
      await lpToken.mint(tester, ether("0.1"));
      // Mint 240,000,000 reward token to the pool contract
      await rewardToken.mint(pool.address, ether("240000000"));
      // Approve .1 Lp token to the Pool from tester
      await lpToken.approve(pool.address, ether("0.1"), {from: tester})
    })

    it('it succeeds', async () => {
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
      expect(await pool.totalSupply()).to.be.bignumber.equal("0");
      expect(await pool.balanceOf(tester)).to.be.bignumber.equal("0");
      // Stake .01 Lp token to the tester
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
      // Conditions that trigger a require statement can be precisely tested
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
      // Conditions that trigger a require statement can be precisely tested
      await expectRevert(
        pool.unstake(ether("0"), {from: tester}),
        'Cannot unstake 0',
      );
    })

    it('fails when unstake happens in same epoch as stake', async () => {
      // Conditions that trigger a require statement can be precisely tested
      await expectRevert(
        pool.unstake(ether("0.01"), {from: tester}),
        'Cannot unstake if staked during current epoch.',
      );
    })

    it('it succeeds', async () => {
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      // Stake .01 Lp token to the tester
      const txReceipt = await pool.unstake(ether("0.01"), {from: tester})
      expectEvent(txReceipt, 'Unstaked', {
        user: tester,
        amount: ether("0.01"),
      });
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
    })
  })

  describe('claim', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('it succeeds', async () => {
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedRewards = $HRIMPRewardsPerEpoch(await pool.currentEpoch())
      actualRewards = await pool.earned(tester)
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedRewards);
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
      // Stake .01 Lp token to the tester
      const txReceipt = await pool.claim({from: tester})
      expectEvent(txReceipt, 'RewardClaimed', {
        user: tester,
        reward: expectedRewards,
      });
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards);
      // claim again
      expect(await pool.earned(tester)).to.be.bignumber.equal(ether("0"))
      await pool.claim({from: tester})
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards);
    })
  })

  describe('unstakeAndClaim', () => {

    beforeEach(async() => {
      snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
      await timeMachine.revertToSnapshot(snapshotId);
    });

    it('it succeeds', async () => {
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expectedRewards = $HRIMPRewardsPerEpoch(await pool.currentEpoch())
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      expect(await pool.earned(tester)).to.be.bignumber.equal(expectedRewards);
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
      await pool.unstakeAndClaim({from: tester})
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards);
    })
  })

  describe('totalRewardsInEpoch', () => {

    it('it returns expected values', async () => {
      expect(await pool.totalRewardsInEpoch(0)).to.be.bignumber.equal(ether("2400000"));
      expect(await pool.totalRewardsInEpoch(81)).to.be.bignumber.equal(ether("0.551146384479717813"));// 12000000 / (7257600*3)
      expect(await pool.totalRewardsInEpoch(90)).to.be.bignumber.equal(ether("0.640707671957671957"));// 41850000 / (7257600*9)
      expect(await pool.totalRewardsInEpoch(350)).to.be.bignumber.equal(ether("0.165343915343915343"));// 10800000 / (7257600*9)
      expect(await pool.totalRewardsInEpoch(650)).to.be.bignumber.equal(ether("0.082671957671957671"));// 5400000 / (7257600*9)
      expect(await pool.totalRewardsInEpoch(1000)).to.be.bignumber.equal(ether("0.041335978835978835"));// 2700000 / (7257600*9)
      expect(await pool.totalRewardsInEpoch(1200)).to.be.bignumber.equal(ether("0.020667989417989417"));// 1350000 / (7257600*9)
    })
  })
});
