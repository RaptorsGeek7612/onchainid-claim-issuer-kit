export const claimIssuerAbi = [
  {
    type: "function",
    name: "isClaimValid",
    stateMutability: "view",
    inputs: [
      { name: "_identity", type: "address" },
      { name: "claimTopic", type: "uint256" },
      { name: "sig", type: "bytes" },
      { name: "data", type: "bytes" },
    ],
    outputs: [{ name: "claimValid", type: "bool" }],
  },
  {
    type: "function",
    name: "isClaimRevoked",
    stateMutability: "view",
    inputs: [{ name: "_sig", type: "bytes" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "revokeClaimBySignature",
    stateMutability: "nonpayable",
    inputs: [{ name: "signature", type: "bytes" }],
    outputs: [],
  },
  {
    type: "function",
    name: "keyHasPurpose",
    stateMutability: "view",
    inputs: [
      { name: "_key", type: "bytes32" },
      { name: "_purpose", type: "uint256" },
    ],
    outputs: [{ name: "result", type: "bool" }],
  },
] as const;
