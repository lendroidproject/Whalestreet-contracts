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

  const HEARTBEATSTARTTIME = 1602288000;// 2020-10-10 00:00:00 (UTC UTC +00:00)
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

  describe('epochStartTimeFromTimestamp', () => {

    beforeEach(async() => {
        snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
        await timeMachine.revertToSnapshot(snapshotId);
    });

    it('returns correct value for currentEpoch', async () => {
      expect(await pacemaker.epochStartTimeFromTimestamp(HEARTBEATSTARTTIME)).to.be.bignumber.equal((HEARTBEATSTARTTIME).toString());
      expect(await pacemaker.epochStartTimeFromTimestamp(await time.latest())).to.be.bignumber.equal((HEARTBEATSTARTTIME + (currentEpoch(await time.latest()) - 1) * EPOCHPERIOD).toString());
    })

  })

  describe('epochEndTimeFromTimestamp', () => {

    beforeEach(async() => {
        snapshotId = (await timeMachine.takeSnapshot())['result']
    });

    afterEach(async() => {
        await timeMachine.revertToSnapshot(snapshotId);
    });

    it('returns correct value for currentEpoch', async () => {
      expect(await pacemaker.epochEndTimeFromTimestamp(HEARTBEATSTARTTIME - 1)).to.be.bignumber.equal((HEARTBEATSTARTTIME).toString());
      expect(await pacemaker.epochEndTimeFromTimestamp(HEARTBEATSTARTTIME)).to.be.bignumber.equal((HEARTBEATSTARTTIME + EPOCHPERIOD).toString());
      expect(await pacemaker.epochEndTimeFromTimestamp(await time.latest())).to.be.bignumber.equal(((HEARTBEATSTARTTIME + (currentEpoch(await time.latest()) - 1) * EPOCHPERIOD) + EPOCHPERIOD).toString());
    })

  })

});
