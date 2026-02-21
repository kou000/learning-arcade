import {
  buildWalletForPrice,
  canMakeExact,
  COIN_DENOMINATIONS,
  walletTotal,
} from "../src/features/soroban/wallet";

describe("wallet generation for shop payment", () => {
  test("keeps total coins and supports exact payment when coins cover price", () => {
    const cases = [
      { total: 888, price: 120 },
      { total: 999, price: 340 },
      { total: 120, price: 120 },
      { total: 1000, price: 999 },
      { total: 42, price: 1 },
    ];

    for (const { total, price } of cases) {
      const wallet = buildWalletForPrice(total, price);
      expect(walletTotal(wallet)).toBe(total);
      expect(canMakeExact(price, wallet)).toBe(true);
    }
  });

  test("never generates negative coin counts", () => {
    const wallet = buildWalletForPrice(777, 321);
    for (const denom of COIN_DENOMINATIONS) {
      expect(wallet[denom]).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(wallet[denom])).toBe(true);
    }
  });

  test("falls back to available total when coins are less than price", () => {
    const wallet = buildWalletForPrice(80, 120);
    expect(walletTotal(wallet)).toBe(80);
    expect(canMakeExact(120, wallet)).toBe(false);
  });
});
