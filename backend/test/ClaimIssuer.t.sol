// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.35;

import {Test} from "forge-std/Test.sol";
import {IIdentity} from "../contracts/interfaces/IIdentity.sol";
import {ClaimIssuer} from "../contracts/ClaimIssuer.sol";
import {Identity} from "../contracts/Identity.sol";

contract ClaimIssuerTest is Test {
    ClaimIssuer internal claimIssuer;
    uint256 internal issuerKey;
    address internal issuer;

    function setUp() public {
        issuerKey = 0xA11CE;
        issuer = vm.addr(issuerKey);
        claimIssuer = new ClaimIssuer(issuer);
    }

    function _sign(address identity, uint256 claimTopic, bytes memory data) internal view returns (bytes memory) {
        bytes32 dataHash = keccak256(abi.encode(identity, claimTopic, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(issuerKey, prefixedHash);
        return abi.encodePacked(r, s, v);
    }

    function test_deployment_setsManagementKey() public view {
        bytes32 managementKey = keccak256(abi.encode(issuer));
        assertTrue(claimIssuer.keyHasPurpose(managementKey, 1));
    }

    function test_isClaimValid_acceptsProperlySignedClaim() public view {
        address identity = address(0xBEEF);
        uint256 claimTopic = 1;
        bytes memory data = "claim data";
        bytes memory sig = _sign(identity, claimTopic, data);

        assertTrue(claimIssuer.isClaimValid(IIdentity(identity), claimTopic, sig, data));
    }

    function test_isClaimValid_rejectsSignatureFromUnknownKey() public view {
        address identity = address(0xBEEF);
        uint256 claimTopic = 1;
        bytes memory data = "claim data";

        uint256 strangerKey = 0xBAD;
        bytes32 dataHash = keccak256(abi.encode(identity, claimTopic, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(strangerKey, prefixedHash);
        bytes memory sig = abi.encodePacked(r, s, v);

        assertFalse(claimIssuer.isClaimValid(IIdentity(identity), claimTopic, sig, data));
    }

    function test_revokeClaimBySignature_marksClaimAsRevoked() public {
        address identity = address(0xBEEF);
        uint256 claimTopic = 1;
        bytes memory data = "claim data";
        bytes memory sig = _sign(identity, claimTopic, data);

        assertTrue(claimIssuer.isClaimValid(IIdentity(identity), claimTopic, sig, data));

        vm.prank(issuer);
        claimIssuer.revokeClaimBySignature(sig);

        assertTrue(claimIssuer.isClaimRevoked(sig));
        assertFalse(claimIssuer.isClaimValid(IIdentity(identity), claimTopic, sig, data));
    }

    function test_revokeClaimBySignature_revertsForNonManager() public {
        bytes memory sig = _sign(address(0xBEEF), 1, "claim data");

        vm.prank(address(0xB0B));
        vm.expectRevert(bytes("Permissions: Sender does not have management key"));
        claimIssuer.revokeClaimBySignature(sig);
    }

    function test_revokeClaimBySignature_revertsWhenAlreadyRevoked() public {
        bytes memory sig = _sign(address(0xBEEF), 1, "claim data");

        vm.prank(issuer);
        claimIssuer.revokeClaimBySignature(sig);

        vm.prank(issuer);
        vm.expectRevert(bytes("Conflict: Claim already revoked"));
        claimIssuer.revokeClaimBySignature(sig);
    }

    function test_revokeClaim_byClaimId_marksSignatureAsRevoked() public {
        // the identity holding the claim needs a claim key to store it on itself
        Identity identity = new Identity(issuer);
        vm.prank(issuer);
        identity.addKey(keccak256(abi.encode(issuer)), 3, 1);

        uint256 claimTopic = 7;
        bytes memory data = "claim data";
        bytes memory sig = _sign(address(identity), claimTopic, data);

        vm.prank(issuer);
        bytes32 claimId = identity.addClaim(claimTopic, 1, address(claimIssuer), sig, data, "");

        vm.prank(issuer);
        assertTrue(claimIssuer.revokeClaim(claimId, address(identity)));

        assertTrue(claimIssuer.isClaimRevoked(sig));
    }

    function test_revokeClaim_revertsForNonManager() public {
        Identity identity = new Identity(issuer);
        vm.prank(address(0xB0B));
        vm.expectRevert(bytes("Permissions: Sender does not have management key"));
        claimIssuer.revokeClaim(keccak256("nope"), address(identity));
    }
}
