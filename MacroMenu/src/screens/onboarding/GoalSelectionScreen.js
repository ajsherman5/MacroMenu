import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const goals = [
  {
    id: 'bulk',
    title: 'Gain Weight',
    subtitle: 'Bulk',
    icon: 'dumbbell',
    iconType: 'material',
  },
  {
    id: 'cut',
    title: 'Lose Weight',
    subtitle: 'Cut',
    icon: 'scale-bathroom',
    iconType: 'material',
  },
  {
    id: 'maintain',
    title: 'Maintain',
    subtitle: 'Stay fit',
    icon: 'heart-pulse',
    iconType: 'material',
  },
];

export default function GoalSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const renderIcon = (goal) => {
    if (goal.iconType === 'material') {
      return <MaterialCommunityIcons name={goal.icon} size={26} color="#000" />;
    }
    if (goal.iconType === 'feather') {
      return <Feather name={goal.icon} size={26} color="#000" strokeWidth={1.5} />;
    }
    return <Ionicons name={goal.icon} size={26} color="#000" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '5%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>
          This will be used to calibrate your custom calories and macros.
        </Text>

        <View style={styles.options}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.option,
                selected === goal.id && styles.optionSelected,
              ]}
              onPress={() => setSelected(goal.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {renderIcon(goal)}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{goal.title}</Text>
                <Text style={styles.optionSubtitle}>{goal.subtitle}</Text>
              </View>
              <View style={[styles.radio, selected === goal.id && styles.radioSelected]}>
                {selected === goal.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={() => selected && navigation.navigate('DaysEatingOut', { goal: selected })}
          disabled={!selected}
        >
          <Text style={[styles.buttonText, !selected && styles.buttonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  progressBg: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
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
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
