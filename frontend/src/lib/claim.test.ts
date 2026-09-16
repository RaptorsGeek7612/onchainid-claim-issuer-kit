import { describe, expect, it } from "vitest";
import { claimDataHash, textToClaimData } from "./claim";

describe("textToClaimData", () => {
  it("UTF-8 encodes text to hex", () => {
    expect(textToClaimData("KYC test data")).toBe("0x4b594320746573742064617461");
  });

  it("encodes an empty string to empty bytes", () => {
    expect(textToClaimData("")).toBe("0x");
  });
});

describe("claimDataHash", () => {
  it("matches an independently computed hash (cast abi-encode + cast keccak)", () => {
    // Cross-checked against a second, independent implementation (Foundry's
    // Rust-based `cast`, not viem) to catch any drift in the ABI encoding
    // this app uses to reproduce the on-chain ClaimIssuer.isClaimValid /
    // Identity.isClaimValid signature scheme:
    //   keccak256(abi.encode(identity, topic, data))
    //
    //   $ cast abi-encode "f(address,uint256,bytes)" \
    //       0x6B3D16C808E8084bBC679292b3914385ef032Ceb 1 \
    //       "$(cast --from-utf8 'KYC test data')"
    //   $ cast keccak <output above>
    const identity = "0x6B3D16C808E8084bBC679292b3914385ef032Ceb" as const;
    const topic = BigInt(1);
    const data = textToClaimData("KYC test data");

    const hash = claimDataHash(identity, topic, data);

    expect(hash).toBe("0xe9c757ccb2289fa1f7d0e1401cf19da7994fc0f294befabb656ec5a48251068e");
  });

  it("changes when the identity changes", () => {
    const topic = BigInt(1);
    const data = textToClaimData("same data");
    const a = claimDataHash("0x6B3D16C808E8084bBC679292b3914385ef032Ceb", topic, data);
    const b = claimDataHash("0x000000000000000000000000000000000000dEaD", topic, data);
    expect(a).not.toBe(b);
  });

  it("changes when the topic changes", () => {
    const identity = "0x6B3D16C808E8084bBC679292b3914385ef032Ceb" as const;
    const data = textToClaimData("same data");
    const a = claimDataHash(identity, BigInt(1), data);
    const b = claimDataHash(identity, BigInt(2), data);
    expect(a).not.toBe(b);
  });

  it("changes when the data changes", () => {
    const identity = "0x6B3D16C808E8084bBC679292b3914385ef032Ceb" as const;
    const a = claimDataHash(identity, BigInt(1), textToClaimData("data A"));
    const b = claimDataHash(identity, BigInt(1), textToClaimData("data B"));
    expect(a).not.toBe(b);
  });
});
