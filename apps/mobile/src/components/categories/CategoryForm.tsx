import { Text, View } from "react-native";
import { saveRecord } from "../../infrastructure/ledger";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
export function CategoryForm({ controller }: { controller: HouseholdBudgetController }) {
  const { name, setName, editing, run, reset, base } = controller;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{editing ? "Rename category" : "Create a category"}</Text>
      <Field label="Category name" value={name} onChange={setName} />
      <Button
        title="Save category"
        onPress={() =>
          void run(async () => {
            await saveRecord({
              ...base(),
              kind: "category",
              name,
              archived: editing?.kind === "category" ? editing.archived : false,
            });
            reset();
          })
        }
      />
    </View>
  );
}
