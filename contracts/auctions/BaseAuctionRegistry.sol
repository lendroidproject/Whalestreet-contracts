// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../chainlink/VRFConsumerBase.sol";
import "../heartbeat/Pacemaker.sol";
import "../erc721/IERC721WhaleStreet.sol";
import "./IAuctionTokenProbabilityDistribution.sol";


// solhint-disable-next-line
abstract contract BaseAuctionRegistry is Pacemaker, VRFConsumerBase, Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // whaleswap
    struct Purchase {
        uint256 epoch;
        uint256 amount;
        uint256 timestamp;
        uint256 auctionTokenId;
        address purchaser;
    }

    Purchase[] public purchases;
    IERC20 public rewardToken;
    IERC721WhaleStreet public auctionToken;
    IAuctionTokenProbabilityDistribution public probabilityDistribution;
    uint256 public firstAuctionPrice;
    bool public purchaseLocked;

    // vrf
    bytes32 internal keyHash;
    uint256 internal fee;

    // events
    event PurchaseMade(address indexed user, uint256 indexed epoch, uint256 purchaseAmount);

    /**
     * Constructor inherits VRFConsumerBase
     */
     // solhint-disable-next-line func-visibility
    constructor(address rewardTokenAddress, uint256 firstAuctionPriceValue,
                address auctionTokenAddress, address probabilityDistributionAddress,
                address vrfCoordinator, address linkToken, bytes32 vrfKeyHash, uint256 vrfFee
                )
        VRFConsumerBase(vrfCoordinator, linkToken) {// solhint-disable-line func-visibility
            rewardToken = IERC20(rewardTokenAddress);
            firstAuctionPrice = firstAuctionPriceValue;
            auctionToken = IERC721WhaleStreet(auctionTokenAddress);
            probabilityDistribution = IAuctionTokenProbabilityDistribution(probabilityDistributionAddress);
            purchaseLocked = false;
            // vrf
            keyHash = vrfKeyHash;
            fee = vrfFee;
        }

    function purchase() external {
        // solhint-disable-next-line reason-string
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        require(currentPrice() > 0, "Current price is 0");
        require(!purchaseLocked, "purchase is locked");
        lockPurchase();
        Purchase memory newPurchase = Purchase({
            epoch: currentEpoch(),
            amount: currentPrice(),
            timestamp: block.timestamp,// solhint-disable-line not-rely-on-time
            auctionTokenId: auctionToken.getNextTokenId(),
            purchaser: msg.sender
        });
        // save purchase
        purchases.push(newPurchase);
        // transfer fee
        rewardToken.safeTransferFrom(msg.sender, address(this), newPurchase.amount);
        // random number
        requestRandomness(keyHash, fee, uint256(address(this)));
        emit PurchaseMade(msg.sender, newPurchase.epoch, newPurchase.amount);
    }

    function setProbabilityDistribution(address probabilityDistributionAddress) external onlyOwner {
        probabilityDistribution = IAuctionTokenProbabilityDistribution(probabilityDistributionAddress);
    }

    function totalPurchases() external view returns (uint256) {
        return purchases.length;
    }

    function currentPrice() public view returns (uint256 price) {
        if (purchases.length == 0) {
            price = firstAuctionPrice;
        } else {
            price = 0;
            Purchase storage lastPurchase = purchases[purchases.length - 1];
            if (currentEpoch() > lastPurchase.epoch) {
                uint256 epochDifference = currentEpoch().sub(lastPurchase.epoch);
                uint256 auctionStartPrice = lastPurchase.amount.mul(4).div(2**epochDifference);
                // solhint-disable-next-line not-rely-on-time
                uint256 timeElapsedInCurrentEpoch = block.timestamp.sub(epochStartTimeFromTimestamp(block.timestamp));
                price = auctionStartPrice.mul((EPOCH_PERIOD.mul(4)).sub(
                    timeElapsedInCurrentEpoch.mul(3))).div(EPOCH_PERIOD.mul(4));
            }
        }
    }

    function lockPurchase() internal {
        purchaseLocked = true;
    }

    function unlockPurchase() internal {
        purchaseLocked = false;
    }

    // solhint-disable-next-line no-unused-vars
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 randomResult = randomness.mod(100);
        string memory tokenUri = probabilityDistribution.tokenUriFromRandomResult(randomResult);
        Purchase storage lastPurchase = purchases[purchases.length - 1];
        // mint nft
        auctionToken.mintToAndSetTokenURI(lastPurchase.purchaser, tokenUri);
        unlockPurchase();
    }

}
