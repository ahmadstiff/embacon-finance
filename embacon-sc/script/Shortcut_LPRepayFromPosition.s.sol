// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Helper} from "./Helper.sol";
import {ILendingPool} from "../src/ccip/interfaces/ILendingPool.sol";

contract LPRepayFromPositionScript is Script, Helper {
    // --------- FILL THIS ----------
    address public lpAddress = address(0);
    address public yourWallet = address(0);
    uint256 public amount = 100;
    // ----------------------------

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("arb_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("avalanche_fuji"));
    }

    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address borrowToken = ILendingPool(lpAddress).borrowToken();
        uint256 decimals = 10 ** IERC20Metadata(borrowToken).decimals();
        uint256 amountToPay = amount * decimals;

        uint256 debtBefore = ILendingPool(lpAddress).userBorrowShares(yourWallet);
        console.log("debtBefore", debtBefore);
        vm.startBroadcast(privateKey);
        // approve
        uint256 shares = ((amountToPay * ILendingPool(lpAddress).totalBorrowShares()) / ILendingPool(lpAddress).totalBorrowAssets());
        IERC20(borrowToken).approve(lpAddress, amountToPay + 1e6);
        ILendingPool(lpAddress).repayWithSelectedToken(shares, address(AVAX_USDC), true);
        uint256 debtAfter = ILendingPool(lpAddress).userBorrowShares(yourWallet);
        console.log("-------------------------------- repay from position --------------------------------");
        console.log("debtAfter", debtAfter);
        vm.stopBroadcast();
    }

    // RUN
    // forge script LPRepayFromPositionScript -vvv --broadcast
}