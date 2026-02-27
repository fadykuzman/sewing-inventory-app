import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Searchbar, Text } from 'react-native-paper';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFabricsPaginated, getImageUrl } from '../api/fabrics';
import { FabricWithImages } from '../types/fabric';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FabricList'>;

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function FabricListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const PAGE_SIZE = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['fabrics', debouncedSearch],
    queryFn: ({ pageParam = 0 }) => getFabricsPaginated(PAGE_SIZE, pageParam, debouncedSearch || undefined),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    }
  });

  const fabrics = data?.pages.flat() ?? [];

  const listHeader = (
    <Searchbar
      placeholder="Search fabrics..."
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
        <View style={styles.centered}><Text>Failed to load fabrics.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {listHeader}
      <FlatList
        data={fabrics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<View style={styles.centered}><Text>No fabrics found.</Text></View>}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        renderItem={({ item }) => <FabricCard fabric={item} onPress={() => navigation.navigate('FabricDetail', { id: item.id })} />}
      />
    </View>
  );
}

function FabricCard({ fabric, onPress }: { fabric: FabricWithImages; onPress: () => void }) {
  const thumbnail = fabric.images[0];

  return (
    <Card style={styles.card} onPress={onPress}>
      {thumbnail && (
        <Card.Cover source={{ uri: getImageUrl(thumbnail.file_path) }} />
      )}
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium">{fabric.type}</Text>
        {fabric.color && <Text variant="bodySmall">{fabric.color}</Text>}
        <Text variant="bodySmall">{fabric.amount_meters} m</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar: { margin: 16, marginBottom: 8 },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 4 },
  cardContent: { paddingTop: 8 },
});
