const { ether } = require('@openzeppelin/test-helpers');

var MockPacemaker = artifacts.require("MockPacemaker");
var MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
var Mock$HRIMP = artifacts.require("Mock$HRIMP");
var UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");
var WhaleSwapToken = artifacts.require("WhaleSwapToken");
var MockAuctionTokenProbabilityDistribution = artifacts.require("MockAuctionTokenProbabilityDistribution");
var MockKovanWhaleSwapAuctionRegistry = artifacts.require("MockKovanWhaleSwapAuctionRegistry");

module.exports = function(deployer, accounts) {
  deployer.deploy(MockPacemaker)
  .then(function() {
    return deployer.deploy(MockLSTWETHUNIV2);
  })
  .then(function() {
    return deployer.deploy(Mock$HRIMP);
  })
  .then(function() {
    return deployer.deploy(UNIV2SHRIMPPool,
      Mock$HRIMP.address, MockLSTWETHUNIV2.address
    );
  })
  .then(function() {
    return deployer.deploy(WhaleSwapToken);
  })
  .then(function() {
    return deployer.deploy(MockAuctionTokenProbabilityDistribution);
  })
  .then(function() {
    return deployer.deploy(MockKovanWhaleSwapAuctionRegistry,
      Mock$HRIMP.address, WhaleSwapToken.address, MockAuctionTokenProbabilityDistribution.address
    );
  });
};
