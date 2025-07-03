// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Helper} from "./Helper.sol";
import {IFactory} from "../src/ccip/interfaces/IFactory.sol";

contract CreateLPScript is Script, Helper {
    // --------- FILL THIS ----------
    address collateralToken = ARB_WBTC;
    address borrowToken = ARB_USDC;
    uint256 ltv = 7.5e17;
    // ----------------------------

    address factory = ARB_factory;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("arb_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("avalanche_fuji"));
    }

    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);
        IFactory(factory).createLendingPool(collateralToken, borrowToken, ltv);
        vm.stopBroadcast();
    }

    // RUN
    // forge script CreateLPScript -vvv --broadcast
}
