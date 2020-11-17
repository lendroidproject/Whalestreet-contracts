const timeMachine = require('ganache-time-traveler');
const currentEpoch = require('../helpers/currentEpoch')

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
        snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
        await timeMachine.revertToSnapshot(snapshotId);
    });

    it('check currentEpoch after starttime', async () => {
      expect(await pacemaker.currentEpoch()).to.be.bignumber.equal((currentEpoch(await time.latest())).toString());
    })

    it('check currentEpoch before starttime', async () => {
      await timeMachine.advanceTimeAndBlock(EPOCHPERIOD * - currentEpoch(await time.latest()))
      expect(await pacemaker.currentEpoch()).to.be.bignumber.equal("0");
    })
  })
});
