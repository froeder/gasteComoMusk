import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_WEALTH_SNAPSHOT } from "@/src/constants/wealth";
import { catalogItems } from "@/src/data/catalog";
import { buyItem, createInitialGame, finishGame, sellItem, summarizeGame, undoLastTransaction } from "@/src/features/game/gameEngine";
import type { GameStateSnapshot, GameSummary, UserProfile } from "@/src/types";
import { closeActiveInterval } from "@/src/utils/time";

const avatarColors = ["#8cff4f", "#60e6ff", "#f7c948", "#f0abfc", "#fb7185", "#5eead4"];

function initialsFromNickname(nickname: string): string {
  return nickname
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function createProfile(userId: string, nowIso = new Date().toISOString()): UserProfile {
  return {
    userId,
    nickname: "Visitante",
    initials: "VI",
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    acceptedTerms: true,
    createdAt: nowIso,
    bestSpentCents: "0",
    bestPercentageBasisPoints: 0,
    completedGames: 0,
    totalItemsBought: 0,
    favoriteCategory: "Nenhuma",
  };
}

type SessionStore = {
  userId: string;
  isMockUser: boolean;
  profile: UserProfile;
  activeGame: GameStateSnapshot;
  history: GameSummary[];
  lastMessage: string | null;
  setUser: (userId: string, isMockUser: boolean) => void;
  updateNickname: (nickname: string) => void;
  buy: (itemId: string, quantity: number) => void;
  sell: (itemId: string, quantity: number) => void;
  undo: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finish: () => GameSummary;
  newGame: () => void;
  clearMessage: () => void;
};

const initialUserId = "local-pending";
const initialProfile = createProfile(initialUserId);

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      userId: initialUserId,
      isMockUser: true,
      profile: initialProfile,
      activeGame: createInitialGame(initialUserId, DEFAULT_WEALTH_SNAPSHOT),
      history: [],
      lastMessage: null,
      setUser: (userId, isMockUser) =>
        set((state) => {
          if (state.userId === userId) {
            return { isMockUser };
          }

          const profile = { ...createProfile(userId), nickname: state.profile.nickname };
          return {
            userId,
            isMockUser,
            profile,
            activeGame: { ...state.activeGame, ownerId: userId },
          };
        }),
      updateNickname: (nickname) =>
        set((state) => ({
          profile: {
            ...state.profile,
            nickname,
            initials: initialsFromNickname(nickname) || "GM",
          },
        })),
      buy: (itemId, quantity) =>
        set((state) => {
          const result = buyItem(state.activeGame, itemId, quantity);
          if (!result.ok) {
            return { lastMessage: result.reason };
          }

          return { activeGame: result.game, lastMessage: `Compra registrada: ${quantity} unidade(s).` };
        }),
      sell: (itemId, quantity) =>
        set((state) => {
          const result = sellItem(state.activeGame, itemId, quantity);
          if (!result.ok) {
            return { lastMessage: result.reason };
          }

          return { activeGame: result.game, lastMessage: `Venda registrada: ${quantity} unidade(s).` };
        }),
      undo: () => set((state) => ({ activeGame: undoLastTransaction(state.activeGame), lastMessage: "Ultima acao desfeita." })),
      pauseTimer: () =>
        set((state) => {
          const nowIso = new Date().toISOString();
          return {
            activeGame: {
              ...state.activeGame,
              activeDurationMs: closeActiveInterval(
                state.activeGame.activeDurationMs,
                state.activeGame.currentActiveIntervalStartedAt,
                nowIso,
              ),
              currentActiveIntervalStartedAt: null,
              updatedAt: nowIso,
            },
          };
        }),
      resumeTimer: () =>
        set((state) => {
          if (!state.activeGame.firstPurchaseAt || state.activeGame.currentActiveIntervalStartedAt || state.activeGame.status === "finished") {
            return state;
          }

          return {
            activeGame: {
              ...state.activeGame,
              currentActiveIntervalStartedAt: new Date().toISOString(),
            },
          };
        }),
      finish: () => {
        const finished = finishGame(get().activeGame);
        const summary = summarizeGame(finished);
        set((state) => ({
          activeGame: finished,
          history: [summary, ...state.history].slice(0, 20),
          profile: {
            ...state.profile,
            bestGameId: summary.gameId,
            bestSpentCents: summary.totalSpentCents,
            bestPercentageBasisPoints: Math.max(state.profile.bestPercentageBasisPoints, summary.percentageSpentBasisPoints),
            completedGames: state.profile.completedGames + 1,
            totalItemsBought: state.profile.totalItemsBought + summary.totalUnits,
            favoriteCategory: summary.mainCategory,
          },
          lastMessage: "Partida finalizada. Recibo pronto para compartilhar.",
        }));
        return summary;
      },
      newGame: () =>
        set((state) => ({
          activeGame: createInitialGame(state.userId, {
            ...DEFAULT_WEALTH_SNAPSHOT,
            catalogVersionLabel: `${DEFAULT_WEALTH_SNAPSHOT.catalogVersionLabel} (${catalogItems.length} itens)`,
          }),
          lastMessage: "Nova partida iniciada.",
        })),
      clearMessage: () => set({ lastMessage: null }),
    }),
    {
      name: "gaste-como-musk-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        isMockUser: state.isMockUser,
        profile: state.profile,
        activeGame: state.activeGame,
        history: state.history,
      }),
    },
  ),
);
