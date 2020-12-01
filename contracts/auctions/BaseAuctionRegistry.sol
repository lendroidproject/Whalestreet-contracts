// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../chainlink/VRFConsumerBase.sol";
import "../erc721/IERC721WhaleStreet.sol";
import "./IAuctionTokenProbabilityDistribution.sol";
import "./LinearCurve.sol";


abstract contract BaseAuctionRegistry is LinearCurve, VRFConsumerBase {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public rewardToken;
    IERC721WhaleStreet public auctionToken;
    IAuctionTokenProbabilityDistribution public probabilityDistribution;
    bool public purchaseLocked;

    // vrf
    bytes32 internal keyHash;
    uint256 internal fee;

    // events
    event PurchaseMade(address indexed account, uint256 indexed epoch, uint256 purchaseAmount);

    /**
     * Constructor inherits VRFConsumerBase
     */
    constructor(
        address rewardTokenAddress, address auctionTokenAddress, address probabilityDistributionAddress,
        address vrfCoordinator, address linkToken, bytes32 vrfKeyHash, uint256 vrfFee
        )
        VRFConsumerBase(vrfCoordinator, linkToken) {
        rewardToken = IERC20(rewardTokenAddress);
        auctionToken = IERC721WhaleStreet(auctionTokenAddress);
        probabilityDistribution = IAuctionTokenProbabilityDistribution(probabilityDistributionAddress);
        purchaseLocked = false;

        // calculations
        minY = 1;

        // vrf
        keyHash = vrfKeyHash;
        fee = vrfFee;
    }

    function setProbabilityDistribution(address probabilityDistributionAddress) onlyOwner external {
        probabilityDistribution = IAuctionTokenProbabilityDistribution(probabilityDistributionAddress);
    }

    function lockPurchase() internal {
        purchaseLocked = true;
    }

    function unlockPurchase() internal {
        purchaseLocked = false;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 randomResult = randomness.mod(100);
        string memory tokenUri = probabilityDistribution.tokenUriFromRandomResult(randomResult);
        Y storage y = Ys[Ys.length - 1];
        // mint nft
        auctionToken.mintToAndSetTokenURI(y.account, tokenUri);
        unlockPurchase();
    }

    function totalPurchases() view external returns (uint256) {
        return totalYs();
    }

    function currentPrice() view public returns (uint256) {
        if ((Ys.length > 0) && (Ys[Ys.length - 1].epoch == currentEpoch())) {
            return 0;
        }
        else {
            return y();
        }
    }

    function purchase() external {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        require(currentPrice() > 0, "Current price is 0");
        require(!purchaseLocked,"purchase is locked");
        lockPurchase();
        Y memory newY = Y({
            epoch: currentEpoch(),
            y: y(),
            timestamp: block.timestamp,
            auctionTokenId: auctionToken.getNextTokenId(),
            account: msg.sender
        });
        // save purchase
        Ys.push(newY);
        // transfer fee
        rewardToken.safeTransferFrom(msg.sender, address(this), newY.y);
        // random number
        requestRandomness(keyHash, fee, uint256(address(this)));
        emit PurchaseMade(msg.sender, newY.epoch, newY.y);
    }

}
