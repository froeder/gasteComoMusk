import { catalogItems } from "@/src/data/catalog";
import type { GameStateSnapshot, LeaderboardEntry, UserProfile } from "@/src/types";
import { compareCents } from "@/src/utils/money";
import { summarizeGame } from "@/src/features/game/gameEngine";

export type RankingValidationResult =
  | { ok: true; entry: LeaderboardEntry }
  | { ok: false; reason: string };

export function validateRankingSubmission(
  game: GameStateSnapshot,
  profile: UserProfile,
  nowIso = new Date().toISOString(),
): RankingValidationResult {
  if (game.status !== "finished") {
    return { ok: false, reason: "A partida precisa estar finalizada." };
  }

  if (!profile.acceptedTerms || profile.nickname.trim().length < 3) {
    return { ok: false, reason: "Defina um apelido e aceite os termos antes de publicar." };
  }

  const summary = summarizeGame(game, nowIso);
  if (compareCents(summary.totalSpentCents, game.wealthSnapshot.initialWealthCents) > 0) {
    return { ok: false, reason: "Resultado impossivel: gasto maior que a fortuna inicial." };
  }

  const catalogIds = new Set(catalogItems.map((item) => item.id));
  if (summary.boughtItems.some((item) => !catalogIds.has(item.itemId))) {
    return { ok: false, reason: "Resultado contem item fora da versao de catalogo." };
  }

  if (summary.activeDurationMs < 0 || summary.activeDurationMs > 1000 * 60 * 60 * 24 * 30) {
    return { ok: false, reason: "Duracao ativa invalida." };
  }

  return {
    ok: true,
    entry: {
      id: `${game.id}-${profile.userId}`,
      userId: profile.userId,
      nickname: profile.nickname,
      avatarColor: profile.avatarColor,
      initials: profile.initials,
      totalSpentCents: summary.totalSpentCents,
      percentageSpentBasisPoints: summary.percentageSpentBasisPoints,
      activeDurationMs: summary.activeDurationMs,
      createdAt: nowIso,
      itemCount: summary.totalUnits,
      mainCategory: summary.mainCategory,
    },
  };
}
