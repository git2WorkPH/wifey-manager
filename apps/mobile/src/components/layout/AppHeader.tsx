import { Text } from "react-native";
import { styles } from "../../styles/budgetStyles";
export function AppHeader({ pending, status }: {
    pending: number;
    status: string;
}) {
    return <>
        <Text style={styles.eyebrow}>YOUR HOUSEHOLD, TOGETHER</Text>
        <Text style={styles.title}>Our Budget</Text>
        <Text style={styles.muted}>
          {pending
            ? `${pending} change${pending === 1 ? "" : "s"} waiting to sync`
            : status}
        </Text>
  </>;
}
