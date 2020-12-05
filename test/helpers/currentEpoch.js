const currentEpoch = (currentTimestamp) => {
    if(currentTimestamp < 1607212800){
        return 0;
    }
    else {
        return Math.floor((currentTimestamp - 1607212800) /28800) + 1;
    }
};
module.exports = currentEpoch;
