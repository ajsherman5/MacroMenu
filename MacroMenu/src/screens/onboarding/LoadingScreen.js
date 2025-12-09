import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const loadingSteps = [
  'Analyzing your preferences',
  'Filtering restaurants',
  'Calculating your macros',
  'Preparing recommendations',
];

export default function LoadingScreen({ navigation }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigation.navigate('SignIn');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * loadingSteps.length);
    setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1));
  }, [progress]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.percentage}>{progress}%</Text>
        <Text style={styles.title}>We're getting your healthy menu ready</Text>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <Text style={styles.step}>{loadingSteps[currentStep]}</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Disclaimer:</Text>
        <Text style={styles.disclaimerText}>
          MacroMenu does not provide medical advice. All nutritional suggestions are for general informational purposes only and are not intended to diagnose, treat, or prevent any health condition. Meal recommendations are based on data collected by certified nutrition professionals and publicly available nutrition databases.
        </Text>
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
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  percentage: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  step: {
    fontSize: 16,
    color: '#666',
  },
  disclaimer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#999',
    lineHeight: 16,
  },
});
