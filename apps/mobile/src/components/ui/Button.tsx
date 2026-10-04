import { Pressable, Text } from "react-native";
import { styles } from "../../styles/budgetStyles";
export function Button({ title, onPress, secondary = false, }: {
    title: string;
    onPress: () => void;
    secondary?: boolean;
}) {
    return (<Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, secondary && styles.secondary]}>
      <Text style={[styles.buttonText, secondary && { color: "#146b55" }]}>
        {title}
      </Text>
    </Pressable>);
}
