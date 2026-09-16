// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.35;

import {Test} from "forge-std/Test.sol";
import {Identity} from "../contracts/Identity.sol";
import {ClaimIssuer} from "../contracts/ClaimIssuer.sol";

contract IdentityTest is Test {
    Identity internal identity;
    uint256 internal managerKey;
    address internal manager;

    function setUp() public {
        managerKey = 0xA11CE;
        manager = vm.addr(managerKey);
        identity = new Identity(manager);
    }

    function test_constructor_revertsOnZeroManagementKey() public {
        vm.expectRevert(bytes("invalid argument - zero address"));
        new Identity(address(0));
    }

    function test_addKey_addsNewPurposeToExistingKey() public {
        bytes32 managerKeyHash = keccak256(abi.encode(manager));

        vm.prank(manager);
        identity.addKey(managerKeyHash, 3, 1);

        assertTrue(identity.keyHasPurpose(managerKeyHash, 3));
        assertEq(identity.getKeyPurposes(managerKeyHash).length, 2);
    }

    function test_addKey_revertsWhenPurposeAlreadyExists() public {
        bytes32 managerKeyHash = keccak256(abi.encode(manager));

        vm.prank(manager);
        vm.expectRevert(bytes("Conflict: Key already has purpose"));
        identity.addKey(managerKeyHash, 1, 1);
    }

    function test_addKey_revertsForNonManager() public {
        address stranger = address(0xB0B);

        vm.prank(stranger);
        vm.expectRevert(bytes("Permissions: Sender does not have management key"));
        identity.addKey(keccak256(abi.encode(stranger)), 3, 1);
    }

    function test_removeKey_removesPurposeAndDeletesKeyWhenLast() public {
        address claimSigner = address(0xC1A1);
        bytes32 claimKeyHash = keccak256(abi.encode(claimSigner));

        vm.prank(manager);
        identity.addKey(claimKeyHash, 3, 1);
        assertTrue(identity.keyHasPurpose(claimKeyHash, 3));

        vm.prank(manager);
        identity.removeKey(claimKeyHash, 3);

        assertFalse(identity.keyHasPurpose(claimKeyHash, 3));
        (uint256[] memory purposes,,) = identity.getKey(claimKeyHash);
        assertEq(purposes.length, 0);
    }

    function test_removeKey_revertsForUnregisteredKey() public {
        vm.prank(manager);
        vm.expectRevert(bytes("NonExisting: Key isn't registered"));
        identity.removeKey(keccak256("nope"), 1);
    }

    function test_addClaim_selfAttestedClaimByClaimKey() public {
        address claimSigner = address(0xC1A1);
        vm.prank(manager);
        identity.addKey(keccak256(abi.encode(claimSigner)), 3, 1);

        vm.prank(claimSigner);
        bytes32 claimId = identity.addClaim(1, 1, address(identity), "sig", "data", "https://example.com");

        (uint256 topic,,,,,) = identity.getClaim(claimId);
        assertEq(topic, 1);

        bytes32[] memory ids = identity.getClaimIdsByTopic(1);
        assertEq(ids.length, 1);
        assertEq(ids[0], claimId);
    }

    function test_addClaim_revertsForNonClaimKey() public {
        vm.prank(address(0xB0B));
        vm.expectRevert(bytes("Permissions: Sender does not have claim signer key"));
        identity.addClaim(1, 1, address(identity), "sig", "data", "");
    }

    function test_addClaim_fromExternalIssuerRequiresValidSignature() public {
        uint256 issuerPrivKey = 0xD00D;
        address issuerSigner = vm.addr(issuerPrivKey);
        ClaimIssuer externalIssuer = new ClaimIssuer(issuerSigner);

        address claimSigner = address(0xC1A1);
        vm.prank(manager);
        identity.addKey(keccak256(abi.encode(claimSigner)), 3, 1);

        uint256 topic = 42;
        bytes memory data = "kyc-passed";
        bytes32 dataHash = keccak256(abi.encode(address(identity), topic, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(issuerPrivKey, prefixedHash);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.prank(claimSigner);
        bytes32 claimId = identity.addClaim(topic, 1, address(externalIssuer), sig, data, "");

        (uint256 storedTopic,,,,,) = identity.getClaim(claimId);
        assertEq(storedTopic, topic);
    }

    function test_addClaim_revertsForInvalidExternalSignature() public {
        uint256 issuerPrivKey = 0xD00D;
        address issuerSigner = vm.addr(issuerPrivKey);
        ClaimIssuer externalIssuer = new ClaimIssuer(issuerSigner);

        address claimSigner = address(0xC1A1);
        vm.prank(manager);
        identity.addKey(keccak256(abi.encode(claimSigner)), 3, 1);

        uint256 strangerKey = 0xBAD;
        bytes32 dataHash = keccak256(abi.encode(address(identity), uint256(1), bytes("data")));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(strangerKey, prefixedHash);
        bytes memory badSig = abi.encodePacked(r, s, v);

        vm.prank(claimSigner);
        vm.expectRevert(bytes("invalid claim"));
        identity.addClaim(1, 1, address(externalIssuer), badSig, "data", "");
    }

    function test_removeClaim_removesExistingClaim() public {
        address claimSigner = address(0xC1A1);
        vm.prank(manager);
        identity.addKey(keccak256(abi.encode(claimSigner)), 3, 1);

        vm.prank(claimSigner);
        bytes32 claimId = identity.addClaim(1, 1, address(identity), "sig", "data", "");

        vm.prank(claimSigner);
        identity.removeClaim(claimId);

        (uint256 topic,,,,,) = identity.getClaim(claimId);
        assertEq(topic, 0);
        assertEq(identity.getClaimIdsByTopic(1).length, 0);
    }

    function test_removeClaim_revertsForNonexistentClaim() public {
        vm.prank(manager);
        vm.expectRevert(bytes("NonExisting: There is no claim with this ID"));
        identity.removeClaim(keccak256("nope"));
    }

    function test_execute_managementKeyExecutesImmediately() public {
        address payable recipient = payable(address(0xCAFE));
        vm.deal(address(identity), 1 ether);

        vm.prank(manager);
        identity.execute(recipient, 0.5 ether, "");

        assertEq(recipient.balance, 0.5 ether);
    }

    function test_execute_actionKeyExecutesExternalTargetImmediately() public {
        address actionSigner = address(0xACE);
        vm.prank(manager);
        identity.addKey(keccak256(abi.encode(actionSigner)), 2, 1);

        address payable recipient = payable(address(0xCAFE));
        vm.deal(address(identity), 1 ether);

        vm.prank(actionSigner);
        identity.execute(recipient, 0.3 ether, "");

        assertEq(recipient.balance, 0.3 ether);
    }

    function test_execute_actionKeyOnSelfRequiresManagerApproval() public {
        address actionSigner = address(0xACE);
        vm.prank(manager);
        identity.addKey(keccak256(abi.encode(actionSigner)), 2, 1);

        address newKeyOwner = address(0xF00D);
        bytes32 newKeyHash = keccak256(abi.encode(newKeyOwner));
        bytes memory callData = abi.encodeWithSelector(identity.addKey.selector, newKeyHash, uint256(3), uint256(1));

        vm.prank(actionSigner);
        uint256 executionId = identity.execute(address(identity), 0, callData);

        // action keys cannot self-approve executions that target the identity itself
        assertFalse(identity.keyHasPurpose(newKeyHash, 3));

        vm.prank(manager);
        identity.approve(executionId, true);

        assertTrue(identity.keyHasPurpose(newKeyHash, 3));
    }

    function test_approve_revertsForNonexistentExecution() public {
        vm.prank(manager);
        vm.expectRevert(bytes("Cannot approve a non-existing execution"));
        identity.approve(999, true);
    }
}
