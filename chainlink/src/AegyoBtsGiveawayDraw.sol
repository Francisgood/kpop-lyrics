// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {VRFV2PlusWrapperConsumerBase} from "../vendor/chainlink/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {VRFV2PlusClient} from "../vendor/chainlink/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title Aegyo Arena BTS Giveaway — one-shot Chainlink VRF consumer
/// @notice Binds one immutable roster and draw specification to exactly one VRF v2.5 request.
/// @dev The raw random word is stored without transformation. Candidate ordering is reproduced
/// offchain by the committed public verifier. There is intentionally no reset, retry, cancellation,
/// owner transfer, or second-request path.
contract AegyoBtsGiveawayDraw is VRFV2PlusWrapperConsumerBase {
    enum DrawState {
        Open,
        Requested,
        Fulfilled
    }

    error EmptyCommitment();
    error InsufficientRequestPayment(uint256 supplied, uint256 required);
    error InvalidOwner();
    error InvalidRequestId();
    error InvalidWrapper();
    error NoExcessBalance();
    error NotOwner(address caller);
    error RequestAlreadyMade(DrawState state);
    error WithdrawBeforeFulfillment();
    error WithdrawFailed();

    event DrawFunded(address indexed sender, uint256 amount);
    event DrawRequested(
        uint256 indexed requestId, bytes32 indexed manifestHash, bytes32 indexed drawSpecHash, uint256 requestPrice
    );
    event DrawFulfilled(
        uint256 indexed requestId, uint256 randomWord, bytes32 indexed manifestHash, bytes32 indexed drawSpecHash
    );
    event ExcessWithdrawn(address indexed owner, uint256 amount);
    event UnexpectedFulfillment(uint256 indexed requestId, DrawState state, uint256 wordCount);

    uint32 public constant CALLBACK_GAS_LIMIT = 100_000;
    uint16 public constant REQUEST_CONFIRMATIONS = 20;
    uint32 public constant NUM_WORDS = 1;

    address public immutable owner;
    address public immutable vrfWrapper;
    bytes32 public immutable manifestHash;
    bytes32 public immutable drawSpecHash;

    DrawState public state;
    uint256 public requestId;
    uint256 public requestPrice;
    uint256 public randomWord;
    uint256 public fulfillmentBlock;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(address owner_, address vrfWrapper_, bytes32 manifestHash_, bytes32 drawSpecHash_)
        VRFV2PlusWrapperConsumerBase(vrfWrapper_)
    {
        if (owner_ == address(0)) revert InvalidOwner();
        if (vrfWrapper_ == address(0) || vrfWrapper_.code.length == 0) revert InvalidWrapper();
        if (manifestHash_ == bytes32(0) || drawSpecHash_ == bytes32(0)) revert EmptyCommitment();

        owner = owner_;
        vrfWrapper = vrfWrapper_;
        manifestHash = manifestHash_;
        drawSpecHash = drawSpecHash_;
    }

    /// @notice Returns the wrapper's current native-token quote for the sole request.
    /// @dev The live transaction recalculates the price at its own gas price; this is informational.
    function quoteRequestPrice() external view returns (uint256) {
        return i_vrfV2PlusWrapper.calculateRequestPriceNative(CALLBACK_GAS_LIMIT, NUM_WORDS);
    }

    /// @notice Pays for and creates the contract's only Chainlink VRF request.
    /// @dev Any amount above the wrapper's exact quote stays in the consumer until fulfillment,
    /// then the owner can recover it through withdrawExcess().
    function requestDraw() external payable onlyOwner returns (uint256 newRequestId) {
        if (state != DrawState.Open) revert RequestAlreadyMade(state);

        uint256 quotedPrice = i_vrfV2PlusWrapper.calculateRequestPriceNative(CALLBACK_GAS_LIMIT, NUM_WORDS);
        if (msg.value < quotedPrice) revert InsufficientRequestPayment(msg.value, quotedPrice);

        // Effects precede the trusted wrapper call. A revert rolls the state transition back.
        state = DrawState.Requested;
        bytes memory extraArgs = VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}));
        uint256 paid;
        (newRequestId, paid) =
            requestRandomnessPayInNative(CALLBACK_GAS_LIMIT, REQUEST_CONFIRMATIONS, NUM_WORDS, extraArgs);
        if (newRequestId == 0) revert InvalidRequestId();

        requestId = newRequestId;
        requestPrice = paid;
        emit DrawRequested(newRequestId, manifestHash, drawSpecHash, paid);
    }

    /// @dev Chainlink's base contract authenticates the wrapper before entering this callback.
    /// Valid fulfillments only perform bounded storage writes and cannot revert. Impossible or
    /// duplicate payloads are preserved as evidence without overwriting the accepted word.
    function fulfillRandomWords(uint256 fulfilledRequestId, uint256[] memory randomWords) internal override {
        if (state != DrawState.Requested || fulfilledRequestId != requestId || randomWords.length != NUM_WORDS) {
            emit UnexpectedFulfillment(fulfilledRequestId, state, randomWords.length);
            return;
        }

        randomWord = randomWords[0];
        fulfillmentBlock = block.number;
        state = DrawState.Fulfilled;
        emit DrawFulfilled(fulfilledRequestId, randomWords[0], manifestHash, drawSpecHash);
    }

    /// @notice Returns any direct-funding buffer to the fixed owner after the word is stored.
    function withdrawExcess() external onlyOwner {
        if (state != DrawState.Fulfilled) revert WithdrawBeforeFulfillment();
        uint256 amount = address(this).balance;
        if (amount == 0) revert NoExcessBalance();

        (bool success,) = payable(owner).call{value: amount}("");
        if (!success) revert WithdrawFailed();
        emit ExcessWithdrawn(owner, amount);
    }

    receive() external payable {
        emit DrawFunded(msg.sender, msg.value);
    }
}
