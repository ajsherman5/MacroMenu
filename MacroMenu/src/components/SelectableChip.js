import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SelectableChip({ label, selected, onPress, showCheck = true }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {showCheck && (
        <Ionicons
          name={selected ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={22}
          color={selected ? '#000' : '#CCC'}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  chipSelected: {
    borderColor: '#000',
    backgroundColor: '#F5F5F5',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  labelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  icon: {
    marginLeft: 8,
  },
});
