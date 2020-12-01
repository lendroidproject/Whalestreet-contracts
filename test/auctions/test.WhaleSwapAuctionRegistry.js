// const timeMachine = require('ganache-time-traveler');
// const linearAuctionPriceY = require('../helpers/linearAuctionPriceY');
//
// const {
//   BN,           // Big Number support
//   constants,    // Common constants, like the zero address and largest integers
//   expectEvent,  // Assertions for emitted events
//   expectRevert, // Assertions for transactions that should fail
//   time,         // Converts to Time
//   ether,        // Converts to ether
// } = require('@openzeppelin/test-helpers');
//
// const { expect } = require('chai');
//
// contract("WhaleSwapAuctionRegistry", (accounts) => {
//
//   const UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");
//   const MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
//   const Mock$HRIMP = artifacts.require("Mock$HRIMP");
//   const WhaleSwapToken = artifacts.require("WhaleSwapToken");
//   const MockAuctionTokenProbabilityDistribution = artifacts.require("MockAuctionTokenProbabilityDistribution");
//   const MockKovanWhaleSwapAuctionRegistry = artifacts.require("MockKovanWhaleSwapAuctionRegistry");
//
//   const owner = accounts[0]
//   const tester = accounts[1]
//   const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
//   const EPOCHPERIOD = 28800
//
//   let rewardToken, auctionToken, auctionRegistry, probabilityDistribution
//
//   beforeEach(async () => {
//     rewardToken = await Mock$HRIMP.deployed()
//     auctionToken = await WhaleSwapToken.deployed()
//     probabilityDistribution = await MockAuctionTokenProbabilityDistribution.deployed()
//     auctionRegistry = await MockKovanWhaleSwapAuctionRegistry.deployed()
//   })
//
//   describe('constructor', () => {
//
//     after(async () => {
//       // Mint 350,000 reward token to tester
//       await rewardToken.mint(tester, ether("350000"));
//       // Approve 1 rewardToken to the auctionRegistry from tester
//       await rewardToken.approve(auctionRegistry.address, ether("350000"), {from: tester})
//       // Set maxY
//       await auctionRegistry.setMaxY(ether("300000"));
//     })
//
//     it('deploys successfully', async () => {
//       assert.equal(await auctionRegistry.rewardToken(), rewardToken.address, "rewardToken cannot be zero address")
//       assert.equal(await auctionRegistry.auctionToken(), auctionToken.address, "auctionToken is incorrect")
//       assert.equal(await auctionRegistry.probabilityDistribution(), probabilityDistribution.address, "probabilityDistribution is incorrect")
//       assert.equal(await auctionRegistry.purchaseLocked(), false, "purchaseLocked is incorrect")
//     })
//
//   })
//
//   describe('purchase', () => {
//
//     beforeEach(async() => {
//       snapshotId = (await timeMachine.takeSnapshot())['result']
//     });
//
//     afterEach(async() => {
//       await timeMachine.revertToSnapshot(snapshotId);
//     });
//
//     it('it succeeds', async () => {
//       expect(await auctionRegistry.totalPurchases()).to.be.bignumber.equal("0");
//       expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(ether("350000"));
//       expect(await rewardToken.balanceOf(auctionRegistry.address)).to.be.bignumber.equal(ether("0"));
//       // Make first purchase with 1 rewardToken
//       currentEpoch = await auctionRegistry.currentEpoch();
//       y1 = 300000
//       x = (await time.latest()).toNumber() - (await auctionRegistry.epochStartTimeFromTimestamp(await time.latest())).toNumber()
//       currentPrice = linearAuctionPriceY(y1, x)
//       console.log(`currentPrice : ${await auctionRegistry.currentPrice()}`)
//       console.log(`currentPrice : ${currentPrice}`)
//       const txReceipt = await auctionRegistry.purchase({from: tester})
//       expectEvent(txReceipt, 'PurchaseMade', {
//         account: tester,
//         epoch: currentEpoch,
//         purchaseAmount: ether("300000")
//       });
//       expect(await auctionRegistry.totalPurchases()).to.be.bignumber.equal("1");
//       expect(await rewardToken.balanceOf(tester)).to.be.bignumber.equal(ether("50000"));
//       expect(await rewardToken.balanceOf(auctionRegistry.address)).to.be.bignumber.equal(ether("300000"));
//     })
//
//     it('fails for consecutive purchases within same epoch', async () => {
//       await auctionRegistry.purchase({from: tester})
//       // Conditions that trigger a require statement can be precisely tested
//       await expectRevert(
//         auctionRegistry.purchase({from: tester}),
//         'Current price is 0',
//       );
//     })
//   })
//
//   describe('currentPrice', () => {
//
//     beforeEach(async() => {
//       snapshotId = (await timeMachine.takeSnapshot())['result']
//     })
//
//     afterEach(async() => {
//       await timeMachine.revertToSnapshot(snapshotId);
//     })
//
//     it('0 after purchase for given epoch', async () => {
//       await auctionRegistry.purchase({from: tester})
//       expect(await auctionRegistry.currentPrice()).to.be.bignumber.equal(ether("0"));
//     })
//
//     it('at start of next epoch equals last purchase amount', async () => {
//       currentPrice = await auctionRegistry.currentPrice()
//       await auctionRegistry.purchase({from: tester})
//       await timeMachine.advanceTimeAndBlock((await auctionRegistry.epochEndTimeFromTimestamp(await time.latest())).toNumber() - (await time.latest()).toNumber() + 1)
//       expect(await auctionRegistry.currentPrice()).to.be.bignumber.equal(currentPrice.toString())
//     })
//
//     it('at end of next epoch is nearly 1/2 last purchase amount', async () => {
//       expect(await auctionRegistry.currentPrice()).to.be.bignumber.equal(ether("1"));
//       await auctionRegistry.purchase({from: tester})
//       await timeMachine.advanceTimeAndBlock((await auctionRegistry.epochEndTimeFromTimestamp(await time.latest())).toNumber() - (await time.latest()).toNumber() + EPOCHPERIOD - 1)
//       expect(await auctionRegistry.currentPrice()).to.be.bignumber.equal("500052083333333333")
//     })
//
//   })
//
// });
