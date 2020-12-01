const currentEpoch = (currentTimestamp) => {
    if (currentTimestamp < 1602288000) {
        return 0
    }
    else {
      return Math.floor((currentTimestamp - 1602288000) / 28800) + 1;
    }
}
module.exports = currentEpoch;
