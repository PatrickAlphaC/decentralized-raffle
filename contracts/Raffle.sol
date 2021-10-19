// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "hardhat/console.sol";

contract Raffle is Ownable, VRFConsumerBase, KeeperCompatibleInterface {
    bytes32 public s_keyHash;
    uint256 public s_chainlinkFee;
    uint256 public s_entranceFee;
    uint256 public s_lastTimeStamp;
    uint256 public s_interval;
    address public s_recentWinner;
    address payable[] public s_players;
    raffleState public s_raffleState;
    enum raffleState {
        OPEN,
        CALCULATING
    }

    event requestedRaffleWinner(bytes32 indexed requestId);
    event enteredRaffle(address indexed player);
    event winnerPicked(address indexed player);

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _chainlinkFee,
        uint256 _entranceFee,
        uint256 _interval
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        s_lastTimeStamp = block.timestamp;
        s_keyHash = _keyHash;
        s_chainlinkFee = _chainlinkFee;
        s_entranceFee = _entranceFee;
        s_interval = _interval;
        s_raffleState = raffleState.OPEN;
    }

    function enterRaffle() public payable {
        require(
            msg.value >= s_entranceFee,
            "Not enough value sent to enter raffle"
        );
        require(s_raffleState == raffleState.OPEN, "Raffle is not open");
        s_players.push(payable(msg.sender));
        emit enteredRaffle(msg.sender);
    }

    // receive() external payable {}

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs
     * 2. The contract has LINK
     * 3. The contract has ETH
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool hasLink = LINK.balanceOf(address(this)) >= s_chainlinkFee;
        bool isOpen = raffleState.OPEN == s_raffleState;
        upkeepNeeded = (((block.timestamp - s_lastTimeStamp) > s_interval) &&
            isOpen &&
            hasLink &&
            (address(this).balance >= 0));
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner
     */
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        require(
            LINK.balanceOf(address(this)) >= s_chainlinkFee,
            "Not enough LINK"
        );
        require(address(this).balance >= 0, "Not enough ETH");
        (bool upkeepNeeded, ) = checkUpkeep("");
        require(upkeepNeeded, "Upkeep not needed");
        s_lastTimeStamp = block.timestamp;
        s_raffleState = raffleState.CALCULATING;
        bytes32 requestId = requestRandomness(s_keyHash, s_chainlinkFee);
        emit requestedRaffleWinner(requestId);
    }

    /**
     * @dev This is the function that Chainlink VRF node calls to send the money to the random winner
     */
    function fulfillRandomness(
        bytes32, /* requestId */
        uint256 randomness
    ) internal override {
        uint256 index = randomness % s_players.length;
        address payable recentWinner = s_players[index];
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
        s_raffleState = raffleState.OPEN;
        emit winnerPicked(recentWinner);
    }
}
