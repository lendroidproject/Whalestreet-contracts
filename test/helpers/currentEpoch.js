const currentEpoch = (currentTimestamp) => {
    if(currentTimestamp < 1607040000){
        return 0;
    }
    else {
        return Math.floor((currentTimestamp - 1607040000) /28800) + 1;
    }
};
module.exports = currentEpoch;
