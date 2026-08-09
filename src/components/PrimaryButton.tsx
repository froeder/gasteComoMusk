import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import type { LucideProps } from "lucide-react-native";

import { colors } from "@/src/theme/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: ComponentType<LucideProps>;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function PrimaryButton({
  label,
  onPress,
  onLongPress,
  disabled,
  variant = "primary",
  icon: Icon,
  style,
  accessibilityLabel,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {Icon ? <Icon size={18} color={variant === "primary" ? colors.background : colors.text} strokeWidth={2.4} /> : null}
      <Text style={[styles.label, variant === "primary" && styles.primaryLabel]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: "#321620",
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14,
  },
  primaryLabel: {
    color: colors.background,
  },
});
