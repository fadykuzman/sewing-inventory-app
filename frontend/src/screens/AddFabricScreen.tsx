import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { createFabric } from '../api/fabrics';

export default function AddFabricScreen() {
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [pattern, setPattern] = useState('');
  const [amountMeters, setAmountMeters] = useState('');
  const [label, setLabel] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [cost, setCost] = useState('');
  const [projectIdeas, setProjectIdeas] = useState('');

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets);
    }
  }

  async function handleSubmit() {
    console.log('handleSubmit called');
    setError(null);
    setWarning(null);
    setSuccess(false);

    if (!type.trim()) {
      setError('Fabric type is required.');
      return;
    }
    if (!amountMeters.trim() || isNaN(Number(amountMeters))) {
      setError('Amount (meters) is required and must be a number.');
      return;
    }

    console.log('validation passed, building formData');
    const formData = new FormData();
    formData.append('type', type.trim());
    formData.append('amount_meters', amountMeters.trim());
    if (color) formData.append('color', color.trim());
    if (pattern) formData.append('pattern', pattern.trim());
    if (label) formData.append('label', label.trim());
    if (purchaseLocation) formData.append('purchase_location', purchaseLocation.trim());
    if (cost) formData.append('cost', cost.trim());
    if (projectIdeas) formData.append('project_ideas', projectIdeas.trim());

    console.log('images count:', images.length);
    for (const asset of images) {
      console.log('processing image:', asset.uri);
      const filename = asset.uri.split('/').pop() ?? 'image.jpg';
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const blob = await fetch(asset.uri).then(r => r.blob());
      console.log('blob fetched');
      formData.append('images', blob, filename);
    }

    try {
      setLoading(true);
      console.log('calling createFabric');
      const result = await createFabric(formData);
      if (result.warning) setWarning(result.warning);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add Fabric</Text>

      <TextInput label="Type *" value={type} onChangeText={setType} style={styles.input} />
      <TextInput label="Amount (meters) *" value={amountMeters} onChangeText={setAmountMeters} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Color" value={color} onChangeText={setColor} style={styles.input} />
      <TextInput label="Pattern" value={pattern} onChangeText={setPattern} style={styles.input} />
      <TextInput label="Label / Brand" value={label} onChangeText={setLabel} style={styles.input} />
      <TextInput label="Purchase Location" value={purchaseLocation} onChangeText={setPurchaseLocation} style={styles.input} />
      <TextInput label="Cost" value={cost} onChangeText={setCost} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Project Ideas" value={projectIdeas} onChangeText={setProjectIdeas} multiline style={styles.input} />

      <Button mode="outlined" onPress={handlePickImages} style={styles.input}>
        {images.length > 0 ? `${images.length} image(s) selected` : 'Add Images'}
      </Button>

      <View style={styles.imageRow}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img.uri }} style={styles.thumbnail} />
        ))}
      </View>

      {error && <HelperText type="error" visible>{error}</HelperText>}
      {warning && <HelperText type="info" visible>{warning}</HelperText>}
      {success && <HelperText type="info" visible>Fabric added successfully!</HelperText>}

      <View style={styles.button}>
        <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
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
});
