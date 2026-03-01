import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, Portal, Searchbar, Text, useTheme } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFabricTypes, patchFabricType } from '../api/fabricTypes';
import { FabricType } from '../types/fabric';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FabricTypeList'>;

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function FabricTypeListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [dialogType, setDialogType] = useState<FabricType | null>(null);

  const isSearching = debouncedSearch.length > 0;

  const { data: availableTypes, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['fabricTypes', { available: true }],
    queryFn: () => getFabricTypes({ available: true }),
  });

  const { data: allTypes } = useQuery({
    queryKey: ['fabricTypes', { available: undefined }],
    queryFn: () => getFabricTypes(),
    enabled: isSearching,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      patchFabricType(id, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabricTypes'] });
    },
  });

  const displayTypes = isSearching ? allTypes ?? [] : availableTypes ?? [];

  const filtered = displayTypes.filter((t) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return t.name_en.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
  });

  const handleLongPress = (item: FabricType) => {
    setDialogType(item);
  };

  const handleToggleConfirm = () => {
    if (!dialogType) return;
    toggleMutation.mutate({ id: dialogType.id, available: !dialogType.available });
    setDialogType(null);
  };

  const listHeader = (
    <Searchbar
      placeholder="Search fabric types..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      style={styles.searchbar}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {listHeader}
        <View style={styles.centered}><ActivityIndicator /></View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        {listHeader}
        <View style={styles.centered}><Text>Failed to load fabric types.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {listHeader}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<View style={styles.centered}><Text>No fabric types found.</Text></View>}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={[styles.card, !item.available && styles.cardHidden]}
            onPress={() => navigation.navigate('FabricsByType', { typeId: item.id, typeName: item.name })}
            onLongPress={() => handleLongPress(item)}
          >
            <Card.Content style={styles.cardRow}>
              <View style={styles.cardText}>
                <Text variant="titleMedium" style={!item.available ? { color: theme.colors.outline } : undefined}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={!item.available ? { color: theme.colors.outline } : undefined}>
                  {item.name_en}
                </Text>
              </View>
              <Text variant="titleLarge" style={[styles.count, !item.available && { color: theme.colors.outline }]}>
                {item.fabric_count}
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={!!dialogType} onDismiss={() => setDialogType(null)}>
          <Dialog.Title>{dialogType?.available ? 'Hide' : 'Show'} fabric type?</Dialog.Title>
          <Dialog.Content>
            <Text>
              {dialogType?.available
                ? `"${dialogType?.name}" will be hidden from the landing page. You can still find it via search.`
                : `"${dialogType?.name}" will be shown on the landing page again.`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogType(null)}>Cancel</Button>
            <Button onPress={handleToggleConfirm}>
              {dialogType?.available ? 'Hide' : 'Show'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar: { margin: 16, marginBottom: 8 },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 4 },
  cardHidden: { opacity: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardText: { flex: 1 },
  count: { marginLeft: 16, opacity: 0.6 },
});
