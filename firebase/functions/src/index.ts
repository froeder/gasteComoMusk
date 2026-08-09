import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/https";
import { onSchedule } from "firebase-functions/scheduler";

initializeApp();

type WealthQuote = {
  fortuneUsdCents: string;
  source: string;
  status: "mock" | "manual" | "automated" | "fallback";
};

type ExchangeQuote = {
  usdBrlRateMicros: string;
  source: string;
};

interface WealthProvider {
  getCurrentWealth(): Promise<WealthQuote>;
}

interface ExchangeRateProvider {
  getUsdBrl(): Promise<ExchangeQuote>;
}

class MockWealthProvider implements WealthProvider {
  async getCurrentWealth(): Promise<WealthQuote> {
    return {
      fortuneUsdCents: process.env.MANUAL_WEALTH_USD_CENTS ?? "40000000000000",
      source: "Mock/manual admin provider",
      status: "mock",
    };
  }
}

class MockExchangeRateProvider implements ExchangeRateProvider {
  async getUsdBrl(): Promise<ExchangeQuote> {
    return {
      usdBrlRateMicros: process.env.MANUAL_USD_BRL_RATE_MICROS ?? "5430000",
      source: "Mock/manual USD-BRL provider",
    };
  }
}

function brlFromUsd(fortuneUsdCents: string, usdBrlRateMicros: string): string {
  return ((BigInt(fortuneUsdCents) * BigInt(usdBrlRateMicros)) / 1000000n).toString();
}

const wealthProvider = new MockWealthProvider();
const exchangeRateProvider = new MockExchangeRateProvider();

export const updateDailyWealthSnapshot = onSchedule(
  {
    schedule: "every day 06:00",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    const db = getFirestore();
    const [wealth, exchange] = await Promise.all([
      wealthProvider.getCurrentWealth(),
      exchangeRateProvider.getUsdBrl(),
    ]);
    const initialWealthCents = brlFromUsd(wealth.fortuneUsdCents, exchange.usdBrlRateMicros);
    const snapshotId = new Date().toISOString().slice(0, 10);

    await db.doc(`wealthSnapshots/${snapshotId}`).set(
      {
        id: snapshotId,
        fortuneUsdCents: wealth.fortuneUsdCents,
        usdBrlRateMicros: exchange.usdBrlRateMicros,
        initialWealthCents,
        source: `${wealth.source}; ${exchange.source}`,
        status: wealth.status,
        updatedAt: FieldValue.serverTimestamp(),
        catalogVersionId: "catalog-v1",
      },
      { merge: true },
    );

    await db.doc("appConfig/public").set(
      {
        currentWealthSnapshotId: snapshotId,
        updatedAt: FieldValue.serverTimestamp(),
        updateStatus: "ok",
      },
      { merge: true },
    );
  },
);

export const publishValidatedScore = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Autenticacao obrigatoria.");
  }

  const { gameId } = request.data as { gameId?: string };
  if (!gameId) {
    throw new HttpsError("invalid-argument", "gameId e obrigatorio.");
  }

  const db = getFirestore();
  const gameRef = db.doc(`games/${gameId}`);
  const gameDoc = await gameRef.get();
  if (!gameDoc.exists || gameDoc.data()?.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Partida nao pertence ao usuario.");
  }

  const game = gameDoc.data() ?? {};
  if (game.status !== "finished") {
    throw new HttpsError("failed-precondition", "Partida ainda nao finalizada.");
  }

  const spent = BigInt(String(game.totalSpent ?? game.totalSpentCents ?? "0"));
  const initial = BigInt(String(game.initialWealth ?? game.initialWealthCents ?? "0"));
  if (initial <= 0n || spent < 0n || spent > initial) {
    throw new HttpsError("failed-precondition", "Resultado impossivel.");
  }

  const profile = await db.doc(`profiles/${request.auth.uid}`).get();
  const profileData = profile.data() ?? {};
  const entry = {
    userId: request.auth.uid,
    nickname: profileData.nickname ?? "Visitante",
    initials: profileData.initials ?? "VI",
    avatarColor: profileData.avatarColor ?? "#8cff4f",
    totalSpentCents: spent.toString(),
    percentageSpentBasisPoints: Number((spent * 10000n) / initial),
    activeDurationMs: Number(game.activeDurationMs ?? 0),
    createdAt: FieldValue.serverTimestamp(),
    itemCount: Number(game.itemCount ?? 0),
    mainCategory: game.mainCategory ?? "Nenhuma",
  };

  await db.doc(`leaderboards/global/entries/${gameId}-${request.auth.uid}`).set(entry, { merge: true });
  return { ok: true };
});
