import { Text, View } from "react-native";
import { type LedgerRecord } from "@budget/contracts";
import { money } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
export function AllocationCard({
  record: b,
  spent,
  controller,
}: {
  record: Extract<
    LedgerRecord,
    {
      kind: "budget";
    }
  >;
  spent: number;
  controller: HouseholdBudgetController;
}) {
  const { setAmount, setCategoryId, setBudgetId } = controller;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{b.label}</Text>
      <Text style={styles.muted}>
        Budget {money(b.amount)} · Spent {money(spent)}
      </Text>
      <Text style={[styles.balance, { color: b.amount - spent < 0 ? "#b44238" : "#146b55" }]}>
        {money(b.amount - spent)} remaining
      </Text>
      <Button
        title="Adjust allocation"
        secondary
        onPress={() => {
          setBudgetId(b.id);
          setCategoryId(b.categoryId);
          setAmount((b.amount / 100).toFixed(2));
        }}
      />
    </View>
  );
}
