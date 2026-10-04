import { Text, View } from "react-native";
import { type LedgerRecord } from "@budget/contracts";
import { saveRecord } from "../../infrastructure/ledger";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
export function CategoryCard({ record: c, controller }: {
    record: Extract<LedgerRecord, {
        kind: "category";
    }>;
    controller: HouseholdBudgetController;
}) {
    const { setName, setEditing, run } = controller;
    return (<View style={styles.card}>
                <Text style={styles.heading}>
                  {c.name}
                  {c.archived ? " · Archived" : ""}
                </Text>
                <Button title="Rename" secondary onPress={() => {
            setEditing(c);
            setName(c.name);
        }}/>
                <Button title={c.archived ? "Restore" : "Archive"} secondary onPress={() => void run(async () => {
            await saveRecord({ ...c, archived: !c.archived });
        })}/>
              </View>);
}
