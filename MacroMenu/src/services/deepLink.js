import { Linking, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * Deep Linking Service for ordering apps
 */

// Restaurant slug mappings for DoorDash
const DOORDASH_SLUGS = {
  chipotle: 'chipotle-mexican-grill',
  mcdonalds: 'mcdonalds',
  subway: 'subway',
  chickfila: 'chick-fil-a',
  wendys: 'wendys',
  tacobell: 'taco-bell',
  panera: 'panera-bread',
  starbucks: 'starbucks',
  shakeshack: 'shake-shack',
  buffalowildwings: 'buffalo-wild-wings',
  sonic: 'sonic-drive-in',
  cava: 'cava',
  jerseymikes: 'jersey-mikes-subs',
  whataburger: 'whataburger',
};

// Restaurant slug mappings for Uber Eats
const UBEREATS_SLUGS = {
  chipotle: 'chipotle-mexican-grill',
  mcdonalds: 'mcdonalds',
  subway: 'subway',
  chickfila: 'chick-fil-a',
  wendys: 'wendys',
  tacobell: 'taco-bell',
  panera: 'panera-bread',
  starbucks: 'starbucks',
  shakeshack: 'shake-shack',
};

/**
 * Check if an app is installed
 */
async function isAppInstalled(scheme) {
  try {
    return await Linking.canOpenURL(scheme);
  } catch {
    return false;
  }
}

/**
 * Open DoorDash to a specific restaurant
 * @param {string} restaurantName - Restaurant name or ID
 * @param {Object} location - Optional {lat, lng} for nearest location
 */
export async function openDoorDash(restaurantName, location = null) {
  const normalizedName = restaurantName.toLowerCase().replace(/[^a-z]/g, '');
  const slug = DOORDASH_SLUGS[normalizedName] || normalizedName;

  // Try DoorDash app first
  const appScheme = 'doordash://';
  const appInstalled = await isAppInstalled(appScheme);

  let url;
  if (location?.lat && location?.lng) {
    // Search for restaurant near location
    url = appInstalled
      ? `doordash://search?query=${encodeURIComponent(restaurantName)}`
      : `https://www.doordash.com/search/store/${encodeURIComponent(restaurantName)}/?lat=${location.lat}&lng=${location.lng}`;
  } else {
    // Direct to restaurant page
    url = appInstalled
      ? `doordash://store/${slug}`
      : `https://www.doordash.com/store/${slug}/`;
  }

  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error opening DoorDash:', error);
    // Fallback to web
    await Linking.openURL(`https://www.doordash.com/search/store/${encodeURIComponent(restaurantName)}/`);
    return true;
  }
}

/**
 * Open Uber Eats to a specific restaurant
 * @param {string} restaurantName - Restaurant name or ID
 * @param {Object} location - Optional {lat, lng} for nearest location
 */
export async function openUberEats(restaurantName, location = null) {
  const normalizedName = restaurantName.toLowerCase().replace(/[^a-z]/g, '');
  const slug = UBEREATS_SLUGS[normalizedName] || normalizedName;

  // Try Uber Eats app first
  const appScheme = 'ubereats://';
  const appInstalled = await isAppInstalled(appScheme);

  let url;
  if (appInstalled) {
    url = `ubereats://search?q=${encodeURIComponent(restaurantName)}`;
  } else {
    url = `https://www.ubereats.com/search?q=${encodeURIComponent(restaurantName)}`;
  }

  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error opening Uber Eats:', error);
    // Fallback to web
    await Linking.openURL(`https://www.ubereats.com/search?q=${encodeURIComponent(restaurantName)}`);
    return true;
  }
}

/**
 * Open Maps to restaurant location
 * @param {string} restaurantName - Restaurant name
 * @param {Object} location - Optional {lat, lng}
 */
export async function openMaps(restaurantName, location = null) {
  let url;

  if (Platform.OS === 'ios') {
    if (location?.lat && location?.lng) {
      url = `maps://?q=${encodeURIComponent(restaurantName)}&ll=${location.lat},${location.lng}`;
    } else {
      url = `maps://?q=${encodeURIComponent(restaurantName)}`;
    }
  } else {
    if (location?.lat && location?.lng) {
      url = `geo:${location.lat},${location.lng}?q=${encodeURIComponent(restaurantName)}`;
    } else {
      url = `geo:0,0?q=${encodeURIComponent(restaurantName)}`;
    }
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback to Google Maps web
      await Linking.openURL(
        `https://www.google.com/maps/search/${encodeURIComponent(restaurantName)}`
      );
    }
    return true;
  } catch (error) {
    console.error('Error opening maps:', error);
    return false;
  }
}

/**
 * Copy order details to clipboard
 * @param {Array} items - Array of item objects with name and customizations
 */
export async function copyOrderToClipboard(items) {
  const orderText = items
    .map((item) => {
      let text = `- ${item.name}`;
      if (item.customizations && item.customizations.length > 0) {
        text += `\n  ${item.customizations.join(', ')}`;
      }
      return text;
    })
    .join('\n');

  try {
    await Clipboard.setStringAsync(orderText);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Get available ordering options for a restaurant
 */
export async function getOrderingOptions(restaurantName) {
  const options = [];

  // Check DoorDash
  const doordashInstalled = await isAppInstalled('doordash://');
  options.push({
    id: 'doordash',
    name: 'DoorDash',
    available: true,
    appInstalled: doordashInstalled,
    icon: 'receipt-outline',
  });

  // Check Uber Eats
  const uberEatsInstalled = await isAppInstalled('ubereats://');
  options.push({
    id: 'ubereats',
    name: 'Uber Eats',
    available: true,
    appInstalled: uberEatsInstalled,
    icon: 'car-outline',
  });

  // Maps always available
  options.push({
    id: 'maps',
    name: 'Get Directions',
    available: true,
    appInstalled: true,
    icon: 'navigate-outline',
  });

  return options;
}

/**
 * Open ordering app based on user selection
 */
export async function openOrderingApp(appId, restaurantName, location = null) {
  switch (appId) {
    case 'doordash':
      return openDoorDash(restaurantName, location);
    case 'ubereats':
      return openUberEats(restaurantName, location);
    case 'maps':
      return openMaps(restaurantName, location);
    default:
      return false;
  }
}
