import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFabrics, API_URL } from '../api/fabrics';
import { FabricWithImages } from '../types/fabric';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FabricList'>;

export default function FabricListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: fabrics, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['fabrics'],
    queryFn: getFabrics,
  });

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  if (isError) {
    return <View style={styles.centered}><Text>Failed to load fabrics.</Text></View>;
  }

  if (!fabrics || fabrics.length === 0) {
    return <View style={styles.centered}><Text>No fabrics yet. Add one!</Text></View>;
  }


  return (
    <FlatList
      data={fabrics}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshing={isRefetching}
      onRefresh={refetch}
      renderItem={({ item }) => <FabricCard fabric={item} onPress={() => navigation.navigate('FabricDetail', { id: item.id })} />}
    />
  );
}

function FabricCard({ fabric, onPress }: { fabric: FabricWithImages; onPress: () => void }) {
  const thumbnail = fabric.images[0];

  return (
    <Card style={styles.card} onPress={onPress}>
      {thumbnail && (
        <Card.Cover source={{ uri: `${API_URL.replace('/api/v1', '')}/${thumbnail.file_path}` }} />
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 4 },
  cardContent: { paddingTop: 8 },
});
