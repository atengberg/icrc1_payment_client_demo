// @vitest-environment node

import { describe, expect, it } from 'vitest';
import ellipsizeICRC1Address from '@/utils/ellipsize-ICRC1-address.js';

describe("Test ellipsizeICRC1Address util", () => {
  const addresses = {
    onlyOwnerPrincipal: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae",
    singleCharSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-6cc627i.1",
    elevenCharSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-vfvjbna.1908f8e8d8c",
    twelveCharSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-ljvjgqq.9291908f8e8d",
    maxLengthSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-lz7q6gi.e0dfdedddcdbdad9d8d7d6d5d4d3d2d1d0cfcecdcccbcac9c8c7c6c5c4c3c2c1",
  };

  it("should not ellipsize an icrc1 address only containing a principal", () => {
    expect(ellipsizeICRC1Address(addresses.onlyOwnerPrincipal)).toEqual("k2t6j...6ae");
  });

  it("should not ellipsize an icrc1 address with a very short subaccount (1 character)", () => {
    expect(ellipsizeICRC1Address(addresses.singleCharSubaccount)).toEqual("k2t6j...6cc627i.1");
  });

  it("should not ellipsize an icrc1 address with a short subaccount (11 characters)", () => {
    expect(ellipsizeICRC1Address(addresses.elevenCharSubaccount)).toEqual("k2t6j...vfvjbna.1908f8e8d8c");
  });

  it("should ellipsize an icrc1 address with a slightly less short subaccount (12 characters / cutoff)", () => {
    expect(ellipsizeICRC1Address(addresses.twelveCharSubaccount)).toEqual("k2t6j...ljvjgqq.929...f8e8d");
  });

  it("should ellipsize an icrc1 address with a maximum length subaccount (64 characters)", () => {
    expect(ellipsizeICRC1Address(addresses.maxLengthSubaccount)).toEqual("k2t6j...lz7q6gi.e0d...3c2c1");
  });
})