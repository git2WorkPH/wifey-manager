import { AllocationForm } from "./AllocationForm";
import { AllocationCard } from "./AllocationCard";
import { BudgetSummary } from "./BudgetSummary";
import { Text } from "react-native";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
export function OverviewPanel({ controller }: {
    controller: HouseholdBudgetController;
}) {
    const { budgets, expenses } = controller;
    return (<>
            <BudgetSummary controller={controller}/>
            <Text style={styles.heading}>Monthly allocations</Text>
            {!budgets.length && (<Text style={styles.muted}>
                Create categories, then allocate your salary below.
              </Text>)}
            {budgets.map((b) => {
            const spent = expenses
                .filter((e) => e.categoryId === b.categoryId)
                .reduce((sum, e) => sum + e.amount, 0);
            return (<AllocationCard key={b.id} record={b} spent={spent} controller={controller}/>);
        })}
            <AllocationForm controller={controller}/>
          </>);
}
