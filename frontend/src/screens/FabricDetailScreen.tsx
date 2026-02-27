import { useState } from 'react';
import { ScrollView, Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Divider, Portal, Text } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFabricById, deleteFabric, getImageUrl } from '../api/fabrics';
import type { RootStackParamList } from '../../App';

type RouteProp = NativeStackScreenProps<RootStackParamList, 'FabricDetail'>['route'];

export default function FabricDetailScreen() {
  const { params } = useRoute<RouteProp>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { data: fabric, isLoading, isError } = useQuery({
    queryKey: ['fabric', params.id],
    queryFn: () => getFabricById(params.id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFabric(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      navigation.goBack();
    },
  });

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  if (isError || !fabric) {
    return <View style={styles.centered}><Text>Fabric not found.</Text></View>;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {fabric.images.map((img) => (
          <Image
            key={img.id}
            source={{ uri: getImageUrl(img.file_path) }}
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

        <Button
          mode="outlined"
          textColor="red"
          style={styles.deleteButton}
          onPress={() => setConfirmVisible(true)}
        >
          Delete fabric
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Delete fabric?</Dialog.Title>
          <Dialog.Content>
            <Text>This will permanently delete the fabric and all its images.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
            <Button
              textColor="red"
              loading={deleteMutation.isPending}
              onPress={() => deleteMutation.mutate()}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
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
  deleteButton: { marginTop: 24, borderColor: 'red' },
});
