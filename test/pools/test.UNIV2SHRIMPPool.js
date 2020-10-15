const { expectRevert, time } = require('@openzeppelin/test-helpers')
const timeMachine = require('ganache-time-traveler');


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
      await lpToken.mint(tester, '100000000000000000');
      // Mint 240,000,000 reward token to the pool contract
      await rewardToken.mint(pool.address, '240000000000000000000000000');
    })

    it('it succeeds', async () => {
      await lpToken.approve(pool.address, '10000000000000000', {from: tester})
      assert.equal('100000000000000000', await lpToken.balanceOf(tester), "invalid balanceOf lpToken for tester")
      assert.equal(0, await pool.totalSupply(), "totalSupply of pool is incorrect")
      assert.equal(0, await pool.balanceOf(tester), "staked amount of tester is incorrect")
      // Stake .01 Lp token to the tester
      await pool.stake('10000000000000000', {from: tester})
      assert.equal('90000000000000000', await lpToken.balanceOf(tester), "invalid balanceOf lpToken for tester")
      assert.equal('10000000000000000', await pool.totalSupply(), "totalSupply of pool is incorrect")
      assert.equal('10000000000000000', await pool.balanceOf(tester), "staked amount of tester is incorrect")
    })
  })

  describe('earned', () => {

    it('it returns correct earnings', async () => {
      assert.equal(17, await pool.currentEpoch(), "currentEpoch is incorrect")
      let snapshot = await timeMachine.takeSnapshot()
      snapshotId = snapshot['result']
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      assert.equal(18, await pool.currentEpoch(), "currentEpoch is incorrect")
      assert.equal(await pool.earned(tester), "1", "earnings are incorrect")
      await timeMachine.revertToSnapshot(snapshotId);
    })
  })

  describe('unstake', () => {

    it('it succeeds', async () => {
      assert.equal(18, await pool.currentEpoch(), "currentEpoch is incorrect")
      let snapshot = await timeMachine.takeSnapshot()
      snapshotId = snapshot['result']
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      assert.equal(19, await pool.currentEpoch(), "currentEpoch is incorrect")
      assert.equal('90000000000000000', await lpToken.balanceOf(tester), "invalid balanceOf lpToken for tester")
      await pool.unstake('10000000000000000', {from: tester})
      assert.equal('100000000000000000', await lpToken.balanceOf(tester), "invalid balanceOf lpToken for tester")
      await timeMachine.revertToSnapshot(snapshotId);
    })
  })

  describe('claim', () => {

    it('it succeeds', async () => {
      assert.equal(18, await pool.currentEpoch(), "currentEpoch is incorrect")
      let snapshot = await timeMachine.takeSnapshot()
      snapshotId = snapshot['result']
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD)
      assert.equal(19, await pool.currentEpoch(), "currentEpoch is incorrect")
      assert.equal(0, await rewardToken.balanceOf(tester), "invalid balanceOf rewardToken for tester")
      await pool.claim({from: tester})
      assert.equal(0, await rewardToken.balanceOf(tester), "invalid balanceOf rewardToken for tester")
      await timeMachine.revertToSnapshot(snapshotId);
    })
  })
});
