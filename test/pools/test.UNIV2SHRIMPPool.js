const timeMachine = require('ganache-time-traveler');

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
    })

    it('it succeeds', async () => {
      await lpToken.approve(pool.address, ether("0.1"), {from: tester})
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
      expect(await pool.totalSupply()).to.be.bignumber.equal("0");
      expect(await pool.balanceOf(tester)).to.be.bignumber.equal("0");
      // Stake .01 Lp token to the tester
      await pool.stake(ether("0.01"), {from: tester})
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      expect(await pool.totalSupply()).to.be.bignumber.equal(ether("0.01"));
      expect(await pool.balanceOf(tester)).to.be.bignumber.equal(ether("0.01"));
    })
  })

  describe('earned', () => {

    it('it returns correct earnings', async () => {
      expect(await pool.currentEpoch()).to.be.bignumber.equal("59");
      let snapshot = await timeMachine.takeSnapshot()
      snapshotId = snapshot['result']
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expect(await pool.currentEpoch()).to.be.bignumber.equal("60");
      expect(await pool.earned(tester)).to.be.bignumber.equal("1");
      await timeMachine.revertToSnapshot(snapshotId);
    })
  })

  describe('unstake', () => {

    it('it succeeds', async () => {
      expect(await pool.currentEpoch()).to.be.bignumber.equal("60");
      let snapshot = await timeMachine.takeSnapshot()
      snapshotId = snapshot['result']
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expect(await pool.currentEpoch()).to.be.bignumber.equal("61");
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
      await pool.unstake(ether("0.01"), {from: tester})
      expect(await lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
      await timeMachine.revertToSnapshot(snapshotId);
    })
  })

  describe('claim', () => {

    it('it succeeds', async () => {
      expect(await pool.currentEpoch()).to.be.bignumber.equal("60");
      let snapshot = await timeMachine.takeSnapshot()
      snapshotId = snapshot['result']
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      expect(await pool.currentEpoch()).to.be.bignumber.equal("61");
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
      await pool.claim({from: tester})
      expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
      await timeMachine.revertToSnapshot(snapshotId);
    })
  })
});
