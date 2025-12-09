import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';

const goalContent = {
  bulk: {
    subtitle: "Gaining weight isn't about eating everything.\nIt's about eating enough of the right things.",
    without: {
      stat1: { number: '68%', label: 'struggle to hit calorie surplus' },
      stat2: { number: '2x', label: 'harder to build muscle' },
    },
    with: {
      stat1: { number: '91%', label: 'consistently hit their calorie goals' },
      stat2: { number: '2x', label: 'faster muscle gains' },
    },
    insight: "The difference isn't appetite — it's knowing what to order.",
  },
  cut: {
    subtitle: "Losing weight isn't about starving yourself.\nIt's about making smarter choices.",
    without: {
      stat1: { number: '73%', label: 'underestimate their calories' },
      stat2: { number: '2x', label: 'longer to reach goals' },
    },
    with: {
      stat1: { number: '94%', label: 'stay within their calorie budget' },
      stat2: { number: '2x', label: 'faster results' },
    },
    insight: "The difference isn't willpower — it's information.",
  },
  maintain: {
    subtitle: "Staying fit isn't about perfection.\nIt's about consistency with the right choices.",
    without: {
      stat1: { number: '65%', label: 'drift from their goals over time' },
      stat2: { number: '3x', label: 'more likely to yo-yo' },
    },
    with: {
      stat1: { number: '89%', label: 'maintain their target weight' },
      stat2: { number: '2x', label: 'more consistent long-term' },
    },
    insight: "The difference isn't discipline — it's having a system.",
  },
};

export default function HeresTheTruthScreen({ navigation, route }) {
  const goal = route.params?.goal || 'cut';
  const content = goalContent[goal];

  return (
    <OnboardingLayout
      progress={4 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Gender', { goal })}
      continueText="Let's Fix That"
    >
      <Text style={styles.title}>Here's the truth</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>

      <View style={styles.comparisonContainer}>
        {/* Without MacroMenu */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="close-circle-outline" size={24} color="#E53935" />
            <Text style={styles.cardTitle}>Without guidance</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statNumber}>{content.without.stat1.number}</Text>
            <Text style={styles.statLabel}>{content.without.stat1.label}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statNumber}>{content.without.stat2.number}</Text>
            <Text style={styles.statLabel}>{content.without.stat2.label}</Text>
          </View>
        </View>

        {/* With MacroMenu */}
        <View style={[styles.card, styles.cardHighlighted]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4ADE80" />
            <Text style={[styles.cardTitle, styles.cardTitleHighlighted]}>With MacroMenu</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statNumber, styles.statNumberHighlighted]}>{content.with.stat1.number}</Text>
            <Text style={[styles.statLabel, styles.statLabelHighlighted]}>{content.with.stat1.label}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={[styles.statNumber, styles.statNumberHighlighted]}>{content.with.stat2.number}</Text>
            <Text style={[styles.statLabel, styles.statLabelHighlighted]}>{content.with.stat2.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomText}>
        <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#666" />
        <Text style={styles.description}>{content.insight}</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHighlighted: {
    backgroundColor: '#000',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  cardTitleHighlighted: {
    color: '#fff',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E53935',
    marginRight: 10,
  },
  statNumberHighlighted: {
    color: '#4ADE80',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  statLabelHighlighted: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginVertical: 4,
  },
  bottomText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
});
