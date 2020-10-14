var MockPacemaker = artifacts.require("MockPacemaker");
var MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
var Mock$HRIMP = artifacts.require("Mock$HRIMP");
var UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");

module.exports = function(deployer, accounts) {
  deployer.deploy(MockPacemaker)
  .then(function() {
    return deployer.deploy(MockLSTWETHUNIV2);
  })
  .then(function() {
    return deployer.deploy(Mock$HRIMP);
  })
  .then(function() {
    return deployer.deploy(UNIV2SHRIMPPool, Mock$HRIMP.address, MockLSTWETHUNIV2.address);
  });
};
