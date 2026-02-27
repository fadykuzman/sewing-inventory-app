import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFabricById, updateFabric } from '../api/fabrics';
import { useFabricForm } from '../hooks/useFabricForm';
import type { RootStackParamList } from '../../App';

type RouteProp = NativeStackScreenProps<RootStackParamList, 'EditFabric'>['route'];

export default function EditFabricScreen() {
  const { params } = useRoute<RouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { formData, setField, populateFromFabric, validate, toJSON } = useFabricForm();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [populated, setPopulated] = useState(false);

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

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => updateFabric(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric', params.id] });
      navigation.goBack();
    },
    onMutate: () => {
      setValidationError(null);
    },
  });

  function handleSubmit() {
    setValidationError(null);
    const errors = validate();
    if (errors.length > 0) {
      setValidationError(errors.join(' '));
      return;
    }
    mutation.mutate(toJSON());
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

      {validationError && <HelperText type="error" visible>{validationError}</HelperText>}
      {mutation.isError && <HelperText type="error" visible>{mutation.error.message}</HelperText>}

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
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
});
