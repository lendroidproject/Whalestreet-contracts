const timeMachine = require('ganache-time-traveler');

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

  const EPOCHPERIOD = 28800

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

    beforeEach(async() => {
        expect(await pacemaker.currentEpoch()).to.be.bignumber.equal("73");
        let snapshot = await timeMachine.takeSnapshot()
        snapshotId = snapshot['result']
    });

    afterEach(async() => {
        await timeMachine.revertToSnapshot(snapshotId);
    });

    it('check currentEpoch after starttime', async () => {
      expect(await pacemaker.currentEpoch()).to.be.bignumber.equal("73");
    })

    it('check currentEpoch before starttime', async () => {
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD * -65)
      expect(await pacemaker.currentEpoch()).to.be.bignumber.equal("8");
    })
  })
});
