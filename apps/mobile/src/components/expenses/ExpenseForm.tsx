import { Text, View } from "react-native";
import { parseMoney } from "@budget/contracts";
import { saveRecord } from "../../infrastructure/ledger";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { CategoryPicker } from "../categories/CategoryPicker";
export function ExpenseForm({ controller }: {
    controller: HouseholdBudgetController;
}) {
    const { month, amount, setAmount, note, setNote, date, setDate, categoryId, setCategoryId, editing, setBudgetId, run, categories, active, reset, base } = controller;
    return (<View style={styles.card}>
              <Text style={styles.heading}>
                {editing ? "Edit expense" : "Add expense"}
              </Text>
              <CategoryPicker categories={editing ? categories : active} selectedId={categoryId} onSelect={id => { setCategoryId(id); setBudgetId(""); }}/>
              <Field label="Amount" value={amount} onChange={setAmount} numeric/>
              <Field label="Date (YYYY-MM-DD)" value={date} onChange={setDate}/>
              <Field label="Note" value={note} onChange={setNote}/>
              <Button title="Save expense" onPress={() => void run(async () => {
            if (!categoryId)
                throw new Error("Choose a category first.");
            if (date.slice(0, 7) !== month)
                throw new Error("Expense date must be in the selected month.");
            await saveRecord({
                ...base(),
                kind: "expense",
                month,
                categoryId,
                date,
                amount: parseMoney(amount),
                note,
                voided: false,
            });
            reset();
        })}/>
            </View>);
}
