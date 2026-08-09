import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Tela nao encontrada" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Essa tela nao existe.</Text>
        <Link href="/" style={styles.link}>
          Voltar para Gastar
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: colors.lime,
    fontWeight: "800",
  },
});
