export type EstimateType = "real" | "estimado" | "hipotetico" | "ficticio" | "nao_comercializavel";

export type CatalogCategory =
  | "Tecnologia"
  | "Carros"
  | "Imoveis"
  | "Viagens"
  | "Aviacao"
  | "Embarcacoes"
  | "Luxo"
  | "Arte e raridades"
  | "Animais e conservacao"
  | "Impacto social"
  | "Esportes"
  | "Espaco"
  | "Infraestrutura"
  | "Projetos extravagantes"
  | "Outros";

export type CatalogImage = {
  uri: string;
  author: string;
  source: string;
  license: string;
  alt: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  priceCents: string;
  category: CatalogCategory;
  subcategory?: string;
  image: CatalogImage;
  priceSource: string;
  priceReferenceDate: string;
  estimateType: EstimateType;
  tags: string[];
  maxQuantity?: number;
  featured: boolean;
  active: boolean;
  order: number;
  curiosity: string;
  impactEquivalent?: string;
};

export type WealthSnapshot = {
  id: string;
  fortuneUsdCents: string;
  usdBrlRateMicros: string;
  initialWealthCents: string;
  source: string;
  updatedAt: string;
  catalogVersionId: string;
  catalogVersionLabel: string;
  status: "mock" | "manual" | "automated" | "fallback";
};

export type PurchaseMap = Record<string, number>;

export type GameStatus = "active" | "finished";

export type Transaction = {
  id: string;
  itemId: string;
  quantity: number;
  unitPriceCents: string;
  type: "buy" | "sell";
  createdAt: string;
};

export type GameStateSnapshot = {
  id: string;
  ownerId: string;
  status: GameStatus;
  wealthSnapshot: WealthSnapshot;
  purchases: PurchaseMap;
  transactions: Transaction[];
  activeDurationMs: number;
  firstPurchaseAt: string | null;
  currentActiveIntervalStartedAt: string | null;
  startedAt: string;
  finishedAt: string | null;
  updatedAt: string;
  syncStatus: "local" | "syncing" | "synced" | "error";
};

export type GameSummary = {
  gameId: string;
  totalSpentCents: string;
  remainingBalanceCents: string;
  percentageSpentBasisPoints: number;
  activeDurationMs: number;
  distinctItems: number;
  totalUnits: number;
  mainCategory: CatalogCategory | "Nenhuma";
  mostExpensiveItemId: string | null;
  mostExpensiveItemName: string | null;
  boughtItems: {
    itemId: string;
    name: string;
    category: CatalogCategory;
    quantity: number;
    unitPriceCents: string;
    subtotalCents: string;
  }[];
  completedAt: string | null;
};

export type LeaderboardEntry = {
  id: string;
  userId: string;
  nickname: string;
  avatarColor: string;
  initials: string;
  totalSpentCents: string;
  percentageSpentBasisPoints: number;
  activeDurationMs: number;
  createdAt: string;
  itemCount: number;
  mainCategory: CatalogCategory | "Nenhuma";
};

export type UserProfile = {
  userId: string;
  nickname: string;
  initials: string;
  avatarColor: string;
  acceptedTerms: boolean;
  createdAt: string;
  bestGameId?: string;
  bestSpentCents: string;
  bestPercentageBasisPoints: number;
  fastestCompletionMs?: number;
  completedGames: number;
  totalItemsBought: number;
  favoriteCategory: CatalogCategory | "Nenhuma";
};
