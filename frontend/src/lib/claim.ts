import { encodeAbiParameters, keccak256, stringToHex, type Hex } from "viem";

/**
 * Reproduces the ONCHAINID claim signature scheme:
 * keccak256(abi.encode(identity, topic, data)), then signed as an
 * EIP-191 personal message so `ecrecover` on-chain matches the wallet's signature.
 */
export function claimDataHash(identity: Hex, topic: bigint, data: Hex): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "bytes" }],
      [identity, topic, data],
    ),
  );
}

export function textToClaimData(text: string): Hex {
  return stringToHex(text);
}
