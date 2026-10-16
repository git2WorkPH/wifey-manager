import { IncomeCard } from "./IncomeCard";
import { IncomeForm } from "./IncomeForm";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
export function IncomePanel({ controller }: { controller: HouseholdBudgetController }) {
  const { income } = controller;
  return (
    <>
      <IncomeForm controller={controller} />
      {income.map((i) => (
        <IncomeCard key={i.id} record={i} controller={controller} />
      ))}
    </>
  );
}
