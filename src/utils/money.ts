const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  compactDisplay: "long",
  maximumFractionDigits: 2,
});

export const ZERO_CENTS = "0";

export function toCents(value: string | number | bigint): bigint {
  return BigInt(value);
}

export function centsToString(value: bigint): string {
  return value.toString();
}

export function addCents(left: string, right: string): string {
  return (toCents(left) + toCents(right)).toString();
}

export function subtractCents(left: string, right: string): string {
  return (toCents(left) - toCents(right)).toString();
}

export function multiplyCents(unitPriceCents: string, quantity: number): string {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new Error("Quantidade invalida.");
  }

  return (toCents(unitPriceCents) * BigInt(quantity)).toString();
}

export function isGreaterThan(left: string, right: string): boolean {
  return toCents(left) > toCents(right);
}

export function maxAffordableQuantity(
  balanceCents: string,
  unitPriceCents: string,
  maxQuantity?: number,
  alreadyOwned = 0,
): number {
  const price = toCents(unitPriceCents);
  if (price <= 0n) {
    return 0;
  }

  const raw = toCents(balanceCents) / price;
  const remainingLimitedQuantity =
    maxQuantity === undefined ? undefined : Math.max(0, maxQuantity - Math.max(0, alreadyOwned));
  const capped =
    remainingLimitedQuantity === undefined
      ? raw
      : raw > BigInt(remainingLimitedQuantity)
        ? BigInt(remainingLimitedQuantity)
        : raw;
  const safeLimit = BigInt(Number.MAX_SAFE_INTEGER);
  return Number(capped > safeLimit ? safeLimit : capped);
}

export function percentageBasisPoints(spentCents: string, initialCents: string): number {
  const initial = toCents(initialCents);
  if (initial <= 0n) {
    return 0;
  }

  const basisPoints = (toCents(spentCents) * 10000n) / initial;
  return Number(basisPoints > 10000n ? 10000n : basisPoints);
}

export function formatPercentageFromBasisPoints(value: number): string {
  return `${(value / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function formatCurrency(cents: string): string {
  const value = Number(toCents(cents)) / 100;
  if (Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER) {
    return BRL_FORMATTER.format(value);
  }

  const sign = cents.startsWith("-") ? "-" : "";
  const normalized = cents.replace("-", "").padStart(3, "0");
  const reais = normalized.slice(0, -2);
  const centavos = normalized.slice(-2);
  return `${sign}R$ ${reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${centavos}`;
}

export function formatCompactCurrency(cents: string): string {
  const value = Number(toCents(cents)) / 100;
  if (Number.isFinite(value)) {
    return COMPACT_FORMATTER.format(value);
  }

  return formatCurrency(cents);
}

export function compareCents(left: string, right: string): number {
  const a = toCents(left);
  const b = toCents(right);
  return a === b ? 0 : a > b ? 1 : -1;
}

export function calculateBrlFromUsd(fortuneUsdCents: string, usdBrlRateMicros: string): string {
  return ((toCents(fortuneUsdCents) * toCents(usdBrlRateMicros)) / 1000000n).toString();
}
