/**
 * Nutritionix API Service
 * Documentation: https://developer.nutritionix.com/docs/v2
 */

const NUTRITIONIX_APP_ID = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID || 'YOUR_APP_ID';
const NUTRITIONIX_API_KEY = process.env.EXPO_PUBLIC_NUTRITIONIX_API_KEY || 'YOUR_API_KEY';
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

const headers = {
  'x-app-id': NUTRITIONIX_APP_ID,
  'x-app-key': NUTRITIONIX_API_KEY,
  'Content-Type': 'application/json',
};

/**
 * Search for branded restaurant foods
 * @param {string} query - Search query (e.g., "chipotle burrito bowl")
 * @param {string} brandId - Optional brand ID to filter by
 * @returns {Promise<Array>} Array of food items
 */
export async function searchBrandedFoods(query, brandId = null) {
  try {
    const params = new URLSearchParams({
      query,
      branded: true,
      self: false,
      common: false,
      detailed: true,
    });

    if (brandId) {
      params.append('brand_ids', brandId);
    }

    const response = await fetch(`${BASE_URL}/search/instant?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return data.branded || [];
  } catch (error) {
    console.error('Error searching branded foods:', error);
    throw error;
  }
}

/**
 * Get detailed nutrition info for a specific food item
 * @param {string} nixItemId - Nutritionix item ID
 * @returns {Promise<Object>} Detailed nutrition data
 */
export async function getFoodDetails(nixItemId) {
  try {
    const response = await fetch(`${BASE_URL}/search/item?nix_item_id=${nixItemId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return data.foods?.[0] || null;
  } catch (error) {
    console.error('Error getting food details:', error);
    throw error;
  }
}

/**
 * Search for restaurant locations
 * @param {string} query - Restaurant name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Array>} Array of restaurant locations
 */
export async function searchRestaurants(query, lat = null, lng = null) {
  try {
    const params = new URLSearchParams({ query });

    if (lat && lng) {
      params.append('lat', lat);
      params.append('lng', lng);
    }

    const response = await fetch(`${BASE_URL}/locations?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return data.locations || [];
  } catch (error) {
    console.error('Error searching restaurants:', error);
    throw error;
  }
}

/**
 * Get all menu items for a specific restaurant brand
 * @param {string} brandId - Brand ID from Nutritionix
 * @returns {Promise<Array>} Array of menu items
 */
export async function getRestaurantMenu(brandId) {
  try {
    const response = await fetch(`${BASE_URL}/search/instant?brand_ids=${brandId}&branded=true&detailed=true`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return data.branded || [];
  } catch (error) {
    console.error('Error getting restaurant menu:', error);
    throw error;
  }
}

/**
 * Parse natural language food query
 * @param {string} query - Natural language query (e.g., "I ate a chipotle bowl with chicken")
 * @returns {Promise<Array>} Array of parsed food items with nutrition
 */
export async function parseNaturalQuery(query) {
  try {
    const response = await fetch(`${BASE_URL}/natural/nutrients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error('Error parsing natural query:', error);
    throw error;
  }
}

/**
 * Transform Nutritionix food item to our app's format
 */
export function transformFoodItem(item) {
  return {
    id: item.nix_item_id || item.food_name,
    name: item.food_name,
    brandName: item.brand_name || null,
    servingSize: item.serving_qty,
    servingUnit: item.serving_unit,
    calories: Math.round(item.nf_calories || 0),
    protein: Math.round(item.nf_protein || 0),
    carbs: Math.round(item.nf_total_carbohydrate || 0),
    fat: Math.round(item.nf_total_fat || 0),
    fiber: Math.round(item.nf_dietary_fiber || 0),
    sugar: Math.round(item.nf_sugars || 0),
    sodium: Math.round(item.nf_sodium || 0),
    photo: item.photo?.thumb || null,
    allergens: item.nf_ingredient_statement || null,
  };
}

/**
 * Get popular restaurant brands with their IDs
 */
export const POPULAR_BRANDS = {
  chipotle: '513fbc1283aa2dc80c000020',
  mcdonalds: '513fbc1283aa2dc80c000053',
  subway: '513fbc1283aa2dc80c000048',
  chickfila: '513fbc1283aa2dc80c00002b',
  wendys: '513fbc1283aa2dc80c000061',
  tacobell: '513fbc1283aa2dc80c000050',
  panera: '513fbc1283aa2dc80c000035',
  starbucks: '513fbc1283aa2dc80c000045',
  shakeshack: '5a8ec1e9bb44570006e70e04',
  buffalowildwings: '513fbc1283aa2dc80c00001a',
  sonic: '513fbc1283aa2dc80c000044',
  cava: '5886c0c0ba6d0d9d5d0d2dbf',
  jerseyMikes: '5412fc74c30e14c12e003e49',
  whataburger: '5411e26bc30e14c12e001bb6',
};

/**
 * Search for menu items by restaurant and optional filters
 */
export async function searchMenuItems({
  restaurantName,
  query = '',
  maxCalories = null,
  minProtein = null,
}) {
  try {
    const brandId = POPULAR_BRANDS[restaurantName?.toLowerCase().replace(/[^a-z]/g, '')];
    const searchQuery = query || restaurantName;

    let items = await searchBrandedFoods(searchQuery, brandId);

    // Apply filters
    if (maxCalories) {
      items = items.filter((item) => (item.nf_calories || 0) <= maxCalories);
    }

    if (minProtein) {
      items = items.filter((item) => (item.nf_protein || 0) >= minProtein);
    }

    return items.map(transformFoodItem);
  } catch (error) {
    console.error('Error searching menu items:', error);
    throw error;
  }
}
