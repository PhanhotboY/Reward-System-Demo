// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./TokenOperator.sol";

contract RewardToken is ERC20 {
    TokenOperator public tokenOperator;

    modifier onlyOperator() {
        require(
            msg.sender == address(tokenOperator),
            "Only the operator can call this function."
        );
        _;
    }

    constructor(address _operator) ERC20("Reward Token", "RWT") {
        tokenOperator = TokenOperator(_operator);
    }

    function burn(address account, uint256 amount) public onlyOperator {
        _burn(account, amount);
    }

    function mint(address account, uint256 amount) public onlyOperator {
        _mint(account, amount);
    }
}
