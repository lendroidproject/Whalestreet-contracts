// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../heartbeat/Pacemaker.sol";


contract BaseAuctionRegistry is Pacemaker {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Purchase {
        uint256 epoch;
        uint256 amount;
        uint256 timestamp;
    }

    Purchase[] public purchases;
    IERC20 public rewardToken;

    uint256 public firstAuctionPrice;

    event PurchaseMade(address indexed user, uint256 indexed epoch, uint256 purchaseAmount);

    constructor(address rewardTokenAddress, uint256 firstAuctionPriceValue) {
        rewardToken = IERC20(rewardTokenAddress);
        firstAuctionPrice = firstAuctionPriceValue;
    }

    function currentPrice() view public returns (uint256 price) {
        if (purchases.length == 0) {
            price = firstAuctionPrice;
        }
        else {
            price = 0;
            Purchase storage lastPurchase = purchases[purchases.length - 1];
            if (currentEpoch() > lastPurchase.epoch) {
                uint256 epochDifference = currentEpoch().sub(lastPurchase.epoch);
                uint256 auctionStartPrice = lastPurchase.amount.mul(4).div(2**epochDifference);
                uint256 timeElapsedInCurrentEpoch = block.timestamp.sub(epochStartTimeFromTimestamp(block.timestamp));
                price = auctionStartPrice.mul((EPOCHPERIOD.mul(4)).sub(timeElapsedInCurrentEpoch.mul(3))).div(EPOCHPERIOD.mul(4));
            }
        }
    }

    function purchase() external {
        Purchase memory newPurchase = Purchase({
            epoch: currentEpoch(),
            amount: currentPrice(),
            timestamp: block.timestamp
        });
        if (newPurchase.amount > 0) {
            purchases.push(newPurchase);
            rewardToken.safeTransferFrom(msg.sender, address(this), newPurchase.amount);
            emit PurchaseMade(msg.sender, newPurchase.epoch, newPurchase.amount);
        }
    }

}
