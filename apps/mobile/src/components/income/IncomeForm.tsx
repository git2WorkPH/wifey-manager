import { Text, View } from "react-native";
import { parseMoney } from "@budget/contracts";
import { saveRecord } from "../../infrastructure/ledger";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
export function IncomeForm({ controller }: { controller: HouseholdBudgetController }) {
  const { month, amount, setAmount, note, setNote, date, setDate, editing, run, reset, base } =
    controller;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Record salary / income</Text>
      <Field label="Received date (YYYY-MM-DD)" value={date} onChange={setDate} />
      <Field label="Amount" value={amount} onChange={setAmount} numeric />
      <Field label="Description" value={note} onChange={setNote} />
      <Button
        title={editing ? "Save changes" : "Add income"}
        onPress={() =>
          void run(async () => {
            await saveRecord({
              ...base(),
              kind: "income",
              month,
              date,
              amount: parseMoney(amount),
              note,
            });
            reset();
          })
        }
      />
    </View>
  );
}
