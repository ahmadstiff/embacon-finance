// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";

contract Helper is Script {
    address public AVAX_USDC = 0xC014F158EbADce5a8e31f634c0eb062Ce8CDaeFe;
    address public AVAX_USDT = 0x1E713E704336094585c3e8228d5A8d82684e4Fb0;
    address public AVAX_WETH = 0x63CFd5c58332c38d89B231feDB5922f5817DF180;
    address public AVAX_WBTC = 0xa7A93C5F0691a5582BAB12C0dE7081C499aECE7f;
    address public AVAX_WAVAX = 0xA61Eb0D33B5d69DC0D0CE25058785796296b1FBd;

    address public ARB_WETH = 0xCC1A31502Bd096d7AAdEBE25670ebe634671aD31;
    address public ARB_WBTC = 0x773D46F1Ad10110459D84535A664B59Ae98CAC7E;
    address public ARB_WAVAX = 0x9b9d709ACAB5c4C784a7ADce5530ce8b98FcD662;
    address public ARB_USDC = 0xEB7262b444F450178D25A5690F49bE8E2Fe5A178;
    address public ARB_USDT = 0x02d811A7959994e4861781bC65c58813D4678949;

    address public ARB_factory = 0x277AdE182ef847b75383124649b07207DA7c9e09;
    address public ARB_lp = 0xEb106f667a95b3377fA9C66B3D9c92C665408a01;

    address public claimAddress = vm.envAddress("ADDRESS");

    // chain id
    uint256 public ETH_Sepolia = 11155111;
    uint256 public Avalanche_Fuji = 43113;
    uint256 public Arb_Sepolia = 421614;
    uint256 public Base_Sepolia = 84532;
}
