import { useEffect, useMemo, useState } from 'react';
import { Image, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, IconButton, Menu, Portal, Text, TextInput, TouchableRipple } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { createFabric } from '../api/fabrics';
import { getFabricTypes } from '../api/fabricTypes';
import { FabricType } from '../types/fabric';
import { useFabricForm } from '../hooks/useFabricForm';
import { useImagePicker } from '../hooks/useImagePicker';
import { RootStackParamList } from '../../App';

type ScreenRouteProp = RouteProp<RootStackParamList, 'AddFabric'>;

export default function AddFabricScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ScreenRouteProp>();
  const queryClient = useQueryClient();
  const { formData, setField, reset, validate, toFormData } = useFabricForm();
  const { images, pickImages, takePhoto, clear: clearImages, appendToFormData } = useImagePicker();

  const { data: fabricTypes = [] } = useQuery({
    queryKey: ['fabricTypes'],
    queryFn: getFabricTypes,
  });

  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);
  const [selectedTypeName, setSelectedTypeName] = useState('');

  // Pre-populate from navigation params
  useEffect(() => {
    const params = route.params;
    if (params?.preselectedTypeId && params?.preselectedTypeName) {
      setField('fabricTypeId', String(params.preselectedTypeId));
      setSelectedTypeName(params.preselectedTypeName);
    }
  }, [route.params]);

  const filteredTypes = useMemo(() => {
    if (!typeSearchQuery) return fabricTypes;
    const q = typeSearchQuery.toLowerCase();
    return fabricTypes.filter(
      (t) => t.name_en.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [fabricTypes, typeSearchQuery]);

  function selectType(t: FabricType) {
    setField('fabricTypeId', String(t.id));
    setSelectedTypeName(t.name_en);
    setTypeDropdownVisible(false);
    setTypeSearchQuery('');
  }
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton icon="camera-plus" onPress={() => setImageMenuVisible(true)} />
      ),
    });
  }, [navigation]);
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
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: keyboardHeight + 32 }]} keyboardShouldPersistTaps="handled">
      <TextInput label="Name *" value={formData.name} onChangeText={v => setField('name', v)} style={styles.input} />
      <View style={styles.input}>
        <TextInput
          label="Fabric Type *"
          value={typeDropdownVisible ? typeSearchQuery : selectedTypeName}
          onChangeText={(v) => { setTypeSearchQuery(v); if (!typeDropdownVisible) setTypeDropdownVisible(true); }}
          onFocus={() => setTypeDropdownVisible(true)}
          right={<TextInput.Icon icon={typeDropdownVisible ? 'chevron-up' : 'chevron-down'} onPress={() => setTypeDropdownVisible(!typeDropdownVisible)} />}
        />
        {typeDropdownVisible && (
          <ScrollView style={[styles.dropdown, styles.dropdownList]} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filteredTypes.length === 0 && <Text style={styles.dropdownItem}>No types found</Text>}
            {filteredTypes.map((item) => (
              <TouchableRipple key={item.id} onPress={() => selectType(item)}>
                <Text style={styles.dropdownItem}>{item.name_en}</Text>
              </TouchableRipple>
            ))}
          </ScrollView>
        )}
      </View>
      <TextInput label="Amount (meters) *" value={formData.amountMeters} onChangeText={v => setField('amountMeters', v)} keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Color" value={formData.color} onChangeText={v => setField('color', v)} style={styles.input} />
      <TextInput label="Pattern" value={formData.pattern} onChangeText={v => setField('pattern', v)} style={styles.input} />
      <TextInput label="Label / Brand" value={formData.label} onChangeText={v => setField('label', v)} style={styles.input} />
      <TextInput label="Purchase Location" value={formData.purchaseLocation} onChangeText={v => setField('purchaseLocation', v)} style={styles.input} />
      <TextInput label="Cost per meter" value={formData.cost} onChangeText={v => setField('cost', v)} keyboardType="decimal-pad" style={styles.input} right={<TextInput.Affix text="€/m" />} />
      <TextInput label="Project Ideas" value={formData.projectIdeas} onChangeText={v => setField('projectIdeas', v)} multiline style={styles.input} />

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
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 32 },
  title: { marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 4 },
  dialogButton: { marginBottom: 8 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderTopWidth: 0, zIndex: 10 },
  dropdownList: { maxHeight: 200 },
  dropdownItem: { padding: 12 },
});
