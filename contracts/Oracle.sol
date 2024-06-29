// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Oracle is Ownable{
    uint256 immutable public PRICE_PER_REQUEST;

    struct Computation {
        address user;
        uint256[] numbers;
        bytes logic;
        uint256 result;
    }

    mapping(bytes32 => Computation) public computations;
    mapping(bytes32 => bool) public pendingComputations;

    event ComputationRequested(bytes32 indexed requestId, address indexed user);
    event ComputationCompleted(bytes32 indexed requestId, uint256 result);

    constructor(uint _pricePerRequest) Ownable(msg.sender){
        PRICE_PER_REQUEST = _pricePerRequest;
    }

    function compute(uint256[] memory numbers, bytes memory logic) public payable returns (bytes32) {
        require(msg.value == PRICE_PER_REQUEST, "Insufficient payment");

        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, numbers, logic, block.timestamp));
        computations[requestId] = Computation({
            user: msg.sender,
            numbers: numbers,
            logic: logic,
            result: 0 // Initial result
        });
        pendingComputations[requestId] = true;

        emit ComputationRequested(requestId, msg.sender);

        return requestId;
    }

    function callback(bytes32 requestId, uint256 result) public onlyOwner {
        require(pendingComputations[requestId], "Computation not found or already completed");

        computations[requestId].result = result;
        pendingComputations[requestId] = false;

        emit ComputationCompleted(requestId, result);
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
