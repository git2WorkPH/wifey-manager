import { Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { sync } from "../../infrastructure/ledger";
import { today } from "../../utils/budget";
import { styles } from "../../styles/budgetStyles";
import type { HouseholdBudgetController } from "../../hooks/useHouseholdBudget";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
export function SettingsPanel({ controller }: { controller: HouseholdBudgetController }) {
  const { url, setUrl, token, setToken, setStatus, run } = controller;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Your computer server</Text>
      <Text style={styles.muted}>
        Use your computer’s network address, for example http://192.168.1.20:3001. Keep your phone
        on the same Wi-Fi. Sync is manual in this first version.
      </Text>
      <Field label="Server URL" value={url} onChange={setUrl} />
      <Field label="Household secret" value={token} onChange={setToken} secret />
      <Button
        title="Save connection"
        onPress={() =>
          void run(async () => {
            await SecureStore.setItemAsync("server-url", url);
            await SecureStore.setItemAsync("server-token", token);
            setStatus("Connection saved");
          })
        }
      />
      <Button
        title="Sync now"
        onPress={() =>
          void run(async () => {
            await sync(url, token, today().slice(0, 7));
            setStatus("Synced with your computer");
          })
        }
      />
      <Text style={styles.muted}>
        Currency: AUD (provisional). Your computer retains history. After successful sync, this
        phone keeps the current month and two prior months, plus future entries. Older pending
        changes are uploaded before pruning.
      </Text>
    </View>
  );
}
