import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import FabricTypeListScreen from './src/screens/FabricTypeListScreen';
import FabricsByTypeScreen from './src/screens/FabricsByTypeScreen';
import FabricDetailScreen from './src/screens/FabricDetailScreen';
import AddFabricScreen from './src/screens/AddFabricScreen';
import EditFabricScreen from './src/screens/EditFabricScreen';

export type RootStackParamList = {
  FabricTypeList: undefined;
  FabricsByType: { typeId: number; typeName: string };
  FabricDetail: { id: string };
  AddFabric: { preselectedTypeId?: number; preselectedTypeName?: string } | undefined;
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
          <Stack.Navigator initialRouteName="FabricTypeList">
            <Stack.Screen
              name="FabricTypeList"
              component={FabricTypeListScreen}
              options={{ title: 'Fabric Types' }}
            />
            <Stack.Screen
              name="FabricsByType"
              component={FabricsByTypeScreen}
              options={({ route, navigation }) => ({
                title: route.params.typeName,
                headerRight: () => (
                  <AddButton onPress={() => navigation.navigate('AddFabric', {
                    preselectedTypeId: route.params.typeId,
                    preselectedTypeName: route.params.typeName,
                  })} />
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
