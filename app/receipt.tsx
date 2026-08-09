import { Share2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { summarizeGame } from "@/src/features/game/gameEngine";
import { shareReceiptPdf } from "@/src/services/sharing/receipt";
import { useSessionStore } from "@/src/stores/sessionStore";
import { colors } from "@/src/theme/theme";
import { formatCurrency, formatPercentageFromBasisPoints } from "@/src/utils/money";
import { formatDuration } from "@/src/utils/time";

export default function ReceiptScreen() {
  const profile = useSessionStore((state) => state.profile);
  const activeGame = useSessionStore((state) => state.activeGame);
  const summary = summarizeGame(activeGame);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.receipt}>
          <Text style={styles.logo}>Gaste como Musk</Text>
          <Text style={styles.muted}>Nota fiscal divertida - sem validade fiscal</Text>
          <View style={styles.divider} />
          <Text style={styles.line}>Apelido: {profile.nickname}</Text>
          <Text style={styles.line}>Partida: {summary.gameId}</Text>
          <Text style={styles.line}>Data: {new Date().toLocaleString("pt-BR")}</Text>
          <Text style={styles.line}>Fortuna inicial: {formatCurrency(activeGame.wealthSnapshot.initialWealthCents)}</Text>
          <Text style={styles.total}>Total gasto: {formatCurrency(summary.totalSpentCents)}</Text>
          <Text style={styles.line}>Saldo restante: {formatCurrency(summary.remainingBalanceCents)}</Text>
          <Text style={styles.line}>Percentual: {formatPercentageFromBasisPoints(summary.percentageSpentBasisPoints)}</Text>
          <Text style={styles.line}>Tempo ativo: {formatDuration(summary.activeDurationMs)}</Text>
          <Text style={styles.line}>Categoria favorita: {summary.mainCategory}</Text>
          <Text style={styles.line}>Item mais caro: {summary.mostExpensiveItemName ?? "Nenhum"}</Text>
          <View style={styles.divider} />
          {summary.boughtItems.slice(0, 20).map((item) => (
            <View key={item.itemId} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.subtotalCents)}</Text>
            </View>
          ))}
          {summary.boughtItems.length > 20 ? <Text style={styles.muted}>Versao resumida com os 20 primeiros itens.</Text> : null}
          <View style={styles.divider} />
          <Text style={styles.footer}>Simulacao ficticia - sem valor fiscal.</Text>
        </View>
        <PrimaryButton label="Compartilhar PDF" icon={Share2} onPress={() => shareReceiptPdf(profile, summary, activeGame.wealthSnapshot)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 20,
    gap: 16,
  },
  receipt: {
    backgroundColor: colors.surface,
    borderColor: colors.lime,
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    gap: 8,
  },
  logo: {
    color: colors.lime,
    fontSize: 26,
    fontWeight: "900",
  },
  muted: {
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  line: {
    color: colors.text,
    lineHeight: 21,
  },
  total: {
    color: colors.lime,
    fontWeight: "900",
    fontSize: 22,
  },
  itemRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  itemName: {
    color: colors.text,
    flex: 1,
  },
  itemPrice: {
    color: colors.text,
    fontWeight: "800",
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
