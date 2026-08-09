import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Medal, RefreshCw, Send } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { validateRankingSubmission } from "@/src/features/ranking/validation";
import { fetchLeaderboard, publishLeaderboardEntry } from "@/src/services/firebase/repositories";
import { useSessionStore } from "@/src/stores/sessionStore";
import { colors } from "@/src/theme/theme";
import type { LeaderboardEntry } from "@/src/types";
import { formatCompactCurrency, formatPercentageFromBasisPoints } from "@/src/utils/money";
import { formatDuration } from "@/src/utils/time";

const mockEntries: LeaderboardEntry[] = [
  {
    id: "mock-1",
    userId: "mock-1",
    nickname: "Orbital",
    avatarColor: "#8cff4f",
    initials: "OR",
    totalSpentCents: "210000000000000",
    percentageSpentBasisPoints: 9668,
    activeDurationMs: 296000,
    createdAt: "2026-08-09T10:00:00.000Z",
    itemCount: 83,
    mainCategory: "Espaco",
  },
  {
    id: "mock-2",
    userId: "mock-2",
    nickname: "Pix Bilionario",
    avatarColor: "#60e6ff",
    initials: "PB",
    totalSpentCents: "180000000000000",
    percentageSpentBasisPoints: 8287,
    activeDurationMs: 480000,
    createdAt: "2026-08-08T18:00:00.000Z",
    itemCount: 410,
    mainCategory: "Impacto social",
  },
];

export default function RankingScreen() {
  const queryClient = useQueryClient();
  const activeGame = useSessionStore((state) => state.activeGame);
  const profile = useSessionStore((state) => state.profile);
  const [message, setMessage] = useState<string | null>(null);

  const ranking = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: async () => {
      const remote = await fetchLeaderboard();
      return remote.length > 0 ? remote : mockEntries;
    },
  });

  const entries = useMemo(
    () =>
      [...(ranking.data ?? [])].sort((left, right) => Number(BigInt(right.totalSpentCents) - BigInt(left.totalSpentCents))).slice(0, 50),
    [ranking.data],
  );

  async function publishCurrentGame() {
    const validation = validateRankingSubmission(activeGame, profile);
    if (!validation.ok) {
      setMessage(validation.reason);
      return;
    }

    await publishLeaderboardEntry(validation.entry);
    setMessage("Resultado enviado para o ranking.");
    await queryClient.invalidateQueries({ queryKey: ["leaderboard", "global"] });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>Global, semanal e mensal usam a mesma base no MVP. A arquitetura ja separa os periodos no Firebase.</Text>
        <View style={styles.actions}>
          <PrimaryButton label="Atualizar" icon={RefreshCw} onPress={() => queryClient.invalidateQueries({ queryKey: ["leaderboard", "global"] })} />
          <PrimaryButton label="Publicar" icon={Send} onPress={publishCurrentGame} variant="secondary" />
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl tintColor={colors.lime} refreshing={ranking.isFetching} onRefresh={ranking.refetch} />}
        ListEmptyComponent={<Text style={styles.empty}>{ranking.isError ? "Nao foi possivel carregar o ranking." : "Ranking vazio."}</Text>}
        renderItem={({ item, index }) => (
          <View style={[styles.entry, index < 3 && styles.topEntry]}>
            <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.entryBody}>
              <Text style={styles.nickname}>
                {index < 3 ? <Medal size={16} color={colors.lime} /> : null} #{index + 1} {item.nickname}
              </Text>
              <Text style={styles.meta}>
                {formatCompactCurrency(item.totalSpentCents)} - {formatPercentageFromBasisPoints(item.percentageSpentBasisPoints)} -{" "}
                {formatDuration(item.activeDurationMs)}
              </Text>
              <Text style={styles.meta}>
                {item.itemCount} itens - {item.mainCategory} - {new Date(item.createdAt).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  message: {
    color: colors.lime,
    fontWeight: "800",
  },
  list: {
    paddingVertical: 16,
    gap: 10,
  },
  entry: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  topEntry: {
    borderColor: colors.lime,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.background,
    fontWeight: "900",
  },
  entryBody: {
    flex: 1,
  },
  nickname: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 32,
  },
});
