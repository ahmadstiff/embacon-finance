// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {IERC20Metadata} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {Helper} from "./Helper.sol";
import {ILendingPool} from "../src/ccip/interfaces/ILendingPool.sol";

contract LPBorrowScript is Script, Helper {
    // --------- FILL THIS ----------
    address public lpAddress = address(0);
    address public yourWallet = address(0);
    uint256 public amount = 1;
    // ----------------------------

    address public linkToken = address(0);
    address public basicTokenSender = address(0);
    
    function setUp() public {
        // vm.createSelectFork(vm.rpcUrl("rise_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("op_sepolia"));
        vm.createSelectFork(vm.rpcUrl("arb_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("avalanche_fuji"));
        // vm.createSelectFork(vm.rpcUrl("cachain_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("educhain"));
        // vm.createSelectFork(vm.rpcUrl("pharos_devnet"));
        // vm.createSelectFork(vm.rpcUrl("op_sepolia"));
    }

    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address borrowToken = ILendingPool(lpAddress).borrowToken();
        uint256 lpBorrowBalance = IERC20(borrowToken).balanceOf(lpAddress);
        uint256 decimal = IERC20Metadata(borrowToken).decimals();
        uint256 amountBorrow = amount * (10 ** decimal);

        vm.startBroadcast(privateKey);
        if(lpBorrowBalance < amountBorrow) {
            console.log("not enough borrow balance");
            console.log("lpBorrowBalance", lpBorrowBalance);
            console.log("Your debt amount application", amountBorrow);
            return;
        } else {
            console.log("Your balance before borrow", lpBorrowBalance);
            console.log("borrow token address", borrowToken);
            ILendingPool(lpAddress).borrowDebt(amountBorrow, Avalanche_Fuji, ILendingPool.SupportedNetworks.BASE_SEPOLIA);
            console.log("success");
            console.log("Your balance after borrow", IERC20(borrowToken).balanceOf(lpAddress));
        }
        vm.stopBroadcast();
    }
    // RUN
    // forge script LPBorrowScript -vvv --broadcast
}
