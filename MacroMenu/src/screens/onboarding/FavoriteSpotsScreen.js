import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../context';

const logos = {
  chipotle: require('../../../assets/logos/chipotle.png'),
  shakeshack: require('../../../assets/logos/shakeshack.png'),
  jerseymikes: require('../../../assets/logos/jerseysmikes.png'),
  whataburger: require('../../../assets/logos/whataburger.png'),
  buffalowildwings: require('../../../assets/logos/buffalowildwings.png'),
  sonic: require('../../../assets/logos/sonic.png'),
  chickfila: require('../../../assets/logos/chickfila.png'),
  cava: require('../../../assets/logos/Cava-Logo.png'),
};

const popularSpots = [
  { id: 'chipotle', name: 'Chipotle', hasLogo: true },
  { id: 'shakeshack', name: 'Shake Shack', hasLogo: true },
  { id: 'jerseymikes', name: "Jersey Mike's", hasLogo: true },
  { id: 'whataburger', name: 'Whataburger', hasLogo: true },
  { id: 'buffalowildwings', name: 'Buffalo Wild Wings', hasLogo: true },
  { id: 'sonic', name: 'Sonic', hasLogo: true },
  { id: 'chickfila', name: 'Chick-fil-A', hasLogo: true },
  { id: 'cava', name: 'CAVA', hasLogo: true },
];

export default function FavoriteSpotsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const { updateOnboarding } = useOnboarding();

  const handleContinue = () => {
    updateOnboarding({ favoriteRestaurants: selected });
    navigation.navigate('FoodLikes');
  };

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const filteredSpots = popularSpots.filter(spot =>
    spot.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <OnboardingLayout
      progress={13 / 20}
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={selected.length === 0}
    >
      <Text style={styles.title}>Pick your favorite spots</Text>
      <Text style={styles.subtitle}>Any kind of restaurants in the world!</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search any restaurant"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredSpots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.spotCard}
            onPress={() => toggle(spot.id)}
            activeOpacity={0.7}
          >
            <View style={styles.spotIcon}>
              {spot.hasLogo && logos[spot.id] ? (
                <Image source={logos[spot.id]} style={styles.spotLogo} resizeMode="contain" />
              ) : (
                <Ionicons name={spot.icon} size={24} color="#666" />
              )}
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotMeta}>Your Area</Text>
            </View>
            <View style={[styles.checkbox, selected.includes(spot.id) && styles.checkboxSelected]}>
              {selected.includes(spot.id) && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
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
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    flex: 1,
  },
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  spotIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  spotLogo: {
    width: 36,
    height: 36,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  spotMeta: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
});
