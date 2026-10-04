import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BudgetScreen } from './src/screens/BudgetScreen';
export default function App() { return <SafeAreaProvider><BudgetScreen /></SafeAreaProvider>; }
