import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OptionCard({
  icon,
  iconComponent,
  title,
  subtitle,
  selected,
  onPress,
  showRadio = true,
}) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {iconComponent ? (
        <View style={styles.iconContainer}>{iconComponent}</View>
      ) : icon ? (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#000" />
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {showRadio && (
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardSelected: {
    borderColor: '#000',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#000',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
});
