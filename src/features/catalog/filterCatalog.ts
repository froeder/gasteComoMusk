import type { CatalogItem, EstimateType, PurchaseMap } from "@/src/types";
import { compareCents } from "@/src/utils/money";

export type CatalogSort = "order" | "priceAsc" | "priceDesc" | "mostBought" | "featured";

export type CatalogFilters = {
  search: string;
  category: string;
  sort: CatalogSort;
  estimateType: EstimateType | "todos";
  onlyAffordable: boolean;
  onlyBought: boolean;
  balanceCents: string;
  purchases: PurchaseMap;
};

export function filterCatalog(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  const normalizedSearch = filters.search.trim().toLocaleLowerCase("pt-BR");

  return items
    .filter((item) => item.active)
    .filter((item) => (filters.category === "Todos" ? true : item.category === filters.category))
    .filter((item) => (filters.estimateType === "todos" ? true : item.estimateType === filters.estimateType))
    .filter((item) =>
      normalizedSearch.length === 0
        ? true
        : `${item.name} ${item.shortDescription} ${item.category}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    )
    .filter((item) => (filters.onlyAffordable ? compareCents(item.priceCents, filters.balanceCents) <= 0 : true))
    .filter((item) => (filters.onlyBought ? (filters.purchases[item.id] ?? 0) > 0 : true))
    .sort((left, right) => {
      if (filters.sort === "priceAsc") {
        return compareCents(left.priceCents, right.priceCents);
      }

      if (filters.sort === "priceDesc") {
        return compareCents(right.priceCents, left.priceCents);
      }

      if (filters.sort === "mostBought") {
        return (filters.purchases[right.id] ?? 0) - (filters.purchases[left.id] ?? 0);
      }

      if (filters.sort === "featured") {
        return Number(right.featured) - Number(left.featured) || left.order - right.order;
      }

      return left.order - right.order;
    });
}
