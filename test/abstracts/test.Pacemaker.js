const { expectRevert, time } = require('@openzeppelin/test-helpers')

contract("Pacemaker", (accounts) => {

  const MockPacemaker = artifacts.require("MockPacemaker");

  const owner = accounts[0]
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  let pacemaker

  beforeEach(async () => {
    pacemaker = await MockPacemaker.deployed()

  })

  describe('constructor', () => {

    it('deploys with owner', async () => {
      assert.equal(owner, await pacemaker.owner(), "owner is not deployer")
    })

  })

  describe('currentEpoch', () => {

    it('check currentEpoch', async () => {
      assert.equal(8, await pacemaker.currentEpoch(), "currentEpoch is incorrect")
    })

    describe('currentEpoch', () => {

      it('check currentEpoch status', async () => {
        assert.equal(0, await pacemaker.currentEpoch(), "currentEpoch is incorrect")
      })
  })
});
