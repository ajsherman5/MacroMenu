import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen({ navigation }) {
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const isComplete = gender && age && height && weight;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.step}>2 of 5</Text>
          <Text style={styles.title}>Your stats</Text>
          <Text style={styles.subtitle}>Used to calculate your daily targets</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'male' && styles.genderSelected]}
              onPress={() => setGender('male')}
            >
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'female' && styles.genderSelected]}
              onPress={() => setGender('female')}
            >
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Height (inches)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="70"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="175"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
          />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.button, !isComplete && styles.buttonDisabled]}
          onPress={() => isComplete && navigation.navigate('Restrictions')}
          disabled={isComplete ? false : true}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 14,
    color: '#4ADE80',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    width: '48%',
    backgroundColor: '#1F1F1F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F1F1F',
  },
  genderSelected: {
    borderColor: '#4ADE80',
  },
  genderText: {
    fontSize: 16,
    color: '#fff',
  },
  input: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
  },
  bottom: {
    padding: 24,
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#4ADE80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
