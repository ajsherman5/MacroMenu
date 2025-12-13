/**
 * Google Places API Service
 * Used for finding nearby restaurants with geo-location
 *
 * Free tier: $200/month credit (~10,000+ requests)
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Enable "Places API"
 * 3. Create API key in Credentials
 * 4. Add to .env: EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_key
 */

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Check if API is configured
export const isGooglePlacesConfigured = () => {
  return !!GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_key_here';
};

/**
 * Search for nearby restaurants
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in meters (default 5000 = ~3 miles)
 * @param {string} keyword - Optional keyword filter (e.g., "Chipotle")
 * @returns {Promise<Array>} List of nearby restaurants
 */
export async function searchNearbyRestaurants(latitude, longitude, radius = 5000, keyword = '') {
  if (!isGooglePlacesConfigured()) {
    console.warn('[GooglePlaces] API not configured, returning mock data');
    return getMockNearbyRestaurants(keyword);
  }

  try {
    let url = `${PLACES_BASE_URL}/nearbysearch/json?` +
      `location=${latitude},${longitude}` +
      `&radius=${radius}` +
      `&type=restaurant` +
      `&key=${GOOGLE_API_KEY}`;

    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // ZERO_RESULTS means no restaurants found - return empty array
    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    if (data.status !== 'OK') {
      console.error('[GooglePlaces] API error:', data.status, data.error_message);
      // On API error, return empty array to hide the chain (safer than showing unavailable chains)
      return [];
    }

    // If we searched for a specific chain, filter results to only include actual matches
    // Google Places sometimes returns unrelated results that just have the keyword somewhere
    let results = (data.results || []).map(transformPlaceResult);

    if (keyword) {
      const keywordLower = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
      results = results.filter(place => {
        const nameLower = place.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Check if the place name contains the chain name or vice versa
        return nameLower.includes(keywordLower) || keywordLower.includes(nameLower);
      });
    }

    return results;
  } catch (error) {
    console.error('[GooglePlaces] Error fetching:', error);
    // On network error, return empty array to hide the chain
    return [];
  }
}

/**
 * Search for a specific restaurant chain nearby
 * @param {string} restaurantName - Name of restaurant (e.g., "Chipotle")
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array>} List of matching restaurants
 */
export async function searchRestaurantChain(restaurantName, latitude, longitude, radius = 8000) {
  return searchNearbyRestaurants(latitude, longitude, radius, restaurantName);
}

/**
 * Get details for a specific place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details
 */
export async function getPlaceDetails(placeId) {
  if (!isGooglePlacesConfigured()) {
    console.warn('Google Places API not configured');
    return null;
  }

  try {
    const url = `${PLACES_BASE_URL}/details/json?` +
      `place_id=${placeId}` +
      `&fields=name,formatted_address,formatted_phone_number,opening_hours,website,rating,price_level,photos` +
      `&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

/**
 * Get photo URL for a place
 * @param {string} photoReference - Photo reference from Places API
 * @param {number} maxWidth - Max width of photo
 * @returns {string} Photo URL
 */
export function getPhotoUrl(photoReference, maxWidth = 400) {
  if (!GOOGLE_API_KEY || !photoReference) return null;

  return `${PLACES_BASE_URL}/photo?` +
    `maxwidth=${maxWidth}` +
    `&photo_reference=${photoReference}` +
    `&key=${GOOGLE_API_KEY}`;
}

/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Transform Google Places result to our app format
 */
function transformPlaceResult(place) {
  return {
    id: place.place_id,
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address,
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    rating: place.rating,
    priceLevel: place.price_level,
    isOpen: place.opening_hours?.open_now,
    types: place.types || [],
    photoReference: place.photos?.[0]?.photo_reference,
    // Will be calculated when we have user location
    distance: null,
  };
}

/**
 * Mock data for development without API key
 * When a keyword is provided, only returns matching restaurants
 */
function getMockNearbyRestaurants(keyword = '') {
  const allMockRestaurants = [
    {
      id: 'mock-chipotle-1',
      placeId: 'mock-chipotle-1',
      name: 'Chipotle Mexican Grill',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.0060,
      rating: 4.2,
      priceLevel: 2,
      isOpen: true,
      types: ['restaurant', 'food'],
      distance: 0.3,
      brandId: 'chipotle',
    },
    {
      id: 'mock-chickfila-1',
      placeId: 'mock-chickfila-1',
      name: 'Chick-fil-A',
      address: '456 Oak Ave',
      latitude: 40.7138,
      longitude: -74.0070,
      rating: 4.5,
      priceLevel: 2,
      isOpen: true,
      types: ['restaurant', 'food'],
      distance: 0.5,
      brandId: 'chickfila',
    },
    {
      id: 'mock-mcdonalds-1',
      placeId: 'mock-mcdonalds-1',
      name: "McDonald's",
      address: '789 Elm St',
      latitude: 40.7148,
      longitude: -74.0080,
      rating: 3.8,
      priceLevel: 1,
      isOpen: true,
      types: ['restaurant', 'food'],
      distance: 0.7,
      brandId: 'mcdonalds',
    },
    {
      id: 'mock-subway-1',
      placeId: 'mock-subway-1',
      name: 'Subway',
      address: '321 Pine Rd',
      latitude: 40.7158,
      longitude: -74.0090,
      rating: 3.9,
      priceLevel: 1,
      isOpen: true,
      types: ['restaurant', 'food'],
      distance: 0.9,
      brandId: 'subway',
    },
    {
      id: 'mock-tacobell-1',
      placeId: 'mock-tacobell-1',
      name: 'Taco Bell',
      address: '654 Cedar Ln',
      latitude: 40.7168,
      longitude: -74.0100,
      rating: 3.7,
      priceLevel: 1,
      isOpen: true,
      types: ['restaurant', 'food'],
      distance: 1.1,
      brandId: 'tacobell',
    },
    {
      id: 'mock-wendys-1',
      placeId: 'mock-wendys-1',
      name: "Wendy's",
      address: '987 Maple Dr',
      latitude: 40.7178,
      longitude: -74.0110,
      rating: 3.8,
      priceLevel: 1,
      isOpen: true,
      types: ['restaurant', 'food'],
      distance: 1.4,
      brandId: 'wendys',
    },
  ];

  // If no keyword, return all mock restaurants
  if (!keyword) {
    return allMockRestaurants;
  }

  // Filter by keyword (case-insensitive match on name or brandId)
  const keywordLower = keyword.toLowerCase();
  return allMockRestaurants.filter(r =>
    r.name.toLowerCase().includes(keywordLower) ||
    r.brandId.toLowerCase().includes(keywordLower)
  );
}

export default {
  isGooglePlacesConfigured,
  searchNearbyRestaurants,
  searchRestaurantChain,
  getPlaceDetails,
  getPhotoUrl,
  calculateDistance,
};
