const { expectRevert, time } = require('@openzeppelin/test-helpers')

contract("UNIV2SHRIMPPool", (accounts) => {

  const UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");
  const MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
  const Mock$HRIMP = artifacts.require("Mock$HRIMP");

  const owner = accounts[0]
  const tester = accounts[1]
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  let pool, lpToken, rewardToken

  beforeEach(async () => {
    pool = await UNIV2SHRIMPPool.deployed()
    lpToken = await MockLSTWETHUNIV2.deployed()
    rewardToken = await Mock$HRIMP.deployed()
  })

  describe('constructor', () => {

    it('deploys successfully', async () => {
      assert.equal(await pool.lpToken(), lpToken.address, "lpToken cannot be zero address")
      assert.equal(await pool.poolToken(), rewardToken.addresss, "rewardToken cannot be zero address")
    })
  })

  describe('stake', () => {

    before(async () => {
      console.log(`lpToken address ${lpToken.address}`)
      // Mint .1 Lp token to the tester
      await lpToken.mint(tester, '100000000000000000');
      // Mint 240,000,000 reward token to the pool contract
      await rewardToken.mint(pool.address, '240000000000000000000000000');
    })

    it('it succeeds', async () => {
      await lpToken.approve(pool.address, '10000000000000000', {from: tester})
      await pool.stake( '10000000000000000', {from: tester})
    })
  })
});
