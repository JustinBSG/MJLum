import { SvgXml } from "react-native-svg";
import { View } from "react-native";
import { mahjongMark } from "@/constants/brand";

export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <SvgXml xml={mahjongMark} width={size} height={size} />
    </View>
  );
}
