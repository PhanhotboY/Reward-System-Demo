// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./RewardToken.sol";
import "./PenaltyToken.sol";
import "./ReputationToken.sol";

contract TokenOperator is Ownable {
    RewardToken public rewardToken;
    PenaltyToken public penaltyToken;
    ReputationToken public reputationToken;

    // Events
    event RewardsBurned(address indexed account, uint256 amount);
    event PenaltiesBurned(address indexed account, uint256 amount);
    event ReputationBurned(address indexed account, uint256 amount);

    event RewardsMinted(address indexed account, uint256 amount);
    event PenaltiesMinted(address indexed account, uint256 amount);
    event ReputationMinted(address indexed account, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // External
    function registerTokens(
        address _rewardToken,
        address _penaltyToken,
        address _reputationToken
    ) external onlyOwner {
        rewardToken = RewardToken(_rewardToken);
        penaltyToken = PenaltyToken(_penaltyToken);
        reputationToken = ReputationToken(_reputationToken);
    }

    function balance(
        address account
    ) external view returns (uint256, uint256, uint256) {
        return (
            rewardToken.balanceOf(account),
            penaltyToken.balanceOf(account),
            reputationToken.balanceOf(account)
        );
    }

    function batchBurnAllTokens(
        address[] calldata _employees
    ) external onlyOwner {
        address[] calldata employees = _employees;
        uint256 empLength = employees.length;

        for (uint256 i = 0; i < empLength; i++) {
            burnAll(employees[i]);
        }
    }

    function batchMintPenalties(
        address[] calldata _employees,
        uint256[] calldata _amounts
    ) external onlyOwner {
        uint256 empLength = _employees.length;
        require(
            empLength == _amounts.length,
            "Error: Mismatched argument length"
        );

        address[] calldata employees = _employees;
        uint256[] calldata amounts = _amounts;

        for (uint256 i = 0; i < empLength; i++) {
            address org = employees[i];
            uint256 amount = amounts[i];

            mintPenalties(org, amount);
        }
    }

    function batchMintReward(
        address[] calldata _employees,
        uint256[] calldata _amounts
    ) external onlyOwner {
        uint256 empLength = _employees.length;
        require(
            empLength == _amounts.length,
            "Error: Mismatched argument length"
        );

        address[] calldata employees = _employees;
        uint256[] calldata amounts = _amounts;

        for (uint256 i = 0; i < empLength; i++) {
            address emp = employees[i];
            uint256 amount = amounts[i];

            mintReward(emp, amount);
        }
    }

    // Public
    function burnAll(address employee) public onlyOwner {
        burnRewards(employee, rewardToken.balanceOf(employee));
        burnPenalties(employee, penaltyToken.balanceOf(employee));
    }

    function burnPenalties(address employee, uint256 amount) public onlyOwner {
        penaltyToken.burn(employee, amount);
    }

    function burnRewards(address employee, uint256 amount) public onlyOwner {
        rewardToken.burn(employee, amount);
    }

    // Internal
    function mintPenalties(address employee, uint256 amount) internal {
        penaltyToken.mint(employee, amount);

        // Reduce user reputation balance
        uint256 reputationValue = reputationToken.balanceOf(employee);
        uint256 penaltyReputation = reputationValue < amount
            ? reputationValue
            : amount;
        reputationToken.burn(employee, penaltyReputation);

        // Emit events
        emit PenaltiesMinted(employee, amount);
        emit ReputationBurned(employee, amount);
    }

    function mintReward(address employee, uint256 amount) internal {
        rewardToken.mint(employee, amount);

        // Increase user reputation balance
        reputationToken.mint(employee, amount);

        emit RewardsMinted(employee, amount);
        emit ReputationMinted(employee, amount);
    }
}
