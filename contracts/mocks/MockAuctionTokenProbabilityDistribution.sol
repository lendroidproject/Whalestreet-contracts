// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


import "../auctions/IAuctionTokenProbabilityDistribution.sol";


contract MockAuctionTokenProbabilityDistribution is IAuctionTokenProbabilityDistribution {

    enum Rarity { REGULAR, UNIQUE, LEGENDARY }

    mapping(Rarity => string) tokenUris;

    mapping(Rarity => uint256) feePercentages;

    constructor() {
        tokenUris[Rarity.REGULAR] = "REGULAR";
        tokenUris[Rarity.UNIQUE] = "UNIQUE";
        tokenUris[Rarity.LEGENDARY] = "LEGENDARY";
        feePercentages[Rarity.REGULAR] = 5;
        feePercentages[Rarity.UNIQUE] = 20;
        feePercentages[Rarity.LEGENDARY] = 50;
    }

    function tokenUriFromRandomResult(uint256 randomResult) override view public returns(string memory tokenUri) {
        require((randomResult > 0) && (randomResult <= 100), "Invalid randomResult");
        if (randomResult > 0 && randomResult <= 10) {
            tokenUri = tokenUris[Rarity.LEGENDARY];
        }
        else if (randomResult > 15 && randomResult <= 30) {
            tokenUri = tokenUris[Rarity.UNIQUE];
        }
        else {
            tokenUri = tokenUris[Rarity.REGULAR];
        }
    }

    function feePercentage(string calldata tokenUri) override view public returns(uint256 feePercent) {
        if (keccak256(abi.encodePacked(tokenUri)) == keccak256(abi.encodePacked(tokenUris[Rarity.REGULAR]))) {
            feePercent = feePercentages[Rarity.REGULAR];
        }
        else if (keccak256(abi.encodePacked(tokenUri)) == keccak256(abi.encodePacked(tokenUris[Rarity.UNIQUE]))) {
            feePercent = feePercentages[Rarity.UNIQUE];
        }
        else if (keccak256(abi.encodePacked(tokenUri)) == keccak256(abi.encodePacked(tokenUris[Rarity.LEGENDARY]))) {
            feePercent = feePercentages[Rarity.LEGENDARY];
        }
        else {
            feePercent = 0;
        }
    }

}
