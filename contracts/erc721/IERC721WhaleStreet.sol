// SPDX-License-Identifier: https://github.com/lendroidproject/protocol.2.0/blob/master/LICENSE.md
pragma solidity 0.7.4;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


/**
 * @dev Required interface of an ERC721WhaleStreet compliant contract.
 */
interface IERC721WhaleStreet is IERC721 {

    function mintToAndSetTokenURI(address to, string memory _tokenURI) external;

    function currentTokenId() external view returns (uint256);

    function getNextTokenId() external view returns (uint256);
}
