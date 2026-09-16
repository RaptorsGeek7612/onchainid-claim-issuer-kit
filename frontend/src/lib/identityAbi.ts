// Minimal ERC-735 (ClaimHolder) read surface, implemented by contracts/Identity.sol.
export const identityAbi = [
  {
    type: "function",
    name: "getClaimIdsByTopic",
    stateMutability: "view",
    inputs: [{ name: "_topic", type: "uint256" }],
    outputs: [{ name: "claimIds", type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "getClaim",
    stateMutability: "view",
    inputs: [{ name: "_claimId", type: "bytes32" }],
    outputs: [
      { name: "topic", type: "uint256" },
      { name: "scheme", type: "uint256" },
      { name: "issuer", type: "address" },
      { name: "signature", type: "bytes" },
      { name: "data", type: "bytes" },
      { name: "uri", type: "string" },
    ],
  },
] as const;
