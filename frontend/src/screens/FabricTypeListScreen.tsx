import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFabricTypes } from '../api/fabricTypes';
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
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: types, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['fabricTypes'],
    queryFn: getFabricTypes,
  });

  const filtered = (types ?? []).filter((t) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return t.name_en.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
  });

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
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<View style={styles.centered}><Text>No fabric types found.</Text></View>}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('FabricsByType', { typeId: item.id, typeName: item.name })}>
            <Card.Content style={styles.cardRow}>
              <View style={styles.cardText}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall">{item.name_en}</Text>
              </View>
              <Text variant="titleLarge" style={styles.count}>{item.fabric_count}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar: { margin: 16, marginBottom: 8 },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardText: { flex: 1 },
  count: { marginLeft: 16, opacity: 0.6 },
});
