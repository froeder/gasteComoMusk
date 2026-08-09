import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/theme";

type StatCardProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && styles.accent]} numberOfLines={2} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  accent: {
    color: colors.lime,
  },
});
