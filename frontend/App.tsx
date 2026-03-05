import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FabricTypeListScreen from './src/screens/FabricTypeListScreen';
import FabricsByTypeScreen from './src/screens/FabricsByTypeScreen';
import FabricDetailScreen from './src/screens/FabricDetailScreen';
import AddFabricScreen from './src/screens/AddFabricScreen';
import EditFabricScreen from './src/screens/EditFabricScreen';
import LoginScreen from './src/screens/LoginScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { logger } from './src/logger';

const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  logger.error('Unhandled error', {
    error: error?.message,
    stack: error?.stack,
    isFatal,
  });
  defaultHandler(error, isFatal);
});

export type RootStackParamList = {
  FabricTypeList: undefined;
  FabricsByType: { typeId: number; typeName: string };
  FabricDetail: { id: string };
  AddFabric: { preselectedTypeId?: number; preselectedTypeName?: string } | undefined;
  EditFabric: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer theme={useNavigationTheme()}>
      <Stack.Navigator initialRouteName="FabricTypeList">
        <Stack.Screen
          name="FabricTypeList"
          component={FabricTypeListScreen}
          options={{ title: 'Fabric Types' }}
        />
        <Stack.Screen
          name="FabricsByType"
          component={FabricsByTypeScreen}
          options={({ route }) => ({
            title: route.params.typeName,
          })}
        />
        <Stack.Screen name="FabricDetail" component={FabricDetailScreen} options={{ title: 'Fabric Details' }} />
        <Stack.Screen name="AddFabric" component={AddFabricScreen} options={{ title: 'Add Fabric' }} />
        <Stack.Screen name="EditFabric" component={EditFabricScreen} options={{ title: 'Edit Fabric' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function useNavigationTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;
}

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
          <StatusBar style="auto" />
        </PaperProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
