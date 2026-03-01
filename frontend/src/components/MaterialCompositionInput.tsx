import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { Material } from '../types/fabric';

export interface MaterialRow {
  materialId: string;
  materialName: string;
  percentage: string;
}

interface Props {
  rows: MaterialRow[];
  onChange: (rows: MaterialRow[]) => void;
  materials: Material[];
}

export default function MaterialCompositionInput({ rows, onChange, materials }: Props) {
  const theme = useTheme();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});

  function addRow() {
    if (rows.length >= 3) return;
    onChange([...rows, { materialId: '', materialName: '', percentage: '' }]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
    setOpenDropdownIndex(null);
  }

  function updatePercentage(index: number, value: string) {
    const updated = [...rows];
    updated[index] = { ...updated[index], percentage: value };
    onChange(updated);
  }

  function selectMaterial(index: number, material: Material) {
    const updated = [...rows];
    updated[index] = { ...updated[index], materialId: String(material.id), materialName: `${material.name} (${material.name_en})` };
    onChange(updated);
    setOpenDropdownIndex(null);
    setSearchQueries((prev) => ({ ...prev, [index]: '' }));
  }

  function getFilteredMaterials(index: number) {
    const query = (searchQueries[index] ?? '').toLowerCase();
    const selectedIds = rows.map((r, i) => i !== index ? r.materialId : '').filter(Boolean);
    return materials
      .filter((m) => !selectedIds.includes(String(m.id)))
      .filter((m) => !query || m.name.toLowerCase().includes(query) || m.name_en.toLowerCase().includes(query));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Composition</Text>
        {rows.length < 3 && (
          <IconButton icon="plus" size={20} onPress={addRow} />
        )}
      </View>

      {rows.map((row, index) => {
        const isOpen = openDropdownIndex === index;
        const filteredMaterials = isOpen ? getFilteredMaterials(index) : [];

        return (
          <View key={index} style={styles.row}>
            <View style={styles.materialField}>
              <TextInput
                label="Material"
                dense
                value={isOpen ? (searchQueries[index] ?? '') : row.materialName}
                onChangeText={(v) => {
                  setSearchQueries((prev) => ({ ...prev, [index]: v }));
                  if (!isOpen) setOpenDropdownIndex(index);
                }}
                onFocus={() => setOpenDropdownIndex(index)}
                right={<TextInput.Icon icon={isOpen ? 'chevron-up' : 'chevron-down'} onPress={() => setOpenDropdownIndex(isOpen ? null : index)} />}
              />
              {isOpen && (
                <ScrollView style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outlineVariant, borderTopWidth: 0, maxHeight: 150, zIndex: 10 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {filteredMaterials.length === 0 && <Text style={styles.dropdownItem}>No materials found</Text>}
                  {filteredMaterials.map((m) => (
                    <TouchableRipple key={m.id} onPress={() => selectMaterial(index, m)}>
                      <Text style={styles.dropdownItem}>{m.name} ({m.name_en})</Text>
                    </TouchableRipple>
                  ))}
                </ScrollView>
              )}
            </View>

            <TextInput
              label="%"
              dense
              value={row.percentage}
              onChangeText={(v) => updatePercentage(index, v)}
              keyboardType="number-pad"
              style={styles.percentField}
            />

            <IconButton icon="close" size={18} onPress={() => removeRow(index)} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  materialField: { flex: 1 },
  percentField: { width: 72 },
  dropdownItem: { padding: 10 },
});
