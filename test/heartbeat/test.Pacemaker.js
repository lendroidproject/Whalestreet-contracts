const timeMachine = require("ganache-time-traveler");
const currentEpoch = require("../helpers/currentEpoch");

const { time } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

contract("Pacemaker", (accounts) => {

    const MockPacemaker = artifacts.require("MockPacemaker");

    const owner = accounts[0];

    const HEART_BEAT_START_TIME = 1607212800;// 2020-12-06 00:00:00 UTC (UTC +00:00)
    const EPOCH_PERIOD = 28800;

    this.pacemaker = null;

    beforeEach(async () => {
        this.pacemaker = await MockPacemaker.deployed();

    });

    describe("constructor", () => {

        after(async () => {
            // set time to HEART_BEAT_START_TIME
            await timeMachine.advanceBlockAndSetTime(HEART_BEAT_START_TIME+1);
        });

        it("deploys with owner", async () => {
            assert.equal(owner, await this.pacemaker.owner(), "owner is not deployer");
        });

    });

    describe("currentEpoch", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("check currentEpoch after starttime", async () => {
            expect(await this.pacemaker.currentEpoch()).to.be.bignumber.equal((currentEpoch(await time.latest())).toString());
        });

        it("check currentEpoch before starttime", async () => {
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD * - currentEpoch(await time.latest()));
            expect(await this.pacemaker.currentEpoch()).to.be.bignumber.equal("0");
        });

    });

    describe("epochStartTimeFromTimestamp", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("returns correct value for currentEpoch", async () => {
            expect(await this.pacemaker.epochStartTimeFromTimestamp(HEART_BEAT_START_TIME)).to.be.bignumber.equal((HEART_BEAT_START_TIME).toString());
            expect(await this.pacemaker.epochStartTimeFromTimestamp(await time.latest())).to.be.bignumber.equal((HEART_BEAT_START_TIME + (currentEpoch(await time.latest()) - 1) * EPOCH_PERIOD).toString());
        });

    });

    describe("epochEndTimeFromTimestamp", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("returns correct value for currentEpoch", async () => {
            expect(await this.pacemaker.epochEndTimeFromTimestamp(HEART_BEAT_START_TIME - 1)).to.be.bignumber.equal((HEART_BEAT_START_TIME).toString());
            expect(await this.pacemaker.epochEndTimeFromTimestamp(HEART_BEAT_START_TIME)).to.be.bignumber.equal((HEART_BEAT_START_TIME + EPOCH_PERIOD).toString());
            expect(await this.pacemaker.epochEndTimeFromTimestamp(await time.latest())).to.be.bignumber.equal(((HEART_BEAT_START_TIME + (currentEpoch(await time.latest()) - 1) * EPOCH_PERIOD) + EPOCH_PERIOD).toString());
        });

    });

});
