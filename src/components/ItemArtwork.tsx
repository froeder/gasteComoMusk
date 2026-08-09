import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { catalogImageAssets } from "@/src/data/catalogImageAssets";
import { colors } from "@/src/theme/theme";
import type { CatalogItem } from "@/src/types";

type ItemArtworkProps = {
  item: CatalogItem;
  variant?: "wide" | "compact";
};

export function ItemArtwork({ item, variant = "wide" }: ItemArtworkProps) {
  const source = catalogImageAssets[item.id];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={item.image.alt}
      style={[styles.wrap, variant === "compact" ? styles.compactWrap : styles.wideWrap]}
    >
      <Image source={source} style={styles.image} contentFit="contain" cachePolicy="memory-disk" transition={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  wideWrap: {
    width: 132,
    aspectRatio: 4 / 3,
  },
  compactWrap: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
