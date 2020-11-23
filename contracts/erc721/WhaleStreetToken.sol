// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


abstract contract WhaleStreetToken is ERC721, Ownable {


    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    /**
      * @notice Increments the value of _currentTokenId
      * @dev Internal function that increases the value of _currentTokenId by 1
      */
    function _incrementTokenId() private  {
        _tokenIdTracker.increment();
    }

    function _mintTo(address to) internal {
        uint256 newTokenId = getNextTokenId();
        _mint(to, newTokenId);
        _incrementTokenId();
    }

    /**
      * @notice Allows owner to mint a token to a given address, and set it's api uri
      * dev Mints a new token to the given address, increments currentTokenId
      * @param to address of the future owner of the token
      * @param _tokenURI : string representing the api url
      */
    function mintToAndSetTokenURI(address to, string memory _tokenURI) public onlyOwner {
        _mintTo(to);
        _setTokenURI(_tokenIdTracker.current(), _tokenURI);
    }

    /**
      * @notice Displays the id of the latest token that was minted
      * @return uint256 : latest minted token id
      */
    function currentTokenId() public view returns (uint256) {
        return _tokenIdTracker.current();
    }

    /**
      * @notice Displays the id of the next token that will be minted
      * @dev Calculates the next token ID based on value of _currentTokenId
      * @return uint256 : id of the next token
      */
    function getNextTokenId() public view returns (uint256) {
        return _tokenIdTracker.current().add(1);
    }

}
