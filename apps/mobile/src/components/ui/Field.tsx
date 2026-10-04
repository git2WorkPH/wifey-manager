import { Text, TextInput, View } from "react-native";
import { styles } from "../../styles/budgetStyles";
export function Field({ label, value, onChange, numeric = false, secret = false, }: {
    label: string;
    value: string;
    onChange: (s: string) => void;
    numeric?: boolean;
    secret?: boolean;
}) {
    return (<View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} style={styles.input} value={value} onChangeText={onChange} keyboardType={numeric ? "decimal-pad" : "default"} secureTextEntry={secret} autoCapitalize="none"/>
    </View>);
}
