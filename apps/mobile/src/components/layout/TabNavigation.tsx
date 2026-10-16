import { Pressable, Text, View } from "react-native";
import type { Tab } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
export function TabNavigation({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <View style={styles.chips}>
      {(["Overview", "Income", "Expenses", "Categories", "Settings"] as Tab[]).map((t) => (
        <Pressable
          key={t}
          onPress={() => {
            onChange(t);
          }}
          style={[styles.chip, tab === t && styles.selected]}
        >
          <Text style={{ color: tab === t ? "white" : "#146b55" }}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}
