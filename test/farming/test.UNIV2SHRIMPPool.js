const timeMachine = require("ganache-time-traveler");

const {
    BN,           // Big Number support
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    time,         // Converts to Time
    ether,        // Converts to ether
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

contract("UNIV2SHRIMPPool", (accounts) => {

    const UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");
    const MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
    const Mock$HRIMP = artifacts.require("Mock$HRIMP");

    const tester = accounts[1];
    const tester2 = accounts[2];
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const HEART_BEAT_START_TIME = 1607040000;// 2020-12-04 00:00:00 (UTC UTC +00:00)
    const EPOCH_PERIOD = 28800;

    this.pool = null;
    this.lpToken = null;
    this.rewardToken = null;

    this.printstats = async () => {
        console.log(`\ncurrentEpoch : ${await this.pool.currentEpoch()}`);
        console.log("--- POOL STATS ---");
        console.log(`totalSupply : ${await this.pool.totalSupply()}`);
        // console.log(`lastUpdateTime : ${await this.pool.lastUpdateTime()}`)
        // console.log(`cachedRewardPerStake : ${await this.pool.cachedRewardPerStake()}`)
        // console.log(`rewardPerStake : ${await this.pool.rewardPerStake()}`)
        console.log("--- GENERAL STATS ---");
        console.log(`currentTime : ${await time.latest()}`);
        console.log("--- TESTER 1 STATS ---");
        console.log(`tester1 lastEpochStaked : ${await this.pool.lastEpochStaked(tester)}`);
        console.log(`tester1 balanceOf : ${await this.pool.balanceOf(tester)}`);
        // console.log(`tester1 userRewardPerStakePaid : ${await this.pool.userRewardPerStakePaid(tester)}`)
        console.log(`tester1 rewards : ${await this.pool.rewards(tester)}`);
        console.log(`tester1 earned : ${await this.pool.earned(tester)}`);
        // console.log("--- TESTER 2 STATS ---")
        // console.log(`tester2 lastEpochStaked : ${await this.pool.lastEpochStaked(tester2)}`)
        // console.log(`tester2 balanceOf : ${await this.pool.balanceOf(tester2)}`)
        // console.log(`tester2 userRewardPerStakePaid : ${await this.pool.userRewardPerStakePaid(tester2)}`)
        // console.log(`tester2 rewards : ${await this.pool.rewards(tester2)}`)
        // console.log(`tester2 earned : ${await this.pool.earned(tester2)}`)
    };

    beforeEach(async () => {
        this.pool = await UNIV2SHRIMPPool.deployed();
        this.lpToken = await MockLSTWETHUNIV2.deployed();
        this.rewardToken = await Mock$HRIMP.deployed();
    });

    describe("constructor", () => {

        after(async () => {
            // Mint 237,600,000 reward token to the pool contract
            await this.rewardToken.mint(this.pool.address, ether("237600000"));
            // Mint .1 Lp token to the tester
            await this.lpToken.mint(tester, ether("0.1"));
            // Approve .1 Lp token to the Pool from tester
            await this.lpToken.approve(this.pool.address, ether("0.1"), {from: tester});
            // Mint .1 Lp token to the tester2
            await this.lpToken.mint(tester2, ether("0.1"));
            // Approve .1 Lp token to the Pool from tester2
            await this.lpToken.approve(this.pool.address, ether("0.1"), {from: tester2});
            // set time to HEART_BEAT_START_TIME
            await timeMachine.advanceBlockAndSetTime(HEART_BEAT_START_TIME+1);
        });

        it("fails when deployed with invalid rewardTokenAddress", async () => {
            // call when rewardTokenAddress = ZERO_ADDRESS will revert
            await expectRevert(
                UNIV2SHRIMPPool.new(ZERO_ADDRESS, this.lpToken.address),
                "invalid rewardTokenAddress",
            );
            // call when rewardTokenAddress is not ZERO_ADDRESS and not contract will revert
            await expectRevert(
                UNIV2SHRIMPPool.new(accounts[1], this.lpToken.address),
                "invalid rewardTokenAddress",
            );
        });

        it("fails when deployed with invalid lpTokenAddress", async () => {
            // call when lpTokenAddress = ZERO_ADDRESS will revert
            await expectRevert(
                UNIV2SHRIMPPool.new(this.rewardToken.address, ZERO_ADDRESS),
                "invalid lpTokenAddress",
            );
            // call when lpTokenAddress is not ZERO_ADDRESS and not contract will revert
            await expectRevert(
                UNIV2SHRIMPPool.new(this.rewardToken.address, accounts[1]),
                "invalid lpTokenAddress",
            );
        });

        it("deploys successfully", async () => {
            assert.equal(await this.pool.lpToken(), this.lpToken.address, "lpToken cannot be zero address");
            assert.equal(await this.pool.rewardToken(), this.rewardToken.address, "rewardToken cannot be zero address");
            assert.equal(await this.pool.poolName(), "UNIV2SHRIMPPool", "poolName is incorrect");
        });
    });

    describe("stake", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("succeeds", async () => {
            expect(await this.lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
            expect(await this.pool.totalSupply()).to.be.bignumber.equal("0");
            expect(await this.pool.balanceOf(tester)).to.be.bignumber.equal("0");
            // tester stakes .01 Lp tokens
            const txReceipt = await this.pool.stake(ether("0.01"), {from: tester});
            expectEvent(txReceipt, "Staked", {
                user: tester,
                amount: ether("0.01"),
            });
            expect(await this.lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
            expect(await this.pool.totalSupply()).to.be.bignumber.equal(ether("0.01"));
            expect(await this.pool.balanceOf(tester)).to.be.bignumber.equal(ether("0.01"));
        });

        it("fails when stake amount is 0", async () => {
            await expectRevert(
                this.pool.stake(ether("0"), {from: tester}),
                "Cannot stake 0",
            );
        });

        it("fails if trying to stake before start time", async () => {
            // reverse time to before start time
            await timeMachine.advanceBlockAndSetTime(HEART_BEAT_START_TIME);
            await expectRevert(
                this.pool.stake(ether("0.01"), {from: tester}),
                "startTime has not been reached",
            );
        });
    });

    describe("unstake", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("fails when unstake amount is 0", async () => {
            // tester stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester});
            await expectRevert(
                this.pool.unstake(ether("0"), {from: tester}),
                "Cannot unstake 0",
            );
        });

        it("fails when unstake happens in same epoch as stake", async () => {
            // tester stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester});
            await expectRevert(
                this.pool.unstake(ether("0.01"), {from: tester}),
                "Cannot unstake in staked epoch.",
            );
        });

        it("succeeds", async () => {
            // tester stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester});
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expect(await this.lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
            // tester unstakes .01 Lp tokens
            const txReceipt = await this.pool.unstake(ether("0.01"), {from: tester});
            expectEvent(txReceipt, "Unstaked", {
                user: tester,
                amount: ether("0.01"),
            });
            expect(await this.lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
        });
    });

    describe("earned", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("returns expected values", async () => {
            expectedTester1Rewards = 0;
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
            // tester stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester});
            // wait for next epoch
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expectedTester1Rewards = (await this.pool.rewardRate(await this.pool.currentEpoch())).mul(new BN(60 * 60 * 8));
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
            // tester2 stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester2});
            // wait for next epoch
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expectedTester2Rewards = expectedTester1Rewards.div(new BN(2));
            expect(await this.pool.earned(tester2)).to.be.bignumber.equal(expectedTester2Rewards.toString());
            expectedTester1Rewards = expectedTester1Rewards.add(expectedTester2Rewards);
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
            // tester claims rewards
            await this.pool.claim({from: tester});
            // wait for next epoch
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expectedTester1Rewards = expectedTester2Rewards;
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(expectedTester1Rewards.toString());
        });
    });

    describe("claim", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("succeeds", async () => {
            // tester stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester});
            // wait for next epoch
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            epochRewards = (await this.pool.rewardRate(await this.pool.currentEpoch())).mul(new BN(60 * 60 * 8));
            // tester2 stakes .01 Lp tokens
            await this.pool.stake(ether("0.01"), {from: tester2});
            // wait for next epoch
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expectedRewards1 = epochRewards.add(epochRewards.div(new BN(2)));
            expect(await this.rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
            // Claim rewards for tester
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(expectedRewards1.toString());
            const txReceipt1 = await this.pool.claim({from: tester});
            expectEvent(txReceipt1, "RewardClaimed", {
                user: tester,
                reward: expectedRewards1.toString(),
            });
            expect(await this.rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards1.toString());
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(ether("0"));
            // wait for next epoch
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expectedRewards2 = epochRewards.div(new BN(2));
            // Claim rewards for tester
            const txReceipt2 = await this.pool.claim({from: tester});
            expectEvent(txReceipt2, "RewardClaimed", {
                user: tester,
                reward: expectedRewards2.toString(),
            });
            // reward token balance has increased
            expect(await this.rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards1.add(expectedRewards2).toString());
        });

    });

    describe("unstakeAndClaim", () => {

        beforeEach(async() => {
            snapshotId = (await timeMachine.takeSnapshot())["result"];
        });

        afterEach(async() => {
            await timeMachine.revertToSnapshot(snapshotId);
        });

        it("succeeds", async () => {
            await this.pool.stake(ether("0.01"), {from: tester});
            await timeMachine.advanceTimeAndBlock(EPOCH_PERIOD);
            expect(await this.lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.09"));
            expect(await this.rewardToken.balanceOf(tester)).to.be.bignumber.equal("0");
            expectedRewards = (await this.pool.rewardRate(await this.pool.currentEpoch())).mul(new BN(60 * 60 * 8));
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(expectedRewards.toString());
            // tester unstakes 0.1 Lp tokens and claims rewards
            await this.pool.unstakeAndClaim({from: tester});
            expect(await this.lpToken.balanceOf(tester)).to.be.bignumber.equal(ether("0.1"));
            expect(await this.rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards.toString());
            // revert on claim again
            expect(await this.pool.earned(tester)).to.be.bignumber.equal(ether("0"));
            await expectRevert(
                this.pool.claim({from: tester}),
                "No rewards to claim.",
            );
            // reward token balance has not changed
            expect(await this.rewardToken.balanceOf(tester)).to.be.bignumber.equal(expectedRewards.toString());
        });

    });

    describe("rewardRate", () => {

        it("returns expected values", async () => {
            await expectRevert(
                this.pool.rewardRate(0),
                "epoch cannot be 0",
            );
            expect(await this.pool.rewardRate(81)).to.be.bignumber.equal(ether("4.960317460317460317"));// 12000000 / (28 * 86400)
            expect(await this.pool.rewardRate(90)).to.be.bignumber.equal(ether("2.976190476190476190"));// 21600000 / (84 * 86400)
            expect(await this.pool.rewardRate(350)).to.be.bignumber.equal(ether("1.488095238095238095"));// 10800000 / (84 * 86400)
            expect(await this.pool.rewardRate(650)).to.be.bignumber.equal(ether("0.744047619047619047"));// 5400000 / (84 * 86400)
            expect(await this.pool.rewardRate(1000)).to.be.bignumber.equal(ether("0.372023809523809523"));// 2700000 / (84 * 86400)
            expect(await this.pool.rewardRate(1200)).to.be.bignumber.equal(ether("0.186011904761904761"));// 1350000 / (84 * 86400)
        });
    });

});
