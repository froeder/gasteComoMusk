import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Award, FileText, Play, Save, Share2 } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { StatCard } from "@/src/components/StatCard";
import { getUnlockedAchievements } from "@/src/constants/achievements";
import { summarizeGame } from "@/src/features/game/gameEngine";
import { saveProfile } from "@/src/services/firebase/repositories";
import { buildShareText, shareReceiptPdf } from "@/src/services/sharing/receipt";
import { useSessionStore } from "@/src/stores/sessionStore";
import { colors } from "@/src/theme/theme";
import { formatCompactCurrency, formatPercentageFromBasisPoints } from "@/src/utils/money";
import { formatDuration } from "@/src/utils/time";

const nicknameSchema = z.object({
  nickname: z.string().trim().min(3, "Use pelo menos 3 caracteres.").max(24, "Use ate 24 caracteres."),
});

type NicknameForm = z.infer<typeof nicknameSchema>;

export default function ProfileScreen() {
  const profile = useSessionStore((state) => state.profile);
  const activeGame = useSessionStore((state) => state.activeGame);
  const history = useSessionStore((state) => state.history);
  const updateNickname = useSessionStore((state) => state.updateNickname);
  const finish = useSessionStore((state) => state.finish);
  const newGame = useSessionStore((state) => state.newGame);
  const summary = summarizeGame(activeGame);
  const unlocked = getUnlockedAchievements(summary);

  const form = useForm<NicknameForm>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: profile.nickname },
  });

  async function onSubmit(values: NicknameForm) {
    updateNickname(values.nickname.trim());
    await saveProfile({ ...profile, nickname: values.nickname.trim() });
    Alert.alert("Perfil atualizado", "Seu apelido foi salvo localmente e sera sincronizado quando o Firebase estiver configurado.");
  }

  async function sharePdf() {
    const finalSummary = activeGame.status === "finished" ? summary : finish();
    await shareReceiptPdf(profile, finalSummary, activeGame.wealthSnapshot);
  }

  function copyTextFallback() {
    Alert.alert("Resumo", buildShareText(summary));
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.title}>{profile.nickname}</Text>
            <Text style={styles.muted}>ID: {profile.userId}</Text>
            <Text style={styles.muted}>Criado em {new Date(profile.createdAt).toLocaleDateString("pt-BR")}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Controller
            control={form.control}
            name="nickname"
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  accessibilityLabel="Editar apelido"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="Seu apelido"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
              </>
            )}
          />
          <PrimaryButton label="Salvar apelido" icon={Save} onPress={form.handleSubmit(onSubmit)} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Melhor gasto" value={formatCompactCurrency(profile.bestSpentCents)} accent />
          <StatCard label="Maior percentual" value={formatPercentageFromBasisPoints(profile.bestPercentageBasisPoints)} />
          <StatCard label="Partidas concluidas" value={String(profile.completedGames)} />
          <StatCard label="Itens comprados" value={String(profile.totalItemsBought)} />
          <StatCard label="Categoria favorita" value={profile.favoriteCategory} />
          <StatCard label="Tempo atual" value={formatDuration(summary.activeDurationMs)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo da partida atual</Text>
          <Text style={styles.muted}>Gasto: {formatCompactCurrency(summary.totalSpentCents)}</Text>
          <Text style={styles.muted}>Saldo: {formatCompactCurrency(summary.remainingBalanceCents)}</Text>
          <Text style={styles.muted}>Item mais caro: {summary.mostExpensiveItemName ?? "Nenhum"}</Text>
          <View style={styles.actions}>
            <PrimaryButton label="Recibo PDF" icon={Share2} onPress={sharePdf} />
            <Link href="/receipt" asChild>
              <PrimaryButton label="Ver recibo" icon={FileText} onPress={() => undefined} variant="secondary" />
            </Link>
          </View>
          <PrimaryButton label="Resumo textual" icon={FileText} onPress={copyTextFallback} variant="secondary" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Award size={18} color={colors.lime} /> Conquistas
          </Text>
          <View style={styles.badgeGrid}>
            {unlocked.map((achievement) => (
              <View key={achievement.id} style={styles.badge}>
                <Text style={styles.badgeTitle}>{achievement.title}</Text>
                <Text style={styles.badgeText}>{achievement.description}</Text>
              </View>
            ))}
            {unlocked.length === 0 ? <Text style={styles.muted}>Compre algo para liberar as primeiras conquistas.</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historico recente</Text>
          {history.slice(0, 5).map((item) => (
            <View key={item.gameId} style={styles.historyRow}>
              <Text style={styles.historyTitle}>{formatCompactCurrency(item.totalSpentCents)}</Text>
              <Text style={styles.muted}>
                {formatPercentageFromBasisPoints(item.percentageSpentBasisPoints)} - {item.totalUnits} itens
              </Text>
            </View>
          ))}
          {history.length === 0 ? <Text style={styles.muted}>Nenhuma partida finalizada ainda.</Text> : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Finalizar partida" icon={Award} onPress={finish} />
          <PrimaryButton label="Nova partida" icon={Play} onPress={newGame} variant="secondary" />
        </View>

        <Text style={styles.footer}>
          As compras sao ficticias. Valores sao estimativas para jogo e podem variar conforme mercado, metodologia, impostos e cotacao.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 20,
    gap: 18,
  },
  profileHeader: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.background,
    fontWeight: "900",
    fontSize: 24,
  },
  profileText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 32,
  },
  muted: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  form: {
    gap: 10,
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
  },
  error: {
    color: colors.danger,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  badgeGrid: {
    gap: 8,
  },
  badge: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badgeTitle: {
    color: colors.lime,
    fontWeight: "900",
  },
  badgeText: {
    color: colors.textMuted,
    marginTop: 4,
  },
  historyRow: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
