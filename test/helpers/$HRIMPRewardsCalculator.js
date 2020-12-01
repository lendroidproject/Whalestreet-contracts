const { ether } = require('@openzeppelin/test-helpers');

const $HRIMPRewardsCalculator = (epoch) => {

  return (epoch === 0) ?
      0
    :
      (epoch > 0 && epoch <= 84) ?
      ether("1.653439153439153439")// 12000000 / (7257600)
    :
      (epoch > 84 && epoch <= 336) ?
      ether("0.992063492063492063")// 21600000 / (7257600*3)
    :
      (epoch > 336 && epoch <= 588) ?
      ether("0.496031746031746031")// 10800000 / (7257600*3)
    :
      (epoch > 588 && epoch <= 840) ?
      ether("0.248015873015873015")// 5400000 / (7257600*3)
    :
      (epoch > 840 && epoch <= 1092) ?
      ether("0.124007936507936507")// 2700000 / (7257600*3)
    :
      ether("0.062003968253968253")// 1350000 / (7257600*3)

}

module.exports = $HRIMPRewardsCalculator;
