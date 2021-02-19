var MockPacemaker = artifacts.require("MockPacemaker");

var Mock$HRIMP = artifacts.require("Mock$HRIMP");
var MockB20 = artifacts.require("MockB20");
var MockLST = artifacts.require("MockLST");

var MockLSTWETHUNIV2 = artifacts.require("MockLSTWETHUNIV2");
var Mock$HRIMPWETHUNIV2 = artifacts.require("Mock$HRIMPWETHUNIV2");
var MockB20WETHUNIV2 = artifacts.require("MockB20WETHUNIV2");

var UNIV2SHRIMPPool = artifacts.require("UNIV2SHRIMPPool");

var B20ETHUNIV2B20Pool = artifacts.require("B20ETHUNIV2B20Pool");
var SHRIMPETHUNIV2B20Pool = artifacts.require("$HRIMPETHUNIV2B20Pool");
var LSTETHUNIV2B20Pool = artifacts.require("LSTETHUNIV2B20Pool");

var B20ETHUNIV2LSTPool = artifacts.require("B20ETHUNIV2LSTPool");

module.exports = function(deployer) {
    deployer.deploy(MockPacemaker)
        .then(function() {
            return deployer.deploy(Mock$HRIMP);
        })
        .then(function() {
            return deployer.deploy(MockB20);
        })
        .then(function() {
            return deployer.deploy(MockLST);
        })
        .then(function() {
            return deployer.deploy(MockLSTWETHUNIV2);
        })
        .then(function() {
            return deployer.deploy(MockB20WETHUNIV2);
        })
        .then(function() {
            return deployer.deploy(Mock$HRIMPWETHUNIV2);
        })
        .then(function() {
            return deployer.deploy(UNIV2SHRIMPPool, Mock$HRIMP.address, MockLSTWETHUNIV2.address);
        })
        .then(function() {
            return deployer.deploy(B20ETHUNIV2B20Pool, MockB20.address, MockB20WETHUNIV2.address);
        })
        .then(function() {
            return deployer.deploy(SHRIMPETHUNIV2B20Pool, MockB20.address, Mock$HRIMPWETHUNIV2.address);
        })
        .then(function() {
            return deployer.deploy(LSTETHUNIV2B20Pool, MockB20.address, MockLSTWETHUNIV2.address);
        })
        .then(function() {
            return deployer.deploy(B20ETHUNIV2LSTPool, MockLST.address, MockB20WETHUNIV2.address);
        });
};
