import { Text, View } from "react-native";
import { monthOffset } from "@budget/contracts";
import { styles } from "../../styles/budgetStyles";
import { Button } from "../ui/Button";
export function MonthSelector({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  return (
    <View style={styles.month}>
      <Button
        title="‹"
        secondary
        onPress={() => {
          onChange(monthOffset(month, -1));
        }}
      />
      <Text style={styles.heading}>{month}</Text>
      <Button
        title="›"
        secondary
        onPress={() => {
          onChange(monthOffset(month, 1));
        }}
      />
    </View>
  );
}
