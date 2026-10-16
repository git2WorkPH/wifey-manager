import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHouseholdBudget } from "../hooks/useHouseholdBudget";
import { styles } from "../styles/budgetStyles";
import { AppHeader } from "../components/layout/AppHeader";
import { MonthSelector } from "../components/layout/MonthSelector";
import { TabNavigation } from "../components/layout/TabNavigation";
import { OverviewPanel } from "../components/budget/OverviewPanel";
import { IncomePanel } from "../components/income/IncomePanel";
import { ExpensesPanel } from "../components/expenses/ExpensesPanel";
import { CategoriesPanel } from "../components/categories/CategoriesPanel";
import { SettingsPanel } from "../components/settings/SettingsPanel";
export function BudgetScreen() {
  const controller = useHouseholdBudget();
  if (controller.loading)
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppHeader pending={controller.pending} status={controller.status} />
        <MonthSelector
          month={controller.month}
          onChange={(month) => {
            controller.reset();
            controller.setMonth(month);
          }}
        />
        <TabNavigation
          tab={controller.tab}
          onChange={(tab) => {
            controller.reset();
            controller.setTab(tab);
          }}
        />
        {controller.working && <ActivityIndicator color="#146b55" />}
        {controller.tab === "Overview" && <OverviewPanel controller={controller} />}
        {controller.tab === "Income" && <IncomePanel controller={controller} />}
        {controller.tab === "Expenses" && <ExpensesPanel controller={controller} />}
        {controller.tab === "Categories" && <CategoriesPanel controller={controller} />}
        {controller.tab === "Settings" && <SettingsPanel controller={controller} />}
        <Text style={styles.footer}>Plan with intention. Spend with clarity.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
