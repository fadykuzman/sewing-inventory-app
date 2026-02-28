import { FlatList, Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, FAB, Icon, Text } from 'react-native-paper';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { getFabricsPaginated, getImageUrl } from '../api/fabrics';
import { FabricWithImages } from '../types/fabric';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FabricsByType'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'FabricsByType'>;

const PAGE_SIZE = 20;

export default function FabricsByTypeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { typeId, typeName } = route.params;

  const { data, isLoading, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['fabrics', 'byType', typeId],
    queryFn: ({ pageParam = 0 }) => getFabricsPaginated(PAGE_SIZE, pageParam, undefined, typeId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
  });

  const fabrics = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <View style={styles.centered}><ActivityIndicator /></View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}><Text>Failed to load fabrics.</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={fabrics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<View style={styles.centered}><Text>No fabrics yet.</Text></View>}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        renderItem={({ item }) => (
          <FabricCard fabric={item} onPress={() => navigation.navigate('FabricDetail', { id: item.id })} />
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddFabric', {
          preselectedTypeId: typeId,
          preselectedTypeName: typeName,
        })}
      />
    </View>
  );
}

function FabricCard({ fabric, onPress }: { fabric: FabricWithImages; onPress: () => void }) {
  const thumbnail = fabric.images[0];

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardRow}>
        <View style={styles.textContent}>
          <Text variant="titleMedium">{fabric.name}</Text>
          <Text variant="bodySmall">{fabric.amount_meters} m</Text>
        </View>
        {thumbnail ? (
          <Image
            source={{ uri: getImageUrl(thumbnail.file_path) }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <Icon source="image-outline" size={32} color="#999" />
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80, gap: 12 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  card: { marginBottom: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  textContent: { flex: 1, gap: 10 },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },
  placeholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
});
