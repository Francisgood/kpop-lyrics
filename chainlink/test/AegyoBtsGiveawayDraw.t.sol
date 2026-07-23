// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AegyoBtsGiveawayDraw} from "../src/AegyoBtsGiveawayDraw.sol";

interface Vm {
    function deal(address account, uint256 newBalance) external;
    function expectRevert() external;
    function expectRevert(bytes4 revertData) external;
    function expectRevert(bytes calldata revertData) external;
    function prank(address msgSender) external;
}

interface IRawVrfConsumer {
    function rawFulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external;
}

contract MockVrfV2PlusWrapper {
    uint256 public constant PRICE = 0.001 ether;
    uint256 public constant FIXED_REQUEST_ID = 711_2026;

    address public lastConsumer;
    uint32 public lastCallbackGasLimit;
    uint16 public lastRequestConfirmations;
    uint32 public lastNumWords;
    bytes public lastExtraArgs;
    uint256 public requestCount;
    uint256 public paid;
    bool public returnZeroRequestId;

    function link() external pure returns (address) {
        return address(0x1111);
    }

    function calculateRequestPriceNative(uint32, uint32) external pure returns (uint256) {
        return PRICE;
    }

    function requestRandomWordsInNative(
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        uint32 numWords,
        bytes calldata extraArgs
    ) external payable returns (uint256) {
        lastConsumer = msg.sender;
        lastCallbackGasLimit = callbackGasLimit;
        lastRequestConfirmations = requestConfirmations;
        lastNumWords = numWords;
        lastExtraArgs = extraArgs;
        requestCount += 1;
        paid += msg.value;
        return returnZeroRequestId ? 0 : FIXED_REQUEST_ID;
    }

    function setReturnZeroRequestId(bool value) external {
        returnZeroRequestId = value;
    }

    function fulfill(uint256 requestId, uint256[] memory words) external {
        IRawVrfConsumer(lastConsumer).rawFulfillRandomWords(requestId, words);
    }

    function fulfillWithGas(uint256 requestId, uint256[] memory words, uint256 gasLimit) external returns (bool) {
        (bool success,) =
            lastConsumer.call{gas: gasLimit}(abi.encodeCall(IRawVrfConsumer.rawFulfillRandomWords, (requestId, words)));
        return success;
    }
}

contract RejectingOwner {
    function request(AegyoBtsGiveawayDraw draw) external payable {
        draw.requestDraw{value: msg.value}();
    }

    function withdraw(AegyoBtsGiveawayDraw draw) external {
        draw.withdrawExcess();
    }

    receive() external payable {
        revert("reject ether");
    }
}

contract AegyoBtsGiveawayDrawTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    bytes32 private constant MANIFEST_HASH = 0x9fddd6971f8bb7c94a0b4e7705c0cbfab58d545fa4e26316221e8d853b6cad7b;
    bytes32 private constant SPEC_HASH = 0x14b3e4f19ec1723664d8f26e5c370eec248c105a361f4738f649fe959b5cd46a;
    address private constant OWNER = address(0xA11CE);
    address private constant ATTACKER = address(0xBAD);

    MockVrfV2PlusWrapper private wrapper;
    AegyoBtsGiveawayDraw private draw;

    receive() external payable {}

    function setUp() public {
        wrapper = new MockVrfV2PlusWrapper();
        draw = new AegyoBtsGiveawayDraw(OWNER, address(wrapper), MANIFEST_HASH, SPEC_HASH);
        vm.deal(OWNER, 10 ether);
        vm.deal(ATTACKER, 10 ether);
    }

    function testDeploymentFreezesConfiguration() public view {
        require(draw.owner() == OWNER, "owner");
        require(draw.vrfWrapper() == address(wrapper), "wrapper");
        require(draw.manifestHash() == MANIFEST_HASH, "manifest");
        require(draw.drawSpecHash() == SPEC_HASH, "spec");
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Open), "state");
        require(draw.CALLBACK_GAS_LIMIT() == 100_000, "callback gas");
        require(draw.REQUEST_CONFIRMATIONS() == 20, "confirmations");
        require(draw.NUM_WORDS() == 1, "words");
        require(draw.quoteRequestPrice() == wrapper.PRICE(), "quote");
    }

    function testConstructorRejectsInvalidInputs() public {
        vm.expectRevert(AegyoBtsGiveawayDraw.InvalidOwner.selector);
        new AegyoBtsGiveawayDraw(address(0), address(wrapper), MANIFEST_HASH, SPEC_HASH);

        vm.expectRevert();
        new AegyoBtsGiveawayDraw(OWNER, address(0), MANIFEST_HASH, SPEC_HASH);

        vm.expectRevert();
        new AegyoBtsGiveawayDraw(OWNER, address(0x1234), MANIFEST_HASH, SPEC_HASH);

        vm.expectRevert(AegyoBtsGiveawayDraw.EmptyCommitment.selector);
        new AegyoBtsGiveawayDraw(OWNER, address(wrapper), bytes32(0), SPEC_HASH);

        vm.expectRevert(AegyoBtsGiveawayDraw.EmptyCommitment.selector);
        new AegyoBtsGiveawayDraw(OWNER, address(wrapper), MANIFEST_HASH, bytes32(0));
    }

    function testOnlyOwnerCanRequest() public {
        uint256 price = wrapper.PRICE();
        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(AegyoBtsGiveawayDraw.NotOwner.selector, ATTACKER));
        draw.requestDraw{value: price}();
        require(wrapper.requestCount() == 0, "unexpected request");
    }

    function testUnderpaymentRevertsWithoutBurningOneShot() public {
        uint256 price = wrapper.PRICE();
        vm.prank(OWNER);
        vm.expectRevert(
            abi.encodeWithSelector(AegyoBtsGiveawayDraw.InsufficientRequestPayment.selector, price - 1, price)
        );
        draw.requestDraw{value: price - 1}();
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Open), "state burned");
        require(wrapper.requestCount() == 0, "unexpected request");
    }

    function testRequestForwardsExactVrfParametersAndRetainsBuffer() public {
        uint256 buffer = 0.25 ether;
        uint256 price = wrapper.PRICE();
        vm.prank(OWNER);
        uint256 requestId = draw.requestDraw{value: price + buffer}();

        require(requestId == wrapper.FIXED_REQUEST_ID(), "returned request id");
        require(draw.requestId() == wrapper.FIXED_REQUEST_ID(), "stored request id");
        require(draw.requestPrice() == wrapper.PRICE(), "price");
        require(address(draw).balance == buffer, "buffer");
        require(wrapper.paid() == wrapper.PRICE(), "wrapper payment");
        require(wrapper.lastConsumer() == address(draw), "consumer");
        require(wrapper.lastCallbackGasLimit() == draw.CALLBACK_GAS_LIMIT(), "callback gas");
        require(wrapper.lastRequestConfirmations() == draw.REQUEST_CONFIRMATIONS(), "confirmations");
        require(wrapper.lastNumWords() == 1, "word count");
        require(
            keccak256(wrapper.lastExtraArgs())
                == keccak256(abi.encodeWithSelector(bytes4(keccak256("VRF ExtraArgsV1")), true)),
            "native args"
        );
    }

    function testZeroRequestIdRevertsAtomicallyWithoutBurningOneShot() public {
        wrapper.setReturnZeroRequestId(true);
        uint256 price = wrapper.PRICE();
        vm.prank(OWNER);
        vm.expectRevert(AegyoBtsGiveawayDraw.InvalidRequestId.selector);
        draw.requestDraw{value: price}();
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Open), "state burned");
        require(wrapper.requestCount() == 0, "wrapper state did not roll back");
    }

    function testSecondRequestIsImpossibleBeforeAndAfterFulfillment() public {
        uint256 price = wrapper.PRICE();
        _request(price);

        vm.prank(OWNER);
        vm.expectRevert(
            abi.encodeWithSelector(
                AegyoBtsGiveawayDraw.RequestAlreadyMade.selector, AegyoBtsGiveawayDraw.DrawState.Requested
            )
        );
        draw.requestDraw{value: price}();

        _fulfill(42);
        vm.prank(OWNER);
        vm.expectRevert(
            abi.encodeWithSelector(
                AegyoBtsGiveawayDraw.RequestAlreadyMade.selector, AegyoBtsGiveawayDraw.DrawState.Fulfilled
            )
        );
        draw.requestDraw{value: price}();
        require(wrapper.requestCount() == 1, "reroll happened");
    }

    function testOnlyWrapperCanFulfill() public {
        _request(wrapper.PRICE());
        uint256 storedRequestId = draw.requestId();
        uint256[] memory words = new uint256[](1);
        words[0] = 42;

        vm.prank(ATTACKER);
        vm.expectRevert();
        draw.rawFulfillRandomWords(storedRequestId, words);
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Requested), "state changed");
    }

    function testUnexpectedFulfillmentsNeverOverwriteEvidence() public {
        _request(wrapper.PRICE());
        uint256[] memory empty = new uint256[](0);
        wrapper.fulfill(draw.requestId(), empty);
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Requested), "empty accepted");

        uint256[] memory words = new uint256[](1);
        words[0] = 111;
        wrapper.fulfill(draw.requestId() + 1, words);
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Requested), "wrong id accepted");

        wrapper.fulfill(draw.requestId(), words);
        require(draw.randomWord() == 111, "word not stored");

        words[0] = 222;
        wrapper.fulfill(draw.requestId(), words);
        require(draw.randomWord() == 111, "word overwritten");
        require(wrapper.requestCount() == 1, "new request");
    }

    function testFuzzRawWordIsStoredExactlyOnce(uint256 word) public {
        _request(wrapper.PRICE());
        _fulfill(word);
        require(draw.randomWord() == word, "raw word transformed");
        require(draw.fulfillmentBlock() == block.number, "fulfillment block");
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Fulfilled), "state");
    }

    function testCallbackFitsFrozenOneHundredThousandGasLimit() public {
        _request(wrapper.PRICE());
        uint256[] memory words = new uint256[](1);
        words[0] = 42;
        require(wrapper.fulfillWithGas(draw.requestId(), words, draw.CALLBACK_GAS_LIMIT()), "callback ran out of gas");
        require(draw.randomWord() == 42, "word not stored");
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Fulfilled), "state");
    }

    function testWithdrawIsOwnerOnlyAndOnlyAfterFulfillment() public {
        uint256 buffer = 0.25 ether;
        _request(wrapper.PRICE() + buffer);

        vm.prank(OWNER);
        vm.expectRevert(AegyoBtsGiveawayDraw.WithdrawBeforeFulfillment.selector);
        draw.withdrawExcess();

        _fulfill(42);
        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(AegyoBtsGiveawayDraw.NotOwner.selector, ATTACKER));
        draw.withdrawExcess();

        uint256 beforeBalance = OWNER.balance;
        vm.prank(OWNER);
        draw.withdrawExcess();
        require(OWNER.balance == beforeBalance + buffer, "refund");
        require(address(draw).balance == 0, "contract balance");

        vm.prank(OWNER);
        vm.expectRevert(AegyoBtsGiveawayDraw.NoExcessBalance.selector);
        draw.withdrawExcess();
    }

    function testWithdrawFailurePreservesBalance() public {
        RejectingOwner rejectingOwner = new RejectingOwner();
        AegyoBtsGiveawayDraw rejectingDraw =
            new AegyoBtsGiveawayDraw(address(rejectingOwner), address(wrapper), MANIFEST_HASH, SPEC_HASH);
        vm.deal(address(rejectingOwner), 1 ether);
        rejectingOwner.request{value: wrapper.PRICE() + 0.2 ether}(rejectingDraw);

        uint256[] memory words = new uint256[](1);
        words[0] = 42;
        wrapper.fulfill(rejectingDraw.requestId(), words);

        vm.expectRevert(AegyoBtsGiveawayDraw.WithdrawFailed.selector);
        rejectingOwner.withdraw(rejectingDraw);
        require(address(rejectingDraw).balance == 0.2 ether, "lost balance");
    }

    function testDirectFundingReceiveDoesNotCreateRequest() public {
        vm.prank(OWNER);
        (bool success,) = address(draw).call{value: 0.2 ether}("");
        require(success, "funding");
        require(address(draw).balance == 0.2 ether, "balance");
        require(wrapper.requestCount() == 0, "request");
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Open), "state");
    }

    function _request(uint256 amount) private {
        vm.prank(OWNER);
        draw.requestDraw{value: amount}();
    }

    function _fulfill(uint256 word) private {
        uint256[] memory words = new uint256[](1);
        words[0] = word;
        wrapper.fulfill(draw.requestId(), words);
    }
}
