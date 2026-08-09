import type { CatalogCategory, GameSummary } from "@/src/types";
import { toCents } from "@/src/utils/money";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  isUnlocked: (summary: GameSummary, boughtCategories: Set<CatalogCategory>) => boolean;
};

export const achievements: Achievement[] = [
  {
    id: "primeira-compra",
    title: "Primeira compra",
    description: "Comprou qualquer item.",
    isUnlocked: (summary) => summary.totalUnits > 0,
  },
  {
    id: "milionario",
    title: "Milionario por um minuto",
    description: "Gastou mais de R$ 1 milhao.",
    isUnlocked: (summary) => toCents(summary.totalSpentCents) >= 100000000n,
  },
  {
    id: "bilhao",
    title: "Gastou R$ 1 bilhao",
    description: "Passou da casa do bilhao.",
    isUnlocked: (summary) => toCents(summary.totalSpentCents) >= 100000000000n,
  },
  {
    id: "trilhao",
    title: "Gastou R$ 1 trilhao",
    description: "Agora a escala ficou indecente.",
    isUnlocked: (summary) => toCents(summary.totalSpentCents) >= 100000000000000n,
  },
  {
    id: "carros",
    title: "Colecionador de carros",
    description: "Comprou algo da categoria Carros.",
    isUnlocked: (_, categories) => categories.has("Carros"),
  },
  {
    id: "imoveis",
    title: "Magnata imobiliario",
    description: "Comprou um imovel ou projeto urbano.",
    isUnlocked: (_, categories) => categories.has("Imoveis"),
  },
  {
    id: "espaco",
    title: "Turista espacial",
    description: "Comprou uma experiencia ou missao espacial.",
    isUnlocked: (_, categories) => categories.has("Espaco"),
  },
  {
    id: "filantropo",
    title: "Filantropo",
    description: "Investiu em impacto social.",
    isUnlocked: (_, categories) => categories.has("Impacto social"),
  },
  {
    id: "todas-categorias",
    title: "Um de cada universo",
    description: "Comprou ao menos um item de cada categoria principal.",
    isUnlocked: (_, categories) => categories.size >= 12,
  },
  {
    id: "zerou",
    title: "Zerou a fortuna",
    description: "Gastou 100% da simulacao.",
    isUnlocked: (summary) => summary.percentageSpentBasisPoints >= 10000,
  },
  {
    id: "recorde",
    title: "Gastou tudo em tempo recorde",
    description: "Finalizou 100% em ate cinco minutos ativos.",
    isUnlocked: (summary) => summary.percentageSpentBasisPoints >= 10000 && summary.activeDurationMs <= 300000,
  },
  {
    id: "compulsivo",
    title: "Comprador compulsivo",
    description: "Comprou 1.000 unidades.",
    isUnlocked: (summary) => summary.totalUnits >= 1000,
  },
  {
    id: "absurdo",
    title: "Rei do absurdo",
    description: "Comprou um item ficticio ou nao comercializavel.",
    isUnlocked: (summary) =>
      summary.boughtItems.some((item) =>
        ["copa-particular", "porta-avioes-expo", "cidade-ficticia", "pais-ficticio", "minuto-internet", "joias-coroa"].includes(
          item.itemId,
        ),
      ),
  },
];

export function getUnlockedAchievements(summary: GameSummary): Achievement[] {
  const categories = new Set(summary.boughtItems.map((item) => item.category));
  return achievements.filter((achievement) => achievement.isUnlocked(summary, categories));
}
