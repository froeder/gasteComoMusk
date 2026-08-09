import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { catalogImageAssets } from "@/src/data/catalogImageAssets";
import { colors } from "@/src/theme/theme";
import type { CatalogItem } from "@/src/types";

type ItemArtworkProps = {
  item: CatalogItem;
};

export function ItemArtwork({ item }: ItemArtworkProps) {
  const source = catalogImageAssets[item.id];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={item.image.alt}
      style={styles.wrap}
    >
      <Image source={source} style={styles.image} contentFit="cover" cachePolicy="memory-disk" transition={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 108,
    height: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
