import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import FabricListScreen from './src/screens/FabricListScreen';
import FabricDetailScreen from './src/screens/FabricDetailScreen';
import AddFabricScreen from './src/screens/AddFabricScreen';
import EditFabricScreen from './src/screens/EditFabricScreen';

export type RootStackParamList = {
  FabricList: undefined;
  FabricDetail: { id: string };
  AddFabric: undefined;
  EditFabric: { id: string };
};

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text variant="labelLarge" style={{ color: '#6200ee' }}>+ Add</Text>
    </TouchableOpacity>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="FabricList">
            <Stack.Screen
              name="FabricList"
              component={FabricListScreen}
              options={({ navigation }) => ({
                title: 'My Fabrics',
                headerRight: () => (
                  <AddButton onPress={() => navigation.navigate('AddFabric')} />
                ),
              })}
            />
            <Stack.Screen name="FabricDetail" component={FabricDetailScreen} options={{ title: 'Fabric Details' }} />
            <Stack.Screen name="AddFabric" component={AddFabricScreen} options={{ title: 'Add Fabric' }} />
            <Stack.Screen name="EditFabric" component={EditFabricScreen} options={{ title: 'Edit Fabric' }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
