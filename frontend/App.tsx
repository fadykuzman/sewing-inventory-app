import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import AddFabricScreen from './src/screens/AddFabricScreen';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <AddFabricScreen />
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
