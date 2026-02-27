import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, Portal, Text, TextInput } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createFabric } from '../api/fabrics';
import { useFabricForm } from '../hooks/useFabricForm';
import { useImagePicker } from '../hooks/useImagePicker';
import { RootStackParamList } from '../../App';

export default function AddFabricScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { formData, setField, reset, validate, toFormData } = useFabricForm();
  const { images, pickImages, takePhoto, clear: clearImages, appendToFormData } = useImagePicker();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const mutation = useMutation({
    mutationFn: createFabric,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      reset();
      clearImages();
      navigation.navigate('FabricDetail', { id: result.data.id });
    },
    onMutate: () => {
      setValidationError(null);
    },
  });

  async function handleSubmit() {
    setValidationError(null);
    const errors = validate();
    if (errors.length > 0) {
      setValidationError(errors.join(' '));
      return;
    }

    const fd = toFormData();
    appendToFormData(fd);
    mutation.mutate(fd);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add Fabric</Text>

      <TextInput label="Type *" value={formData.type} onChangeText={v => setField('type', v)} style={styles.input} />
      <TextInput label="Amount (meters) *" value={formData.amountMeters} onChangeText={v => setField('amountMeters', v)} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Color" value={formData.color} onChangeText={v => setField('color', v)} style={styles.input} />
      <TextInput label="Pattern" value={formData.pattern} onChangeText={v => setField('pattern', v)} style={styles.input} />
      <TextInput label="Label / Brand" value={formData.label} onChangeText={v => setField('label', v)} style={styles.input} />
      <TextInput label="Purchase Location" value={formData.purchaseLocation} onChangeText={v => setField('purchaseLocation', v)} style={styles.input} />
      <TextInput label="Cost" value={formData.cost} onChangeText={v => setField('cost', v)} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Project Ideas" value={formData.projectIdeas} onChangeText={v => setField('projectIdeas', v)} multiline style={styles.input} />

      <Button mode="outlined" onPress={() => setImageMenuVisible(true)} style={styles.input}>
        {images.length > 0 ? `${images.length} image(s) selected` : 'Add Images'}
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

      <View style={styles.imageRow}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img.uri }} style={styles.thumbnail} />
        ))}
      </View>

      {validationError && <HelperText type="error" visible>{validationError}</HelperText>}
      {mutation.isError && <HelperText type="error" visible>{mutation.error.message}</HelperText>}

      <View style={styles.button}>
        <Button mode="contained" onPress={handleSubmit} loading={mutation.isPending} disabled={mutation.isPending}>
          Save Fabric
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 4 },
  dialogButton: { marginBottom: 8 },
});
