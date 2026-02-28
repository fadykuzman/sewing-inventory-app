import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Searchbar, Text } from 'react-native-paper';
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

  const { data: types, isLoading, isError } = useQuery({
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
        renderItem={({ item }) => (
          <List.Item
            title={item.name_en}
            description={item.name}
            onPress={() => navigation.navigate('FabricsByType', { typeId: item.id, typeName: item.name_en })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar: { margin: 16, marginBottom: 8 },
});
