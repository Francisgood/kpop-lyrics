// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AegyoBtsGiveawayDraw} from "../src/AegyoBtsGiveawayDraw.sol";

interface VmFork {
    function createSelectFork(string calldata rpcUrl) external returns (uint256 forkId);
    function deal(address account, uint256 newBalance) external;
    function envString(string calldata name) external returns (string memory value);
    function prank(address msgSender) external;
    function txGasPrice(uint256 newGasPrice) external;
}

contract AegyoBtsGiveawayDrawForkTest {
    VmFork private constant vm = VmFork(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_VRF_V2_5_WRAPPER = 0xb0407dbe851f8318bd31404A49e658143C982F23;
    bytes32 private constant MANIFEST_HASH = 0x9fddd6971f8bb7c94a0b4e7705c0cbfab58d545fa4e26316221e8d853b6cad7b;
    bytes32 private constant SPEC_HASH = 0x14b3e4f19ec1723664d8f26e5c370eec248c105a361f4738f649fe959b5cd46a;
    address private constant OWNER = address(0xA11CE);

    function testFork_BaseMainnetWrapperAcceptsOneNativeRequest() public {
        vm.createSelectFork(vm.envString("BASE_RPC_URL"));
        require(block.chainid == 8453, "wrong chain");
        require(BASE_VRF_V2_5_WRAPPER.code.length > 0, "wrapper missing");

        vm.txGasPrice(1 gwei);
        AegyoBtsGiveawayDraw draw = new AegyoBtsGiveawayDraw(OWNER, BASE_VRF_V2_5_WRAPPER, MANIFEST_HASH, SPEC_HASH);
        uint256 quote = draw.quoteRequestPrice();
        require(quote > 0, "zero quote");

        vm.deal(OWNER, quote + 1 ether);
        vm.prank(OWNER);
        uint256 requestId = draw.requestDraw{value: quote + 1 wei}();

        require(requestId != 0, "zero request id");
        require(draw.requestId() == requestId, "request id mismatch");
        require(draw.requestPrice() > 0, "zero payment");
        require(uint256(draw.state()) == uint256(AegyoBtsGiveawayDraw.DrawState.Requested), "state");
        require(address(draw).balance == 1 wei, "buffer");
    }
}
