import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';

const reviews = [
  {
    name: 'Sarah M.',
    text: "MacroMenu is a total game-changer! It helps me quickly find the best meal options without overthinking or tracking everything manually.",
    rating: 5,
  },
  {
    name: 'Mike R.',
    text: "Makes healthy eating so easy. The meals are tasty, the layout is super clear, and everything just works. I use this every single day.",
    rating: 5,
  },
];

export default function SocialProofScreen({ navigation }) {
  return (
    <OnboardingLayout
      progress={17 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Loading')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Give us a rating</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={40} color="#FFD700" />
          ))}
        </View>

        <Text style={styles.subtitle}>This app was designed for people like you.</Text>

        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SM</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MR</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JK</Text>
          </View>
        </View>

        {reviews.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <Text style={styles.reviewText}>{review.text}</Text>
            <View style={styles.reviewFooter}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitials}>{review.name[0]}</Text>
              </View>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.name}</Text>
              </View>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#FFD700" />
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 36,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  reviewText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  reviewStars: {
    flexDirection: 'row',
  },
});
