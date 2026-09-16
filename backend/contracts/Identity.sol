// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.35;

import {IIdentity} from "./interfaces/IIdentity.sol";
import {IClaimIssuer} from "./interfaces/IClaimIssuer.sol";

/**
 * @dev Implementation of the `IERC734` "KeyHolder" and the `IERC735` "ClaimHolder" interfaces
 * into a common Identity Contract.
 */
contract Identity is IIdentity {
    struct Key {
        uint256[] purposes;
        uint256 keyType;
        bytes32 key;
    }

    struct Execution {
        address to;
        uint256 value;
        bytes data;
        bool approved;
        bool executed;
    }

    struct Claim {
        uint256 topic;
        uint256 scheme;
        address issuer;
        bytes signature;
        bytes data;
        string uri;
    }

    uint256 internal _executionNonce;

    mapping(bytes32 => Key) internal _keys;

    // purpose 1 = MANAGEMENT, purpose 2 = ACTION, purpose 3 = CLAIM, purpose 4 = ENCRYPTION
    mapping(uint256 => bytes32[]) internal _keysByPurpose;

    mapping(uint256 => Execution) internal _executions;

    mapping(bytes32 => Claim) internal _claims;

    mapping(uint256 => bytes32[]) internal _claimsByTopic;

    /**
     * @notice requires management key to call this function, or internal call
     */
    modifier onlyManager() {
        require(
            msg.sender == address(this) || keyHasPurpose(keccak256(abi.encode(msg.sender)), 1),
            "Permissions: Sender does not have management key"
        );
        _;
    }

    /**
     * @notice requires claim key to call this function, or internal call
     */
    modifier onlyClaimKey() {
        require(
            msg.sender == address(this) || keyHasPurpose(keccak256(abi.encode(msg.sender)), 3),
            "Permissions: Sender does not have claim signer key"
        );
        _;
    }

    constructor(address initialManagementKey) {
        require(initialManagementKey != address(0), "invalid argument - zero address");

        bytes32 _key = keccak256(abi.encode(initialManagementKey));
        _keys[_key].key = _key;
        _keys[_key].purposes = [1];
        _keys[_key].keyType = 1;
        _keysByPurpose[1].push(_key);
        emit KeyAdded(_key, 1, 1);
    }

    /**
     * @dev See {IERC734-execute}.
     */
    function execute(address _to, uint256 _value, bytes memory _data)
        external
        payable
        override
        returns (uint256 executionId)
    {
        uint256 _executionId = _executionNonce;
        _executions[_executionId].to = _to;
        _executions[_executionId].value = _value;
        _executions[_executionId].data = _data;
        _executionNonce++;

        emit ExecutionRequested(_executionId, _to, _value, _data);

        if (keyHasPurpose(keccak256(abi.encode(msg.sender)), 1)) {
            approve(_executionId, true);
        } else if (_to != address(this) && keyHasPurpose(keccak256(abi.encode(msg.sender)), 2)) {
            approve(_executionId, true);
        }

        return _executionId;
    }

    /**
     * @dev See {IERC734-getKey}.
     */
    function getKey(bytes32 _key)
        external
        view
        override
        returns (uint256[] memory purposes, uint256 keyType, bytes32 key)
    {
        return (_keys[_key].purposes, _keys[_key].keyType, _keys[_key].key);
    }

    /**
     * @dev See {IERC734-getKeyPurposes}.
     */
    function getKeyPurposes(bytes32 _key) external view override returns (uint256[] memory _purposes) {
        return (_keys[_key].purposes);
    }

    /**
     * @dev See {IERC734-getKeysByPurpose}.
     */
    function getKeysByPurpose(uint256 _purpose) external view override returns (bytes32[] memory keys) {
        return _keysByPurpose[_purpose];
    }

    /**
     * @dev See {IERC735-getClaimIdsByTopic}.
     */
    function getClaimIdsByTopic(uint256 _topic) external view override returns (bytes32[] memory claimIds) {
        return _claimsByTopic[_topic];
    }

    /**
     * @dev See {IERC734-addKey}.
     */
    function addKey(bytes32 _key, uint256 _purpose, uint256 _type) public override onlyManager returns (bool success) {
        if (_keys[_key].key == _key) {
            uint256[] memory _purposes = _keys[_key].purposes;
            for (uint256 keyPurposeIndex = 0; keyPurposeIndex < _purposes.length; keyPurposeIndex++) {
                uint256 purpose = _purposes[keyPurposeIndex];

                if (purpose == _purpose) {
                    revert("Conflict: Key already has purpose");
                }
            }

            _keys[_key].purposes.push(_purpose);
        } else {
            _keys[_key].key = _key;
            _keys[_key].purposes = [_purpose];
            _keys[_key].keyType = _type;
        }

        _keysByPurpose[_purpose].push(_key);

        emit KeyAdded(_key, _purpose, _type);

        return true;
    }

    /**
     * @dev See {IERC734-approve}.
     */
    function approve(uint256 _id, bool _approve) public override returns (bool success) {
        require(_id < _executionNonce, "Cannot approve a non-existing execution");
        require(!_executions[_id].executed, "Request already executed");

        if (_executions[_id].to == address(this)) {
            require(keyHasPurpose(keccak256(abi.encode(msg.sender)), 1), "Sender does not have management key");
        } else {
            require(keyHasPurpose(keccak256(abi.encode(msg.sender)), 2), "Sender does not have action key");
        }

        emit Approved(_id, _approve);

        if (_approve == true) {
            _executions[_id].approved = true;

            // solhint-disable-next-line avoid-low-level-calls
            (success,) = _executions[_id].to.call{value: (_executions[_id].value)}(_executions[_id].data);

            if (success) {
                _executions[_id].executed = true;

                emit Executed(_id, _executions[_id].to, _executions[_id].value, _executions[_id].data);

                return true;
            } else {
                emit ExecutionFailed(_id, _executions[_id].to, _executions[_id].value, _executions[_id].data);

                return false;
            }
        } else {
            _executions[_id].approved = false;
        }
        return false;
    }

    /**
     * @dev See {IERC734-removeKey}.
     */
    function removeKey(bytes32 _key, uint256 _purpose) public override onlyManager returns (bool success) {
        require(_keys[_key].key == _key, "NonExisting: Key isn't registered");
        uint256[] memory _purposes = _keys[_key].purposes;

        uint256 purposeIndex = 0;
        while (_purposes[purposeIndex] != _purpose) {
            purposeIndex++;

            if (purposeIndex == _purposes.length) {
                revert("NonExisting: Key doesn't have such purpose");
            }
        }

        _purposes[purposeIndex] = _purposes[_purposes.length - 1];
        _keys[_key].purposes = _purposes;
        _keys[_key].purposes.pop();

        uint256 keyIndex = 0;
        uint256 arrayLength = _keysByPurpose[_purpose].length;

        while (_keysByPurpose[_purpose][keyIndex] != _key) {
            keyIndex++;

            if (keyIndex >= arrayLength) {
                break;
            }
        }

        _keysByPurpose[_purpose][keyIndex] = _keysByPurpose[_purpose][arrayLength - 1];
        _keysByPurpose[_purpose].pop();

        uint256 keyType = _keys[_key].keyType;

        if (_purposes.length - 1 == 0) {
            delete _keys[_key];
        }

        emit KeyRemoved(_key, _purpose, keyType);

        return true;
    }

    /**
     * @dev See {IERC735-addClaim}.
     */
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    ) public override onlyClaimKey returns (bytes32 claimRequestId) {
        if (_issuer != address(this)) {
            require(
                IClaimIssuer(_issuer).isClaimValid(IIdentity(address(this)), _topic, _signature, _data), "invalid claim"
            );
        }

        bytes32 claimId = keccak256(abi.encode(_issuer, _topic));
        _claims[claimId].topic = _topic;
        _claims[claimId].scheme = _scheme;
        _claims[claimId].signature = _signature;
        _claims[claimId].data = _data;
        _claims[claimId].uri = _uri;

        if (_claims[claimId].issuer != _issuer) {
            _claimsByTopic[_topic].push(claimId);
            _claims[claimId].issuer = _issuer;

            emit ClaimAdded(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        } else {
            emit ClaimChanged(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        }
        return claimId;
    }

    /**
     * @dev See {IERC735-removeClaim}.
     */
    function removeClaim(bytes32 _claimId) public override onlyClaimKey returns (bool success) {
        uint256 _topic = _claims[_claimId].topic;
        if (_topic == 0) {
            revert("NonExisting: There is no claim with this ID");
        }

        uint256 claimIndex = 0;
        uint256 arrayLength = _claimsByTopic[_topic].length;
        while (_claimsByTopic[_topic][claimIndex] != _claimId) {
            claimIndex++;

            if (claimIndex >= arrayLength) {
                break;
            }
        }

        _claimsByTopic[_topic][claimIndex] = _claimsByTopic[_topic][arrayLength - 1];
        _claimsByTopic[_topic].pop();

        emit ClaimRemoved(
            _claimId,
            _topic,
            _claims[_claimId].scheme,
            _claims[_claimId].issuer,
            _claims[_claimId].signature,
            _claims[_claimId].data,
            _claims[_claimId].uri
        );

        delete _claims[_claimId];

        return true;
    }

    /**
     * @dev See {IERC735-getClaim}.
     */
    function getClaim(bytes32 _claimId)
        public
        view
        override
        returns (
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes memory signature,
            bytes memory data,
            string memory uri
        )
    {
        return (
            _claims[_claimId].topic,
            _claims[_claimId].scheme,
            _claims[_claimId].issuer,
            _claims[_claimId].signature,
            _claims[_claimId].data,
            _claims[_claimId].uri
        );
    }

    /**
     * @dev See {IERC734-keyHasPurpose}.
     * @notice Returns true if the key has MANAGEMENT purpose or the specified purpose.
     */
    function keyHasPurpose(bytes32 _key, uint256 _purpose) public view override returns (bool result) {
        Key memory key = _keys[_key];
        if (key.key == 0) return false;

        for (uint256 keyPurposeIndex = 0; keyPurposeIndex < key.purposes.length; keyPurposeIndex++) {
            uint256 purpose = key.purposes[keyPurposeIndex];

            if (purpose == 1 || purpose == _purpose) return true;
        }

        return false;
    }

    /**
     * @dev Checks if a claim is valid. Claims issued by the identity are self-attested claims. They do not have a
     * built-in revocation mechanism and are considered valid as long as their signature is valid and they are still
     * stored by the identity contract.
     */
    function isClaimValid(IIdentity _identity, uint256 claimTopic, bytes memory sig, bytes memory data)
        public
        view
        virtual
        override
        returns (bool claimValid)
    {
        bytes32 dataHash = keccak256(abi.encode(_identity, claimTopic, data));
        // Use abi.encodePacked to concatenate the message prefix and the message to sign.
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        address recovered = getRecoveredAddress(sig, prefixedHash);
        bytes32 hashedAddr = keccak256(abi.encode(recovered));

        if (keyHasPurpose(hashedAddr, 3)) {
            return true;
        }

        return false;
    }

    /**
     * @dev returns the address that signed the given data
     */
    function getRecoveredAddress(bytes memory sig, bytes32 dataHash) public pure returns (address addr) {
        bytes32 ra;
        bytes32 sa;
        uint8 va;

        if (sig.length != 65) {
            return address(0);
        }

        // solhint-disable-next-line no-inline-assembly
        assembly {
            ra := mload(add(sig, 32))
            sa := mload(add(sig, 64))
            va := byte(0, mload(add(sig, 96)))
        }

        if (va < 27) {
            va += 27;
        }

        address recoveredAddress = ecrecover(dataHash, va, ra, sa);

        return (recoveredAddress);
    }
}
