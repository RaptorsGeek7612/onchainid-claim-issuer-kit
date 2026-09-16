// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.35;

import {Script, console} from "forge-std/Script.sol";
import {ClaimIssuer} from "../contracts/ClaimIssuer.sol";

/// @notice Deploys a ClaimIssuer contract.
/// @dev Required env: PRIVATE_KEY (deployer/broadcaster).
///      Optional env: MANAGEMENT_KEY (initial management key address, defaults to the deployer).
///
/// Usage:
///   forge script script/DeployClaimIssuer.s.sol:DeployClaimIssuer \
///     --rpc-url <rpc_url> --broadcast --verify
contract DeployClaimIssuer is Script {
    function run() external returns (ClaimIssuer claimIssuer) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address managementKey = vm.envOr("MANAGEMENT_KEY", deployer);

        vm.startBroadcast(deployerPrivateKey);
        claimIssuer = new ClaimIssuer(managementKey);
        vm.stopBroadcast();

        console.log("ClaimIssuer deployed at:", address(claimIssuer));
        console.log("Initial management key:", managementKey);
    }
}
