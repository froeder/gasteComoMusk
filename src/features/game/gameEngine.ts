import { catalogItems, findCatalogItem } from "@/src/data/catalog";
import type { CatalogCategory, CatalogItem, GameStateSnapshot, GameSummary, Transaction, WealthSnapshot } from "@/src/types";
import {
  addCents,
  centsToString,
  compareCents,
  maxAffordableQuantity,
  multiplyCents,
  percentageBasisPoints,
  subtractCents,
  toCents,
  ZERO_CENTS,
} from "@/src/utils/money";
import { closeActiveInterval } from "@/src/utils/time";

export type GameActionResult =
  | { ok: true; game: GameStateSnapshot; transaction: Transaction }
  | { ok: false; reason: string };

export function createInitialGame(ownerId: string, wealthSnapshot: WealthSnapshot, nowIso = new Date().toISOString()): GameStateSnapshot {
  return {
    id: `game-${nowIso}-${Math.random().toString(36).slice(2, 8)}`,
    ownerId,
    status: "active",
    wealthSnapshot,
    purchases: {},
    transactions: [],
    activeDurationMs: 0,
    firstPurchaseAt: null,
    currentActiveIntervalStartedAt: null,
    startedAt: nowIso,
    finishedAt: null,
    updatedAt: nowIso,
    syncStatus: "local",
  };
}

export function calculateTotalSpent(purchases: Record<string, number>, items: CatalogItem[] = catalogItems): string {
  return items.reduce((total, item) => {
    const quantity = purchases[item.id] ?? 0;
    if (quantity <= 0) {
      return total;
    }

    return addCents(total, multiplyCents(item.priceCents, quantity));
  }, ZERO_CENTS);
}

export function calculateRemainingBalance(game: GameStateSnapshot, items: CatalogItem[] = catalogItems): string {
  return subtractCents(game.wealthSnapshot.initialWealthCents, calculateTotalSpent(game.purchases, items));
}

export function buyItem(
  game: GameStateSnapshot,
  itemId: string,
  quantity: number,
  nowIso = new Date().toISOString(),
): GameActionResult {
  const item = findCatalogItem(itemId);
  if (!item || !item.active) {
    return { ok: false, reason: "Item indisponivel." };
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return { ok: false, reason: "Informe uma quantidade valida." };
  }

  const alreadyBought = game.purchases[itemId] ?? 0;
  const balance = calculateRemainingBalance(game);
  if (item.maxQuantity !== undefined && quantity > maxAffordableQuantity(balance, item.priceCents, item.maxQuantity, alreadyBought)) {
    return { ok: false, reason: "Limite maximo desse item atingido." };
  }

  const subtotal = multiplyCents(item.priceCents, quantity);
  if (compareCents(subtotal, balance) > 0) {
    return { ok: false, reason: "Saldo insuficiente para essa compra." };
  }

  const transaction: Transaction = {
    id: `tx-${nowIso}-${itemId}-${game.transactions.length + 1}`,
    itemId,
    quantity,
    unitPriceCents: item.priceCents,
    type: "buy",
    createdAt: nowIso,
  };

  return {
    ok: true,
    transaction,
    game: {
      ...game,
      purchases: { ...game.purchases, [itemId]: alreadyBought + quantity },
      transactions: [...game.transactions, transaction],
      firstPurchaseAt: game.firstPurchaseAt ?? nowIso,
      currentActiveIntervalStartedAt: game.currentActiveIntervalStartedAt ?? nowIso,
      updatedAt: nowIso,
      syncStatus: "local",
    },
  };
}

export function sellItem(
  game: GameStateSnapshot,
  itemId: string,
  quantity: number,
  nowIso = new Date().toISOString(),
): GameActionResult {
  const item = findCatalogItem(itemId);
  if (!item) {
    return { ok: false, reason: "Item nao encontrado." };
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return { ok: false, reason: "Informe uma quantidade valida." };
  }

  const alreadyBought = game.purchases[itemId] ?? 0;
  if (quantity > alreadyBought) {
    return { ok: false, reason: "Voce nao comprou unidades suficientes para vender." };
  }

  const nextQuantity = alreadyBought - quantity;
  const nextPurchases = { ...game.purchases };
  if (nextQuantity === 0) {
    delete nextPurchases[itemId];
  } else {
    nextPurchases[itemId] = nextQuantity;
  }

  const transaction: Transaction = {
    id: `tx-${nowIso}-${itemId}-${game.transactions.length + 1}`,
    itemId,
    quantity,
    unitPriceCents: item.priceCents,
    type: "sell",
    createdAt: nowIso,
  };

  return {
    ok: true,
    transaction,
    game: {
      ...game,
      purchases: nextPurchases,
      transactions: [...game.transactions, transaction],
      updatedAt: nowIso,
      syncStatus: "local",
    },
  };
}

export function undoLastTransaction(game: GameStateSnapshot, nowIso = new Date().toISOString()): GameStateSnapshot {
  const last = game.transactions.at(-1);
  if (!last) {
    return game;
  }

  const currentQuantity = game.purchases[last.itemId] ?? 0;
  const nextPurchases = { ...game.purchases };
  const delta = last.type === "buy" ? -last.quantity : last.quantity;
  const nextQuantity = currentQuantity + delta;

  if (nextQuantity <= 0) {
    delete nextPurchases[last.itemId];
  } else {
    nextPurchases[last.itemId] = nextQuantity;
  }

  return {
    ...game,
    purchases: nextPurchases,
    transactions: game.transactions.slice(0, -1),
    updatedAt: nowIso,
    syncStatus: "local",
  };
}

export function finishGame(game: GameStateSnapshot, nowIso = new Date().toISOString()): GameStateSnapshot {
  return {
    ...game,
    status: "finished",
    activeDurationMs: closeActiveInterval(game.activeDurationMs, game.currentActiveIntervalStartedAt, nowIso),
    currentActiveIntervalStartedAt: null,
    finishedAt: nowIso,
    updatedAt: nowIso,
    syncStatus: "local",
  };
}

export function summarizeGame(game: GameStateSnapshot, nowIso = new Date().toISOString()): GameSummary {
  const totalSpentCents = calculateTotalSpent(game.purchases);
  const remainingBalanceCents = subtractCents(game.wealthSnapshot.initialWealthCents, totalSpentCents);
  const categoryTotals = new Map<CatalogCategory, bigint>();
  let totalUnits = 0;
  let mostExpensiveItemId: string | null = null;
  let mostExpensiveItemName: string | null = null;
  let mostExpensiveItemPrice = "-1";

  const boughtItems = catalogItems
    .filter((item) => (game.purchases[item.id] ?? 0) > 0)
    .map((item) => {
      const quantity = game.purchases[item.id] ?? 0;
      const subtotalCents = multiplyCents(item.priceCents, quantity);
      totalUnits += quantity;
      categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0n) + toCents(subtotalCents));
      if (compareCents(item.priceCents, mostExpensiveItemPrice) > 0) {
        mostExpensiveItemId = item.id;
        mostExpensiveItemName = item.name;
        mostExpensiveItemPrice = item.priceCents;
      }

      return {
        itemId: item.id,
        name: item.name,
        category: item.category,
        quantity,
        unitPriceCents: item.priceCents,
        subtotalCents,
      };
    });

  let mainCategory: CatalogCategory | "Nenhuma" = "Nenhuma";
  let maxCategoryTotal = 0n;
  categoryTotals.forEach((value, category) => {
    if (value > maxCategoryTotal) {
      maxCategoryTotal = value;
      mainCategory = category;
    }
  });

  const activeDurationMs = closeActiveInterval(game.activeDurationMs, game.currentActiveIntervalStartedAt, nowIso);

  return {
    gameId: game.id,
    totalSpentCents,
    remainingBalanceCents: centsToString(toCents(remainingBalanceCents) < 0n ? 0n : toCents(remainingBalanceCents)),
    percentageSpentBasisPoints: percentageBasisPoints(totalSpentCents, game.wealthSnapshot.initialWealthCents),
    activeDurationMs,
    distinctItems: boughtItems.length,
    totalUnits,
    mainCategory,
    mostExpensiveItemId,
    mostExpensiveItemName,
    boughtItems,
    completedAt: game.finishedAt,
  };
}

export function canFinishBecauseNoAffordableItem(game: GameStateSnapshot): boolean {
  const balance = calculateRemainingBalance(game);
  return catalogItems
    .filter((item) => item.active)
    .every((item) => maxAffordableQuantity(balance, item.priceCents, item.maxQuantity, game.purchases[item.id] ?? 0) === 0);
}
