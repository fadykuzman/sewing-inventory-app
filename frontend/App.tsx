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
import { ViewerBanner } from './src/components/ViewerBanner';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ViewerProvider, useViewer } from './src/context/ViewerContext';
import { ShareButton } from './src/components/ShareButton';
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
  const { isViewer } = useViewer();
  const navigationTheme = useNavigationTheme();
  const shareButton = !isViewer ? () => <ShareButton /> : undefined;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user && !isViewer) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ViewerBanner />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator initialRouteName="FabricTypeList">
        <Stack.Screen
          name="FabricTypeList"
          component={FabricTypeListScreen}
          options={{ title: 'Fabric Types', headerRight: shareButton }}
        />
        <Stack.Screen
          name="FabricsByType"
          component={FabricsByTypeScreen}
          options={({ route }) => ({
            title: route.params.typeName,
            headerRight: shareButton,
          })}
        />
        <Stack.Screen name="FabricDetail" component={FabricDetailScreen} options={{ title: 'Fabric Details', headerRight: shareButton }} />
        <Stack.Screen name="AddFabric" component={AddFabricScreen} options={{ title: 'Add Fabric' }} />
        <Stack.Screen name="EditFabric" component={EditFabricScreen} options={{ title: 'Edit Fabric' }} />
      </Stack.Navigator>
      </NavigationContainer>
    </View>
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
      <ViewerProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
            <StatusBar style="auto" />
          </PaperProvider>
        </QueryClientProvider>
      </ViewerProvider>
    </AuthProvider>
  );
}
