// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {MockWETH} from "../src/ccip/mocks/MockWETH.sol";
import {MockWBTC} from "../src/ccip/mocks/MockWBTC.sol";
import {MockUSDC} from "../src/ccip/mocks/MockUSDC.sol";
import {MockUSDT} from "../src/ccip/mocks/MockUSDT.sol";
import {MockWAVAX} from "../src/ccip/mocks/MockWAVAX.sol";

import {LendingPoolFactory} from "../src/ccip/LendingPoolFactory.sol";
import {LendingPool} from "../src/ccip/LendingPool.sol";
import {Position} from "../src/ccip/Position.sol";
import {IsHealthy} from "../src/ccip/IsHealthy.sol";
import {LendingPoolDeployer} from "../src/ccip/LendingPoolDeployer.sol";
import {Protocol} from "../src/ccip/Protocol.sol";

contract EmbaconScript is Script {
    // MockWETH public mockWETH;
    // MockWBTC public mockWBTC;
    // MockUSDC public mockUSDC;
    // MockUSDT public mockUSDT;
    // MockWAVAX public mockWAVAX;

    Protocol public protocol;
    IsHealthy public isHealthy;
    LendingPoolDeployer public lendingPoolDeployer;
    LendingPoolFactory public lendingPoolFactory;
    LendingPool public lendingPool;
    Position public position;

    address public ARB_BtcUsd = 0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69;
    address public ARB_EthUsd = 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165;
    address public ARB_AvaxUsd = 0xe27498c9Cc8541033F265E63c8C29A97CfF9aC6D;
    address public ARB_UsdcUsd = 0x0153002d20B96532C639313c2d54c3dA09109309;
    address public ARB_UsdtUsd = 0x80EDee6f667eCc9f63a0a6f55578F870651f06A4;

    address public basicTokenSenderETHSEPOLIA = 0xe1964f7Fa5225a0596360bB5885d63186df752EB;
    address public basicTokenSenderAVAXFUJI = 0x174Ec8bAD0CDc86B0b09d2fF821F4DbD6e3a0a58;
    address public basicTokenSenderARBSEPOLIA = 0xf38E89B07eBFAe0fC59647D198Dd077267E8CA7E;
    address public basicTokenSenderBASESEPOLIA = 0x8751aF34d18d195DF87f7dF710662eD53d49222E;

    address public mockWETH = 0xCC1A31502Bd096d7AAdEBE25670ebe634671aD31;
    address public mockWBTC = 0x773D46F1Ad10110459D84535A664B59Ae98CAC7E;
    address public mockWAVAX = 0x9b9d709ACAB5c4C784a7ADce5530ce8b98FcD662;
    address public mockUSDC = 0xEB7262b444F450178D25A5690F49bE8E2Fe5A178;
    address public mockUSDT = 0x02d811A7959994e4861781bC65c58813D4678949;

    function setUp() public {
        // vm.createSelectFork(vm.rpcUrl("rise_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("op_sepolia"));
        vm.createSelectFork(vm.rpcUrl("arb_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("cachain_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("educhain"));
        // vm.createSelectFork(vm.rpcUrl("pharos_devnet"));
        // vm.createSelectFork(vm.rpcUrl("op_sepolia"));
        // vm.createSelectFork(vm.rpcUrl("avalanche_fuji"));
    }

    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);

        // mockWETH = new MockWETH();
        // mockWBTC = new MockWBTC();
        // mockWAVAX = new MockWAVAX();
        // mockUSDC = new MockUSDC();
        // mockUSDT = new MockUSDT();

        if (block.chainid == 421614) {
            protocol = new Protocol();
            isHealthy = new IsHealthy();

            lendingPoolDeployer = new LendingPoolDeployer();
            lendingPoolFactory =
                new LendingPoolFactory(address(isHealthy), address(lendingPoolDeployer), address(protocol));
            lendingPool = new LendingPool(address(mockWETH), address(mockUSDC), address(lendingPoolFactory), 7e17);
            position =
                new Position(address(mockWETH), address(mockUSDC), address(lendingPool), address(lendingPoolFactory));

            lendingPoolDeployer.setFactory(address(lendingPoolFactory));

            lendingPoolFactory.addTokenDataStream(address(mockWETH), ARB_EthUsd);
            lendingPoolFactory.addTokenDataStream(address(mockWBTC), ARB_BtcUsd);
            lendingPoolFactory.addTokenDataStream(address(mockWAVAX), ARB_AvaxUsd);
            lendingPoolFactory.addTokenDataStream(address(mockUSDC), ARB_UsdcUsd);
            lendingPoolFactory.addTokenDataStream(address(mockUSDT), ARB_UsdtUsd);

            lendingPoolFactory.addBasicTokenSender(11155111, basicTokenSenderETHSEPOLIA);
            lendingPoolFactory.addBasicTokenSender(43113, basicTokenSenderAVAXFUJI);
            lendingPoolFactory.addBasicTokenSender(421614, basicTokenSenderARBSEPOLIA);
            lendingPoolFactory.addBasicTokenSender(84532, basicTokenSenderBASESEPOLIA);
        }
        vm.stopBroadcast();

        console.log("export const mockWeth = ", address(mockWETH));
        console.log("export const mockWbtc = ", address(mockWBTC));
        console.log("export const mockWavax = ", address(mockWAVAX));
        console.log("export const mockUsdc = ", address(mockUSDC));
        console.log("export const mockUsdt = ", address(mockUSDT));
        if (block.chainid == 421614) {
            console.log("--------------------------------");
            console.log("export const protocol = ", address(protocol));
            console.log("export const isHealthy = ", address(isHealthy));
            console.log("export const lendingPoolDeployer = ", address(lendingPoolDeployer));
            console.log("export const factory = ", address(lendingPoolFactory));
            console.log("export const lendingPool = ", address(lendingPool));
            console.log("export const position = ", address(position));
        }
    }

    // RUN
    // forge script EmbaconScript --broadcast --verify --verifier-url https://api-sepolia.arbiscan.io/api --etherscan-api-key CRVZYINJMIHUYNEBCU3KA3Y2RFTB8U6AIY
}
