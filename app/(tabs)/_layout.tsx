import { ChartNoAxesColumnIncreasing, CircleUserRound, WalletCards } from "lucide-react-native";
import { Tabs } from "expo-router";

import { colors } from "@/src/theme/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Gastar",
          tabBarIcon: ({ color }) => <WalletCards color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color }) => <ChartNoAxesColumnIncreasing color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <CircleUserRound color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
