import NetInfo from "@react-native-community/netinfo";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { Dice5, FileText, RotateCcw, Search, ShoppingCart, Undo2 } from "lucide-react-native";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppState,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { ItemArtwork } from "@/src/components/ItemArtwork";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { StatCard } from "@/src/components/StatCard";
import { catalogCategories, catalogItems, getCategoryColor } from "@/src/data/catalog";
import { type CatalogSort, filterCatalog } from "@/src/features/catalog/filterCatalog";
import { calculateRemainingBalance, calculateTotalSpent, summarizeGame } from "@/src/features/game/gameEngine";
import { useSessionStore } from "@/src/stores/sessionStore";
import { colors, shadow } from "@/src/theme/theme";
import type { CatalogItem, EstimateType } from "@/src/types";
import { formatCompactCurrency, formatCurrency, formatPercentageFromBasisPoints, maxAffordableQuantity } from "@/src/utils/money";
import { deriveVisibleDuration, formatDuration } from "@/src/utils/time";

const estimateLabels: Record<EstimateType | "todos", string> = {
  todos: "Todos",
  real: "Real",
  estimado: "Estimado",
  hipotetico: "Hipotetico",
  ficticio: "Ficticio",
  nao_comercializavel: "Nao comercial",
};

const sortLabels: Record<CatalogSort, string> = {
  order: "Padrao",
  priceAsc: "Menor preco",
  priceDesc: "Maior preco",
  mostBought: "Mais comprados",
  featured: "Destaques",
};

const primaryCategories = ["Todos", "Tecnologia", "Carros", "Imoveis", "Viagens", "Aviacao", "Luxo", "Espaco"];

export default function SpendScreen() {
  const router = useRouter();
  const activeGame = useSessionStore((state) => state.activeGame);
  const buy = useSessionStore((state) => state.buy);
  const sell = useSessionStore((state) => state.sell);
  const undo = useSessionStore((state) => state.undo);
  const finish = useSessionStore((state) => state.finish);
  const newGame = useSessionStore((state) => state.newGame);
  const pauseTimer = useSessionStore((state) => state.pauseTimer);
  const resumeTimer = useSessionStore((state) => state.resumeTimer);
  const lastMessage = useSessionStore((state) => state.lastMessage);
  const clearMessage = useSessionStore((state) => state.clearMessage);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState<CatalogSort>("order");
  const [estimateType, setEstimateType] = useState<EstimateType | "todos">("todos");
  const [onlyAffordable, setOnlyAffordable] = useState(false);
  const [onlyBought, setOnlyBought] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [nowMs, setNowMs] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const totalSpent = calculateTotalSpent(activeGame.purchases);
  const remaining = calculateRemainingBalance(activeGame);
  const effectiveNowMs = nowMs || Date.parse(activeGame.updatedAt);
  const summary = summarizeGame(activeGame, new Date(effectiveNowMs).toISOString());
  const visibleDuration = deriveVisibleDuration(activeGame.activeDurationMs, activeGame.currentActiveIntervalStartedAt, effectiveNowMs);

  useFocusEffect(
    useCallback(() => {
      resumeTimer();
      return () => pauseTimer();
    }, [pauseTimer, resumeTimer]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        resumeTimer();
      } else {
        pauseTimer();
      }
    });

    return () => subscription.remove();
  }, [pauseTimer, resumeTimer]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setIsConnected(Boolean(state.isConnected)));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (lastMessage) {
      const timeout = setTimeout(clearMessage, 2800);
      return () => clearTimeout(timeout);
    }
  }, [clearMessage, lastMessage]);

  const filteredItems = useMemo(
    () =>
      filterCatalog(catalogItems, {
        search,
        category,
        sort,
        estimateType,
        onlyAffordable,
        onlyBought,
        balanceCents: remaining,
        purchases: activeGame.purchases,
      }),
    [activeGame.purchases, category, estimateType, onlyAffordable, onlyBought, remaining, search, sort],
  );

  const onBuy = useCallback(
    (item: CatalogItem, quantity: number) => {
      if (quantity <= 0) {
        return;
      }

      const subtotal = BigInt(item.priceCents) * BigInt(quantity);
      const initial = BigInt(activeGame.wealthSnapshot.initialWealthCents);
      const consumesTooMuch = subtotal * 100n >= initial * 10n;
      const run = () => {
        Haptics.selectionAsync();
        buy(item.id, quantity);
      };

      if (consumesTooMuch) {
        if (Platform.OS === "web") {
          const browserConfirm = (globalThis as typeof globalThis & { confirm?: (message?: string) => boolean }).confirm;
          if (!browserConfirm || browserConfirm("Essa compra consome uma parcela enorme da fortuna simulada. Confirmar?")) {
            run();
          }
          return;
        }

        Alert.alert("Compra gigante", "Essa compra consome uma parcela enorme da fortuna simulada. Confirmar?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Comprar", style: "default", onPress: run },
        ]);
        return;
      }

      run();
    },
    [activeGame.wealthSnapshot.initialWealthCents, buy],
  );

  const surpriseMe = useCallback(() => {
    const affordable = filteredItems.filter(
      (item) => maxAffordableQuantity(remaining, item.priceCents, item.maxQuantity, activeGame.purchases[item.id] ?? 0) > 0,
    );
    if (affordable.length === 0) {
      Alert.alert("Nada cabe no saldo", "Finalize a partida ou venda algum item.");
      return;
    }

    const item = affordable[Math.floor(Math.random() * affordable.length)];
    onBuy(item, 1);
  }, [activeGame.purchases, filteredItems, onBuy, remaining]);

  const finishWithConfirmation = useCallback(() => {
    const run = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      finish();
      router.push("/receipt");
    };

    if (Platform.OS === "web") {
      const browserConfirm = (globalThis as typeof globalThis & { confirm?: (message?: string) => boolean }).confirm;
      if (!browserConfirm || browserConfirm("Finalizar partida e gerar o recibo ficticio?")) {
        run();
      }
      return;
    }

    Alert.alert("Finalizar partida", "O cronometro sera pausado e um recibo ficticio sera gerado.", [
      { text: "Continuar jogando", style: "cancel" },
      { text: "Finalizar", onPress: run },
    ]);
  }, [finish, router]);

  const renderItem = useCallback(
    ({ item }: { item: CatalogItem }) => (
      <CatalogCard
        item={item}
        boughtQuantity={activeGame.purchases[item.id] ?? 0}
        balanceCents={remaining}
        onBuy={onBuy}
        onSell={(quantity) => {
          Haptics.selectionAsync();
          sell(item.id, quantity);
        }}
      />
    ),
    [activeGame.purchases, onBuy, remaining, sell],
  );

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => setScrollOffset(event.nativeEvent.contentOffset.y);

  return (
    <Screen>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={120}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Fortuna disponivel</Text>
            <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(remaining)}
            </Text>
            <Text style={styles.compact}>{formatCompactCurrency(remaining)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${summary.percentageSpentBasisPoints / 100}%` }]} />
            </View>
            <View style={styles.statsGrid}>
              <StatCard label="Fortuna inicial" value={formatCompactCurrency(activeGame.wealthSnapshot.initialWealthCents)} />
              <StatCard label="Total gasto" value={formatCompactCurrency(totalSpent)} accent />
              <StatCard label="Percentual" value={formatPercentageFromBasisPoints(summary.percentageSpentBasisPoints)} />
              <StatCard label="Tempo ativo" value={formatDuration(visibleDuration)} />
            </View>
            <Text style={styles.source}>
              Atualizado em {new Date(activeGame.wealthSnapshot.updatedAt).toLocaleString("pt-BR")} - {activeGame.wealthSnapshot.source}
            </Text>
            <Text style={styles.source}>Status: {isConnected ? "online" : "offline com sessao local preservada"}</Text>
            {lastMessage ? <Text style={styles.toast}>{lastMessage}</Text> : null}
            <View style={styles.controlPanel}>
              <View style={styles.commandGrid}>
                <CommandButton label="Surpreenda-me" icon={Dice5} onPress={surpriseMe} />
                <CommandButton label="Desfazer" icon={Undo2} onPress={undo} />
                <CommandButton label="Nota fiscal" icon={FileText} onPress={() => router.push("/receipt")} />
                <CommandButton label="Finalizar" icon={ShoppingCart} onPress={finishWithConfirmation} accent />
                <CommandButton label="Nova partida" icon={RotateCcw} onPress={newGame} />
              </View>
              <View style={styles.searchWrap}>
                <Search size={18} color={colors.textMuted} />
                <TextInput
                  accessibilityLabel="Buscar item por nome"
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar item"
                  placeholderTextColor={colors.textMuted}
                  style={styles.search}
                />
              </View>
            </View>
            <View style={styles.filtersPanel}>
              <FilterSection title="Categoria">
                <FilterRail values={primaryCategories} selected={category} onSelect={setCategory} />
                <FilterRail values={catalogCategories.filter((item) => !primaryCategories.includes(item))} selected={category} onSelect={setCategory} />
              </FilterSection>
              <FilterSection title="Ordenar">
                <FilterRail values={Object.keys(sortLabels)} selected={sort} labels={sortLabels} onSelect={(value) => setSort(value as CatalogSort)} />
              </FilterSection>
              <FilterSection title="Tipo">
                <FilterRail
                  values={Object.keys(estimateLabels)}
                  selected={estimateType}
                  labels={estimateLabels}
                  onSelect={(value) => setEstimateType(value as EstimateType | "todos")}
                />
              </FilterSection>
              <View style={styles.toggleRow}>
                <FilterChip label="Cabe no saldo" selected={onlyAffordable} onPress={() => setOnlyAffordable((value) => !value)} />
                <FilterChip label="Ja comprados" selected={onlyBought} onPress={() => setOnlyBought((value) => !value)} />
              </View>
            </View>
            <Text style={styles.resultCount}>
              {filteredItems.length} itens encontrados {scrollOffset > 300 ? "- continue gastando" : ""}
            </Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Nenhum item combina com os filtros atuais.</Text>}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}

function FilterRail<T extends string>({
  values,
  selected,
  labels,
  onSelect,
}: {
  values: string[];
  selected: T | string;
  labels?: Record<string, string>;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRail}>
      {values.map((value) => (
        <FilterChip key={value} label={labels?.[value] ?? value} selected={selected === value} onPress={() => onSelect(value)} />
      ))}
    </ScrollView>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function CommandButton({
  label,
  icon: Icon,
  onPress,
  accent = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.commandButton, accent && styles.commandButtonAccent, pressed && styles.commandButtonPressed]}
    >
      <Icon size={18} color={accent ? colors.background : colors.text} strokeWidth={2.4} />
      <Text style={[styles.commandText, accent && styles.commandTextAccent]} numberOfLines={2} adjustsFontSizeToFit>
        {label}
      </Text>
    </Pressable>
  );
}

function CatalogCard({
  item,
  boughtQuantity,
  balanceCents,
  onBuy,
  onSell,
}: {
  item: CatalogItem;
  boughtQuantity: number;
  balanceCents: string;
  onBuy: (item: CatalogItem, quantity: number) => void;
  onSell: (quantity: number) => void;
}) {
  const { width } = useWindowDimensions();
  const [quantityText, setQuantityText] = useState("1");
  const quantity = Math.max(1, Number.parseInt(quantityText, 10) || 1);
  const max = maxAffordableQuantity(balanceCents, item.priceCents, item.maxQuantity, boughtQuantity);
  const categoryColor = getCategoryColor(item.category);
  const isCompact = width < 520;

  return (
    <View style={[styles.card, isCompact ? styles.cardCompact : styles.cardWide]}>
      <ItemArtwork item={item} variant={isCompact ? "compact" : "wide"} />
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.typePill, { borderColor: categoryColor }]}>
            <Text style={styles.typeText}>{estimateLabels[item.estimateType]}</Text>
          </View>
        </View>
        <Text style={styles.description}>{item.shortDescription}</Text>
        <Text style={styles.price}>{formatCurrency(item.priceCents)}</Text>
        <Text style={styles.meta}>
          {item.category} - comprado: {boughtQuantity}
        </Text>
        <View style={styles.quantityRow}>
          <TextInput
            accessibilityLabel={`Quantidade para ${item.name}`}
            keyboardType="number-pad"
            value={quantityText}
            onChangeText={setQuantityText}
            style={styles.quantityInput}
            maxLength={7}
          />
          {[1, 10, 100].map((step) => (
            <PrimaryButton key={step} label={`+${step}`} onPress={() => onBuy(item, step)} disabled={max < step} variant="secondary" />
          ))}
          <PrimaryButton
            label="Max"
            onPress={() => onBuy(item, max)}
            disabled={max <= 0}
            variant="secondary"
            accessibilityLabel={`Comprar maximo possivel de ${item.name}`}
          />
        </View>
        <View style={styles.cardActions}>
          <PrimaryButton
            label="Comprar"
            onPress={() => onBuy(item, quantity)}
            onLongPress={() => onBuy(item, Math.min(10, max))}
            disabled={max <= 0}
            style={styles.mainActionButton}
          />
          <PrimaryButton
            label="Vender"
            onPress={() => onSell(quantity)}
            disabled={boughtQuantity <= 0}
            variant="danger"
            style={styles.mainActionButton}
          />
        </View>
        <Text style={styles.license}>{item.image.source} - {item.image.license}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 28,
  },
  header: {
    paddingTop: 16,
    gap: 12,
  },
  eyebrow: {
    color: colors.lime,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  balance: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 44,
    fontWeight: "900",
  },
  compact: {
    color: colors.textMuted,
    fontSize: 15,
  },
  progressTrack: {
    height: 12,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.lime,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  source: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  toast: {
    color: colors.background,
    backgroundColor: colors.lime,
    padding: 10,
    borderRadius: 8,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  controlPanel: {
    gap: 10,
  },
  commandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  commandButton: {
    flexGrow: 1,
    flexBasis: "31%",
    minWidth: 108,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  commandButtonAccent: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  commandButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  commandText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 13,
    textAlign: "center",
    flexShrink: 1,
  },
  commandTextAccent: {
    color: colors.background,
  },
  searchWrap: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  search: {
    flex: 1,
    minHeight: 46,
    color: colors.text,
    fontSize: 16,
  },
  filtersPanel: {
    gap: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0a1324",
  },
  filterSection: {
    gap: 8,
  },
  filterTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  filterRail: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    minHeight: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipSelected: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  chipText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.background,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resultCount: {
    color: colors.textMuted,
    marginBottom: 6,
  },
  card: {
    gap: 12,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  cardWide: {
    flexDirection: "row",
  },
  cardCompact: {
    flexDirection: "column",
  },
  cardBody: {
    flex: 1,
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  itemName: {
    flex: 1,
    color: colors.text,
    fontWeight: "900",
    fontSize: 17,
  },
  typePill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  description: {
    color: colors.textMuted,
    lineHeight: 18,
  },
  price: {
    color: colors.lime,
    fontWeight: "900",
    fontSize: 18,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  quantityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  quantityInput: {
    minWidth: 70,
    flexGrow: 1,
    flexBasis: 74,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  mainActionButton: {
    flex: 1,
  },
  license: {
    color: colors.textMuted,
    fontSize: 10,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 40,
  },
});
