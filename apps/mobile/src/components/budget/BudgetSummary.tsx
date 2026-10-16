import { Text, View } from "react-native";
import { money } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
export function BudgetSummary({ controller }: { controller: HouseholdBudgetController }) {
  const { summary } = controller;
  return (
    <>
      <View style={styles.hero}>
        <Text style={{ color: "#c9e9dc" }}>LEFT IN YOUR BUDGET</Text>
        <Text style={styles.heroAmount}>{money(summary.remaining)}</Text>
        <Text style={{ color: "#c9e9dc" }}>
          Income {money(summary.income)} · Spent {money(summary.spent)}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Unallocated {money(summary.unallocated)}</Text>
        <Text style={styles.muted}>
          {summary.unallocated < 0
            ? "Your allocations exceed recorded income."
            : "Assign salary to the things that matter this month."}
        </Text>
      </View>
    </>
  );
}
