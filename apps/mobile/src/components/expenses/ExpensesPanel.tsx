import { ExpenseCard } from "./ExpenseCard";
import { ExpenseForm } from "./ExpenseForm";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
export function ExpensesPanel({ controller }: {
    controller: HouseholdBudgetController;
}) {
    const { expenses } = controller;
    return (<>
            <ExpenseForm controller={controller}/>
            {expenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((e) => (<ExpenseCard key={e.id} record={e} controller={controller}/>))}
          </>);
}
