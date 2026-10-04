import { Text, View } from "react-native";
import { monthOffset, parseMoney, type LedgerRecord } from "@budget/contracts";
import { saveRecord } from "../../infrastructure/ledger";
import { allocationId } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { CategoryPicker } from "../categories/CategoryPicker";
export function AllocationForm({ controller }: {
    controller: HouseholdBudgetController;
}) {
    const { records, month, amount, setAmount, categoryId, setCategoryId, editing, budgetId, setBudgetId, run, categories, active, budgets, reset } = controller;
    return (<View style={styles.card}>
              <Text style={styles.heading}>
                {budgetId ? "Adjust allocation" : "Add allocation"}
              </Text>
              <CategoryPicker categories={editing ? categories : active} selectedId={categoryId} onSelect={id => { setCategoryId(id); setBudgetId(""); }}/>
              <Field label="Budget amount" value={amount} onChange={setAmount} numeric/>
              <Button title="Save allocation" onPress={() => void run(async () => {
            const category = categories.find((c) => c.id === categoryId);
            if (!category)
                throw new Error("Choose a category first.");
            const existing = budgets.find((b) => b.id === budgetId) ??
                budgets.find((b) => b.categoryId === categoryId);
            await saveRecord({
                id: existing?.id ?? (await allocationId(categoryId, month)),
                revision: existing?.revision ?? 0,
                kind: "budget",
                month,
                categoryId,
                label: existing?.label ?? category.name,
                amount: parseMoney(amount),
            });
            reset();
        })}/>
              <Button title="Copy previous month’s allocations" secondary onPress={() => void run(async () => {
            const previous = records.filter((r): r is Extract<LedgerRecord, {
                kind: "budget";
            }> => r.kind === "budget" &&
                r.month === monthOffset(month, -1));
            if (!previous.length)
                throw new Error("Previous month is not stored on this phone or has no allocations.");
            for (const b of previous)
                if (!budgets.some((current) => current.categoryId === b.categoryId) &&
                    active.some((c) => c.id === b.categoryId))
                    await saveRecord({
                        ...b,
                        id: await allocationId(b.categoryId, month),
                        revision: 0,
                        month,
                    });
        })}/>
            </View>);
}
