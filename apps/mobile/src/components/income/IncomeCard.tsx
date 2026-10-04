import { Text, View } from "react-native";
import { type LedgerRecord } from "@budget/contracts";
import { money } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
export function IncomeCard({ record: i, controller }: {
    record: Extract<LedgerRecord, {
        kind: "income";
    }>;
    controller: HouseholdBudgetController;
}) {
    const { setAmount, setNote, setDate, setEditing } = controller;
    return (<View style={styles.card}>
                <Text style={styles.heading}>{money(i.amount)}</Text>
                <Text>
                  {i.date} · {i.note || "Income"}
                </Text>
                <Button title="Edit" secondary onPress={() => {
            setEditing(i);
            setDate(i.date);
            setAmount((i.amount / 100).toFixed(2));
            setNote(i.note);
        }}/>
              </View>);
}
