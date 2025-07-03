// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Helper} from "./Helper.sol";
import {IFactory} from "../src/ccip/interfaces/IFactory.sol";

contract CreateLPScript is Script, Helper {
    // --------- FILL THIS ----------
    address collateralToken = ARB_WBTC;
    address borrowToken = ARB_WETH;
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
        // pool count
        uint256 poolCount = IFactory(ARB_factory).poolCount();
        console.log("poolCount Before", poolCount);
        address pool = IFactory(ARB_factory).createLendingPool(collateralToken, borrowToken, ltv);
        console.log("pool", pool);
        poolCount = IFactory(ARB_factory).poolCount();
        console.log("poolCount After", poolCount);
        vm.stopBroadcast();
    }

    // RUN
    // forge script CreateLPScript -vvv --broadcast
}
