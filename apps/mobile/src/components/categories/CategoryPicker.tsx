import { Pressable, Text, View } from "react-native";
import type { LedgerRecord } from "@budget/contracts";
import { styles } from "../../styles/budgetStyles";
type Category = Extract<
  LedgerRecord,
  {
    kind: "category";
  }
>;
export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {categories.map((c) => (
        <Pressable
          key={c.id}
          style={[styles.chip, selectedId === c.id && styles.selected]}
          onPress={() => {
            onSelect(c.id);
          }}
        >
          <Text style={{ color: selectedId === c.id ? "white" : "#146b55" }}>
            {c.name}
            {c.archived ? " (archived)" : ""}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
