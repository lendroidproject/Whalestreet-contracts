// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../heartbeat/Pacemaker.sol";
import "../erc721/IERC721WhaleStreet.sol";
import "./ISwap.sol";
import "./ISwapFactory.sol";


contract Swap is Pacemaker, ISwap {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    enum Status { Inactive, Active, Archived }

    string public name;
    uint256 public epoch;
    IERC20 public token0;
    IERC20 public token1;
    IERC20 public uniswapPoolToken;
    IERC721WhaleStreet public auctionToken;
    uint256 public auctionTokenId;
    ISwapFactory public factory;

    Status public status;
    mapping(address => uint256) public liquidity;


    function initialize(
            string memory swapName,
            address[4] memory addresses,// token0, token1, uniswapPoolToken, auctionToken
            uint256[2] memory uint256Values// epoch, tokenId
        ) override external {
        factory = ISwapFactory(msg.sender);
        name = swapName;
        token0 = IERC20(addresses[0]);
        token1 = IERC20(addresses[1]);
        uniswapPoolToken = IERC20(addresses[2]);
        auctionToken = IERC721WhaleStreet(addresses[3]);
        epoch = uint256Values[0];
        auctionTokenId = uint256Values[1];

        status = Status.Active;
    }

    function update(uint256 startEpoch) override external {
        require(msg.sender == auctionToken.ownerOf(auctionTokenId), "invalid caller");
        epoch = startEpoch;
    }

    function addLiquidity(address token, uint256 amount) override external {
        require((token == address(token0)) || (token == address(token1)), "invalid token");
        liquidity[token] = liquidity[token].add(amount);
    }

}
