import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const foods = [
  { id: 'chicken', label: 'Chicken', icon: '🍗' },
  { id: 'beef', label: 'Beef', icon: '🥩' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'pork', label: 'Pork', icon: '🥓' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'rice', label: 'Rice', icon: '🍚' },
  { id: 'pasta', label: 'Pasta', icon: '🍝' },
  { id: 'salad', label: 'Salads', icon: '🥗' },
  { id: 'burger', label: 'Burgers', icon: '🍔' },
  { id: 'pizza', label: 'Pizza', icon: '🍕' },
  { id: 'tacos', label: 'Tacos', icon: '🌮' },
  { id: 'sushi', label: 'Sushi', icon: '🍣' },
];

export default function PreferencesScreen({ navigation }) {
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);

  const toggleLike = (id) => {
    if (likes.includes(id)) {
      setLikes(likes.filter((s) => s !== id));
    } else {
      setDislikes(dislikes.filter((s) => s !== id));
      setLikes([...likes, id]);
    }
  };

  const toggleDislike = (id) => {
    if (dislikes.includes(id)) {
      setDislikes(dislikes.filter((s) => s !== id));
    } else {
      setLikes(likes.filter((s) => s !== id));
      setDislikes([...dislikes, id]);
    }
  };

  const getStatus = (id) => {
    if (likes.includes(id)) return 'like';
    if (dislikes.includes(id)) return 'dislike';
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.step}>4 of 5</Text>
          <Text style={styles.title}>Food preferences</Text>
          <Text style={styles.subtitle}>Tap once to like, twice to dislike</Text>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.legendText}>Like</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Dislike</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {foods.map((item) => {
            const status = getStatus(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.option,
                  status === 'like' && styles.optionLiked,
                  status === 'dislike' && styles.optionDisliked,
                ]}
                onPress={() => {
                  if (status === null) toggleLike(item.id);
                  else if (status === 'like') toggleDislike(item.id);
                  else toggleDislike(item.id);
                }}
              >
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <Text style={styles.optionLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Summary')}
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
    marginBottom: 16,
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
  legend: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '30%',
    marginBottom: 12,
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F1F1F',
  },
  optionLiked: {
    borderColor: '#4ADE80',
    backgroundColor: '#1a2e1a',
  },
  optionDisliked: {
    borderColor: '#EF4444',
    backgroundColor: '#2e1a1a',
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
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
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
