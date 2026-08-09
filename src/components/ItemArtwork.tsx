import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { getCategoryColor } from "@/src/data/catalog";
import { colors } from "@/src/theme/theme";
import type { CatalogItem } from "@/src/types";

type ItemArtworkProps = {
  item: CatalogItem;
};

export function ItemArtwork({ item }: ItemArtworkProps) {
  const categoryColor = getCategoryColor(item.category);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={item.image.alt}
      style={[styles.wrap, { borderColor: categoryColor }]}
    >
      <View style={[styles.planet, { backgroundColor: categoryColor }]} />
      <Image source={require("@/assets/images/icon.png")} style={styles.image} contentFit="contain" cachePolicy="memory-disk" />
      <Text style={styles.initials}>{item.name.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 84,
    height: 84,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  planet: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    opacity: 0.18,
  },
  image: {
    width: 48,
    height: 48,
    opacity: 0.4,
  },
  initials: {
    position: "absolute",
    bottom: 8,
    right: 8,
    color: colors.text,
    fontWeight: "800",
    fontSize: 13,
  },
});
