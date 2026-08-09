import { catalogItems } from "@/src/data/catalog";
import { filterCatalog } from "@/src/features/catalog/filterCatalog";
import { buyItem, calculateRemainingBalance, createInitialGame, finishGame, sellItem, summarizeGame } from "@/src/features/game/gameEngine";
import { validateRankingSubmission } from "@/src/features/ranking/validation";
import type { UserProfile, WealthSnapshot } from "@/src/types";
import { maxAffordableQuantity, percentageBasisPoints } from "@/src/utils/money";
import { closeActiveInterval } from "@/src/utils/time";

const snapshot: WealthSnapshot = {
  id: "test",
  fortuneUsdCents: "100000000",
  usdBrlRateMicros: "5000000",
  initialWealthCents: "1000000000000000000000000",
  source: "test",
  updatedAt: "2026-08-09T00:00:00.000Z",
  catalogVersionId: "catalog-v1",
  catalogVersionLabel: "test",
  status: "mock",
};

const profile: UserProfile = {
  userId: "user-1",
  nickname: "Tester",
  initials: "TE",
  avatarColor: "#8cff4f",
  acceptedTerms: true,
  createdAt: "2026-08-09T00:00:00.000Z",
  bestSpentCents: "0",
  bestPercentageBasisPoints: 0,
  completedGames: 0,
  totalItemsBought: 0,
  favoriteCategory: "Nenhuma",
};

describe("game engine", () => {
  it("calcula compra com valores grandes sem perder precisao", () => {
    const game = createInitialGame("user-1", snapshot, "2026-08-09T00:00:00.000Z");
    const item = catalogItems.find((entry) => entry.id === "programa-espacial");

    expect(item).toBeTruthy();
    const result = buyItem(game, item!.id, 2, "2026-08-09T00:01:00.000Z");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const summary = summarizeGame(result.game);
      expect(summary.totalSpentCents).toBe((BigInt(item!.priceCents) * 2n).toString());
      expect(calculateRemainingBalance(result.game)).toBe((BigInt(snapshot.initialWealthCents) - BigInt(summary.totalSpentCents)).toString());
    }
  });

  it("impede saldo negativo", () => {
    const tinySnapshot = { ...snapshot, initialWealthCents: "1000" };
    const game = createInitialGame("user-1", tinySnapshot);

    const result = buyItem(game, "programa-espacial", 1);

    expect(result.ok).toBe(false);
  });

  it("vende exatamente o que foi comprado e impede vender acima", () => {
    const game = createInitialGame("user-1", snapshot);
    const bought = buyItem(game, "smartphone-premium", 3);

    expect(bought.ok).toBe(true);
    if (!bought.ok) {
      return;
    }

    const sold = sellItem(bought.game, "smartphone-premium", 2);
    expect(sold.ok).toBe(true);
    if (sold.ok) {
      expect(sold.game.purchases["smartphone-premium"]).toBe(1);
      expect(sellItem(sold.game, "smartphone-premium", 2).ok).toBe(false);
    }
  });

  it("calcula percentual em basis points", () => {
    expect(percentageBasisPoints("2500", "10000")).toBe(2500);
    expect(percentageBasisPoints("11000", "10000")).toBe(10000);
  });

  it("calcula maximo descontando itens limitados ja comprados", () => {
    expect(maxAffordableQuantity("100000000000000", "1", 5, 3)).toBe(2);
    expect(maxAffordableQuantity("100000000000000", "1", 5, 5)).toBe(0);
  });

  it("fecha intervalos de cronometro por timestamps", () => {
    const duration = closeActiveInterval(5000, "2026-08-09T00:00:00.000Z", "2026-08-09T00:00:10.000Z");
    expect(duration).toBe(15000);
  });

  it("pausa ao finalizar e gera resumo", () => {
    const game = createInitialGame("user-1", snapshot, "2026-08-09T00:00:00.000Z");
    const bought = buyItem(game, "cafe-premium", 10, "2026-08-09T00:00:01.000Z");
    expect(bought.ok).toBe(true);
    if (!bought.ok) {
      return;
    }

    const finished = finishGame(
      { ...bought.game, currentActiveIntervalStartedAt: "2026-08-09T00:00:01.000Z" },
      "2026-08-09T00:00:11.000Z",
    );
    const summary = summarizeGame(finished);

    expect(finished.currentActiveIntervalStartedAt).toBeNull();
    expect(summary.activeDurationMs).toBe(10000);
    expect(summary.totalUnits).toBe(10);
  });

  it("finalizar uma partida ja finalizada preserva o resumo", () => {
    const game = createInitialGame("user-1", snapshot, "2026-08-09T00:00:00.000Z");
    const bought = buyItem(game, "cafe-premium", 2, "2026-08-09T00:00:01.000Z");
    expect(bought.ok).toBe(true);
    if (!bought.ok) {
      return;
    }

    const firstFinish = finishGame(bought.game, "2026-08-09T00:00:05.000Z");
    const secondFinish = finishGame(firstFinish, "2026-08-09T00:01:05.000Z");

    expect(summarizeGame(secondFinish).totalSpentCents).toBe(summarizeGame(firstFinish).totalSpentCents);
    expect(secondFinish.status).toBe("finished");
  });
});

describe("catalog filters", () => {
  it("filtra por busca, categoria, destaque e caber no saldo", () => {
    const filtered = filterCatalog(catalogItems, {
      search: "jato",
      category: "Aviacao",
      sort: "featured",
      estimateType: "todos",
      onlyAffordable: true,
      onlyBought: false,
      balanceCents: "100000000000",
      purchases: {},
    });

    expect(filtered.some((item) => item.id === "jato-executivo")).toBe(true);
    expect(filtered.every((item) => item.category === "Aviacao")).toBe(true);
  });
});

describe("ranking validation", () => {
  it("rejeita partida ativa e aceita partida finalizada valida", () => {
    const game = createInitialGame("user-1", snapshot);
    expect(validateRankingSubmission(game, profile).ok).toBe(false);

    const bought = buyItem(game, "smartphone-premium", 1);
    expect(bought.ok).toBe(true);
    if (!bought.ok) {
      return;
    }

    const finished = finishGame(bought.game);
    const validation = validateRankingSubmission(finished, profile);

    expect(validation.ok).toBe(true);
  });
});
