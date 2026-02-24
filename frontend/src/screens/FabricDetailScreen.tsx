import { ScrollView, Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFabricById, API_URL } from '../api/fabrics';
import type { RootStackParamList } from '../../App';

type RouteProp = NativeStackScreenProps<RootStackParamList, 'FabricDetail'>['route'];

export default function FabricDetailScreen() {
  const { params } = useRoute<RouteProp>();
  const { data: fabric, isLoading, isError } = useQuery({
    queryKey: ['fabric', params.id],
    queryFn: () => getFabricById(params.id),
  });

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  if (isError || !fabric) {
    return <View style={styles.centered}><Text>Fabric not found.</Text></View>;
  }

  const baseUrl = API_URL.replace('/api/v1', '');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {fabric.images.map((img) => (
        <Image
          key={img.id}
          source={{ uri: `${baseUrl}/${img.file_path}` }}
          style={styles.image}
          resizeMode="cover"
        />
      ))}

      <Text variant="headlineSmall" style={styles.title}>{fabric.type}</Text>
      <Divider style={styles.divider} />

      <Field label="Amount" value={`${fabric.amount_meters} m`} />
      {fabric.color && <Field label="Color" value={fabric.color} />}
      {fabric.pattern && <Field label="Pattern" value={fabric.pattern} />}
      {fabric.label && <Field label="Brand" value={fabric.label} />}
      {fabric.purchase_location && <Field label="Purchased at" value={fabric.purchase_location} />}
      {fabric.cost != null && <Field label="Cost" value={`${fabric.cost}`} />}
      {fabric.project_ideas && <Field label="Project ideas" value={fabric.project_ideas} />}
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text variant="labelMedium" style={styles.label}>{label}</Text>
      <Text variant="bodyMedium">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  image: { width: '100%', height: 220, borderRadius: 8, marginBottom: 12 },
  title: { marginBottom: 8 },
  divider: { marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { opacity: 0.6, marginBottom: 2 },
});
