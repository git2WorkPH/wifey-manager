import { Alert, Text, View } from "react-native";
import { type LedgerRecord } from "@budget/contracts";
import { saveRecord } from "../../infrastructure/ledger";
import { money } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
export function ExpenseCard({
  record: e,
  controller,
}: {
  record: Extract<
    LedgerRecord,
    {
      kind: "expense";
    }
  >;
  controller: HouseholdBudgetController;
}) {
  const { setAmount, setNote, setDate, setCategoryId, setEditing, run, categories, budgets } =
    controller;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        {money(e.amount)} ·{" "}
        {budgets.find((b) => b.categoryId === e.categoryId)?.label ??
          categories.find((c) => c.id === e.categoryId)?.name}
      </Text>
      <Text style={styles.muted}>
        {e.date} {e.note}
      </Text>
      <Button
        title="Edit"
        secondary
        onPress={() => {
          setEditing(e);
          setCategoryId(e.categoryId);
          setDate(e.date);
          setAmount((e.amount / 100).toFixed(2));
          setNote(e.note);
        }}
      />
      <Button
        title="Remove expense"
        secondary
        onPress={() =>
          Alert.alert(
            "Remove expense?",
            "This expense will be excluded from totals. Its record is retained for synchronization.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: () =>
                  void run(async () => {
                    await saveRecord({ ...e, voided: true });
                  }),
              },
            ],
          )
        }
      />
    </View>
  );
}
