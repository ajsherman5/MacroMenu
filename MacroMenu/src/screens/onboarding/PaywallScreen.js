import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const plans = [
  { id: 'yearly', label: 'Yearly', price: '$29.99', perMonth: '$2.49/mo', badge: 'Best Value', savings: 'Save 75%' },
  { id: 'monthly', label: 'Monthly', price: '$9.99', perMonth: '$9.99/mo', badge: null, savings: null },
];

export default function PaywallScreen({ navigation }) {
  const [selected, setSelected] = useState('yearly');

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Unlock MacroMenu</Text>
        <Text style={styles.subtitle}>Your personalized plan is ready</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#000" />
            <Text style={styles.featureText}>Personalized meal recommendations</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#000" />
            <Text style={styles.featureText}>22M+ restaurants covered</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#000" />
            <Text style={styles.featureText}>Full macro & calorie breakdowns</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#000" />
            <Text style={styles.featureText}>AI chat for any menu question</Text>
          </View>
        </View>

        <View style={styles.plans}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.plan,
                selected === plan.id && styles.planSelected,
              ]}
              onPress={() => setSelected(plan.id)}
            >
              {plan.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{plan.badge}</Text>
                </View>
              )}
              <View style={styles.planContent}>
                <View style={styles.planLeft}>
                  <View style={[styles.radio, selected === plan.id && styles.radioSelected]}>
                    {selected === plan.id && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={styles.planPerMonth}>{plan.perMonth}</Text>
                  </View>
                </View>
                <View style={styles.planRight}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  {plan.savings && <Text style={styles.planSavings}>{plan.savings}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('MainApp')}
        >
          <Text style={styles.buttonText}>Start 3-Day Free Trial</Text>
        </TouchableOpacity>
        <Text style={styles.terms}>
          Cancel anytime. Auto-renews after trial.
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
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  featureText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 14,
  },
  plans: {
    marginBottom: 20,
  },
  plan: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  planSelected: {
    borderColor: '#000',
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
  planLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  planPerMonth: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  planSavings: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 2,
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
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  terms: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
  },
});
