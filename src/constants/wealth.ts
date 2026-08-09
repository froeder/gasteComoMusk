import type { WealthSnapshot } from "@/src/types";
import { calculateBrlFromUsd } from "@/src/utils/money";

const fortuneUsdCents = "40000000000000";
const usdBrlRateMicros = "5430000";

export const DEFAULT_WEALTH_SNAPSHOT: WealthSnapshot = {
  id: "dev-wealth-2026-08-09",
  fortuneUsdCents,
  usdBrlRateMicros,
  initialWealthCents: calculateBrlFromUsd(fortuneUsdCents, usdBrlRateMicros),
  source: "Provider mock de desenvolvimento + cotacao manual USD/BRL",
  updatedAt: "2026-08-09T12:00:00.000Z",
  catalogVersionId: "catalog-v1",
  catalogVersionLabel: "Catalogo inicial v1",
  status: "mock",
};
