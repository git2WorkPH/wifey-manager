import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
export function CategoriesPanel({ controller }: { controller: HouseholdBudgetController }) {
  const { categories } = controller;
  return (
    <>
      <CategoryForm controller={controller} />
      {categories.map((c) => (
        <CategoryCard key={c.id} record={c} controller={controller} />
      ))}
    </>
  );
}
