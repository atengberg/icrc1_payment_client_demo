import { describe, expect, it } from 'vitest';

import ellipsizeICRC1Address from '@/utils/ellipsize-ICRC1-address.js';


describe("Test ellipsizeICRC1Address util", () => {

  const addresses = {
    onlyOwnerPrincipal: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae",
    veryShortSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-pscseiy.1",
    shortSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-dfhypjy.1234567809",
    lessShortSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-3l7u4da.12345678900a",
    longSubaccount: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-dfxgiyy.102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20",
  };

  it("should ellipsize an icrc1 address only containing a principal", () => {
    expect(ellipsizeICRC1Address(addresses.onlyOwnerPrincipal)).toEqual("k2t6j...6ae");
  });

  it("should ellipsize an icrc1 address with a very short subaccount (1 character)", () => {
    expect(ellipsizeICRC1Address(addresses.veryShortSubaccount)).toEqual("k2t6j...pscseiy.1");
  });

  it("should ellipsize an icrc1 address with a short subaccount (10 characters)", () => {
    expect(ellipsizeICRC1Address(addresses.shortSubaccount)).toEqual("k2t6j...dfhypjy.1234567809");
  });

  it("should ellipsize an icrc1 address with a slightly less short subaccount (12 characters / cutoff)", () => {
    expect(ellipsizeICRC1Address(addresses.lessShortSubaccount)).toEqual("k2t6j...3l7u4da.123...8900a");
  });

  it("should ellipsize an icrc1 address with a long subaccount 63 characters)", () => {
    expect(ellipsizeICRC1Address(addresses.longSubaccount)).toEqual("k2t6j...dfxgiyy.102...e1f20");
  });
})