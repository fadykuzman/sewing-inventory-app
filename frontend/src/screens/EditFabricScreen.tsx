import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, HelperText, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { addFabricImages, getFabricById, getImageUrl, removeFabricImages, updateFabric } from '../api/fabrics';
import { useFabricForm } from '../hooks/useFabricForm';
import { useImagePicker } from '../hooks/useImagePicker';
import { FabricImage } from '../types/fabric';
import type { RootStackParamList } from '../../App';

type RouteProp = NativeStackScreenProps<RootStackParamList, 'EditFabric'>['route'];

export default function EditFabricScreen() {
  const { params } = useRoute<RouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { formData, setField, populateFromFabric, validate, toJSON } = useFabricForm();
  const { images: newImages, pickImages, takePhoto, clear: clearImages, appendToFormData } = useImagePicker();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const [populated, setPopulated] = useState(false);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const { data: fabric, isLoading, isError } = useQuery({
    queryKey: ['fabric', params.id],
    queryFn: () => getFabricById(params.id),
  });

  useEffect(() => {
    if (fabric && !populated) {
      populateFromFabric(fabric);
      setPopulated(true);
    }
  }, [fabric, populated, populateFromFabric]);

  const existingImages = (fabric?.images ?? []).filter(
    (img) => !removedImageIds.includes(img.id)
  );

  function markForRemoval(imageId: string) {
    setRemovedImageIds((prev) => [...prev, imageId]);
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const errors = validate();
      if (errors.length > 0) {
        throw new Error(errors.join(' '));
      }

      await updateFabric(params.id, toJSON());

      if (removedImageIds.length > 0) {
        await removeFabricImages(params.id, removedImageIds);
      }

      if (newImages.length > 0) {
        const fd = new FormData();
        appendToFormData(fd);
        await addFabricImages(params.id, fd);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric', params.id] });
      navigation.goBack();
    },
    onMutate: () => {
      setValidationError(null);
    },
    onError: (err: Error) => {
      setValidationError(err.message);
    },
  });

  function handleSubmit() {
    setValidationError(null);
    const errors = validate();
    if (errors.length > 0) {
      setValidationError(errors.join(' '));
      return;
    }
    mutation.mutate();
  }

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  if (isError || !fabric) {
    return <View style={styles.centered}><Text>Fabric not found.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Edit Fabric</Text>

      <TextInput label="Type *" value={formData.type} onChangeText={v => setField('type', v)} style={styles.input} />
      <TextInput label="Amount (meters) *" value={formData.amountMeters} onChangeText={v => setField('amountMeters', v)} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Color" value={formData.color} onChangeText={v => setField('color', v)} style={styles.input} />
      <TextInput label="Pattern" value={formData.pattern} onChangeText={v => setField('pattern', v)} style={styles.input} />
      <TextInput label="Label / Brand" value={formData.label} onChangeText={v => setField('label', v)} style={styles.input} />
      <TextInput label="Purchase Location" value={formData.purchaseLocation} onChangeText={v => setField('purchaseLocation', v)} style={styles.input} />
      <TextInput label="Cost" value={formData.cost} onChangeText={v => setField('cost', v)} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Project Ideas" value={formData.projectIdeas} onChangeText={v => setField('projectIdeas', v)} multiline style={styles.input} />

      <Text variant="titleMedium" style={styles.sectionTitle}>Images</Text>

      {existingImages.length > 0 && (
        <View style={styles.imageRow}>
          {existingImages.map((img) => (
            <View key={img.id} style={styles.imageContainer}>
              <Image source={{ uri: getImageUrl(img.file_path) }} style={styles.thumbnail} />
              <IconButton
                icon="close-circle"
                size={20}
                style={styles.removeButton}
                onPress={() => markForRemoval(img.id)}
              />
            </View>
          ))}
        </View>
      )}

      {newImages.length > 0 && (
        <View style={styles.imageRow}>
          {newImages.map((img, i) => (
            <Image key={i} source={{ uri: img.uri }} style={styles.thumbnail} />
          ))}
        </View>
      )}

      <Button mode="outlined" onPress={() => setImageMenuVisible(true)} style={styles.input}>
        {newImages.length > 0 ? `${newImages.length} new image(s) selected` : 'Add Images'}
      </Button>

      <Portal>
        <Dialog visible={imageMenuVisible} onDismiss={() => setImageMenuVisible(false)}>
          <Dialog.Title>Add Images</Dialog.Title>
          <Dialog.Content>
            <Button icon="camera" mode="outlined" onPress={() => { setImageMenuVisible(false); takePhoto(); }} style={styles.dialogButton}>
              Take Photo
            </Button>
            <Button icon="image-multiple" mode="outlined" onPress={() => { setImageMenuVisible(false); pickImages(); }} style={styles.dialogButton}>
              Choose from Gallery
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImageMenuVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {validationError && <HelperText type="error" visible>{validationError}</HelperText>}
      {mutation.isError && !validationError && <HelperText type="error" visible>{mutation.error.message}</HelperText>}

      <View style={styles.button}>
        <Button mode="contained" onPress={handleSubmit} loading={mutation.isPending} disabled={mutation.isPending}>
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  title: { marginBottom: 16 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imageContainer: { position: 'relative' },
  thumbnail: { width: 80, height: 80, borderRadius: 4 },
  removeButton: { position: 'absolute', top: -8, right: -8, margin: 0 },
  dialogButton: { marginBottom: 8 },
});
