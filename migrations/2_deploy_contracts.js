var MockPacemaker = artifacts.require("MockPacemaker");

module.exports = function(deployer, accounts) {
  deployer.deploy(MockPacemaker);
};
