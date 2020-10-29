
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

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
      // assert.equal(59, await pacemaker.currentEpoch(), "currentEpoch is incorrect")
      expect(await pacemaker.currentEpoch())
      .to.be.bignumber.equal("59");
    })
  })
});
