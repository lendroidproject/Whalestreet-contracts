const { ether } = require('@openzeppelin/test-helpers');

const $HRIMPRewardsPerEpoch = (epoch) => {

  return (epoch === 0) ?
      ether("2400000")
    :
      (epoch > 0 && epoch <= 84) ?
      ether("0.551146384479717813")// 12000000 / (7257600*3)
    :
      (epoch > 84 && epoch <= 336) ?
      ether("0.640707671957671957")// 41850000 / (7257600*9)
    :
      (epoch > 336 && epoch <= 588) ?
      ether("0.165343915343915343")// 10800000 / (7257600*9)
    :
      (epoch > 588 && epoch <= 840) ?
      ether("0.082671957671957671")// 5400000 / (7257600*9)
    :
      (epoch > 840 && epoch <= 1092) ?
      ether("0.041335978835978835")// 2700000 / (7257600*9)
    :
      ether("0.020667989417989417")// 1350000 / (7257600*9)

}

module.exports = $HRIMPRewardsPerEpoch;
