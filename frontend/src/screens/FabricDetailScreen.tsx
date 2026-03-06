import { useState } from 'react';
import { RefreshControl, ScrollView, Image, StyleSheet, View, Pressable } from 'react-native';
import { ActivityIndicator, Button, Dialog, Divider, Portal, Text, useTheme } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFabricById, deleteFabric, getImageUrl } from '../api/fabrics';
import { useViewer } from '../context/ViewerContext';
import type { RootStackParamList } from '../../App';

type RouteProp = NativeStackScreenProps<RootStackParamList, 'FabricDetail'>['route'];

export default function FabricDetailScreen() {
  const theme = useTheme();
  const { params } = useRoute<RouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { isViewer } = useViewer();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: fabric, isLoading, isError, isRefetching, refetch } = useQuery({
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
      <View style={[styles.stickyHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
        <Text variant="headlineSmall" style={styles.stickyTitle}>
          {fabric.fabric_type_name ?? ''}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {fabric.materials.length > 0 && (
          <Field
            label="Composition"
            value={fabric.materials.map(m => `${m.percentage}% ${m.material_name} (${m.material_name_en})`).join(', ')}
          />
        )}
        <Field label="Amount" value={`${fabric.amount_meters} m`} />
        {fabric.color && <Field label="Color" value={fabric.color} />}
        {fabric.pattern && <Field label="Pattern" value={fabric.pattern} />}
        {fabric.label && <Field label="Brand" value={fabric.label} />}
        {fabric.purchase_location && <Field label="Purchased at" value={fabric.purchase_location} />}
        {fabric.cost != null && <Field label="Cost per meter" value={`${fabric.cost} €/m`} />}
        {fabric.project_ideas && <Field label="Project ideas" value={fabric.project_ideas} />}

        <Divider style={styles.divider} />

        {fabric.images.length > 0 && (
          <Image
            source={{ uri: getImageUrl(fabric.images[selectedImageIndex].file_path) }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}

        {fabric.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
            {fabric.images.map((img, index) => (
              <Pressable key={img.id} onPress={() => setSelectedImageIndex(index)}>
                <Image
                  source={{ uri: getImageUrl(img.file_path) }}
                  style={[
                    styles.thumbnail,
                    index === selectedImageIndex && { borderColor: theme.colors.primary },
                  ]}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {!isViewer && (
          <>
            <Button
              mode="contained"
              style={styles.editButton}
              onPress={() => navigation.navigate('EditFabric', { id: params.id })}
            >
              Edit fabric
            </Button>

            <Button
              mode="outlined"
              textColor={theme.colors.error}
              style={[styles.deleteButton, { borderColor: theme.colors.error }]}
              onPress={() => setConfirmVisible(true)}
            >
              Delete fabric
            </Button>
          </>
        )}
      </ScrollView>

      {!isViewer && (
        <Portal>
          <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
            <Dialog.Title>Delete fabric?</Dialog.Title>
            <Dialog.Content>
              <Text>This will permanently delete the fabric and all its images.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
              <Button
                textColor={theme.colors.error}
                loading={deleteMutation.isPending}
                onPress={() => deleteMutation.mutate()}
              >
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
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
  stickyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
  },
  stickyTitle: {
    fontWeight: 'bold',
  },
  divider: { marginVertical: 12 },
  field: { marginBottom: 12 },
  label: { opacity: 0.6, marginBottom: 2 },
  mainImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  thumbnailRow: {
    marginBottom: 16,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  editButton: { marginTop: 24 },
  deleteButton: { marginTop: 12 },
});
