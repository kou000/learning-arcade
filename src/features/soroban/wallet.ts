export const COIN_DENOMINATIONS = [500, 100, 50, 10, 5, 1] as const;

export type CoinDenomination = (typeof COIN_DENOMINATIONS)[number];
export type WalletBreakdown = Record<CoinDenomination, number>;

function toUniqueDescending(denominations: readonly number[]): number[] {
  return Array.from(new Set(denominations.filter((value) => value > 0))).sort(
    (a, b) => b - a,
  );
}

export function createEmptyWallet(): WalletBreakdown {
  return { 500: 0, 100: 0, 50: 0, 10: 0, 5: 0, 1: 0 };
}

function addGreedy(
  wallet: WalletBreakdown,
  amount: number,
  denominations: readonly number[],
): number {
  let remain = Math.max(0, Math.floor(amount));
  for (const denom of denominations) {
    const count = Math.floor(remain / denom);
    if (count <= 0) continue;
    if (denom === 500 || denom === 100 || denom === 50 || denom === 10 || denom === 5 || denom === 1) {
      wallet[denom] += count;
    }
    remain -= count * denom;
  }
  return remain;
}

export function walletTotal(wallet: WalletBreakdown): number {
  return COIN_DENOMINATIONS.reduce(
    (sum, denom) => sum + denom * (wallet[denom] ?? 0),
    0,
  );
}

export function buildWalletForPrice(
  totalCoins: number,
  price: number,
  denominations: readonly number[] = COIN_DENOMINATIONS,
): WalletBreakdown {
  const normalizedTotal = Math.max(0, Math.floor(totalCoins));
  const normalizedPrice = Math.max(0, Math.floor(price));
  const denoms = toUniqueDescending(denominations);
  const wallet = createEmptyWallet();

  if (denoms.length === 0) return wallet;

  const guaranteed = Math.min(normalizedTotal, normalizedPrice);
  addGreedy(wallet, guaranteed, denoms);

  const used = walletTotal(wallet);
  const extra = Math.max(0, normalizedTotal - used);
  addGreedy(wallet, extra, denoms);

  return wallet;
}

export function canMakeExact(
  amount: number,
  wallet: WalletBreakdown,
  denominations: readonly number[] = COIN_DENOMINATIONS,
): boolean {
  const target = Math.max(0, Math.floor(amount));
  const denoms = toUniqueDescending(denominations);
  const reachable = new Array(target + 1).fill(false);
  reachable[0] = true;

  for (const denom of denoms) {
    if (!(denom === 500 || denom === 100 || denom === 50 || denom === 10 || denom === 5 || denom === 1)) {
      continue;
    }
    const count = Math.max(0, Math.floor(wallet[denom] ?? 0));
    for (let used = 0; used < count; used += 1) {
      for (let value = target; value >= denom; value -= 1) {
        if (reachable[value - denom]) reachable[value] = true;
      }
    }
  }

  return reachable[target] === true;
}
