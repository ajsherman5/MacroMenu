# MacroMenu - Project Context & Development Notes

## Project Overview
MacroMenu is a React Native (Expo) app that helps users find restaurant meals that match their fitness goals (bulk, cut, maintain). The app provides personalized meal recommendations with macro information.

## Current State (December 11, 2025)
- **Onboarding flow:** Complete (28 screens) - All connected to OnboardingContext
- **Main App:** 6 screens fully functional with real data
- **UI:** Polished with animations, consistent green (#4ADE80) accent color
- **Restaurant logos:** 8 premium casual chains
- **Authentication:** Supabase Auth (email/password, guest mode)
- **API:** Nutritionix integration for menu/nutrition data
- **Match Score:** Algorithm ranking meals by user goals

---

## Implementation Progress

### Completed Phases

#### Phase 1: Foundation
- [x] React Context (UserContext, OnboardingContext, AuthContext)
- [x] AsyncStorage for local persistence
- [x] App.js wrapped with providers

#### Phase 2: Authentication
- [x] Supabase client configuration
- [x] Email/password sign in/up
- [x] Guest mode ("Skip for now")
- [x] expo-secure-store for token storage

#### Phase 3: Nutritionix API
- [x] API client with branded food search
- [x] Menu item search by restaurant
- [x] Response caching with TTL
- [x] POPULAR_BRANDS mapping

#### Phase 4: Match Score Algorithm
- [x] TDEE/BMR calculation (Mifflin-St Jeor)
- [x] Daily/per-meal macro targets
- [x] Score breakdown: calories (30%), protein (35%), macroBalance (20%), preferences (15%)
- [x] Allergen disqualification

#### Phase 5: Screen Integration
- [x] All 15 onboarding screens save to OnboardingContext
- [x] HomeScreen: Dynamic greeting, user macros, favorites, recent restaurants
- [x] RestaurantResultsScreen: Nutritionix search, category filtering
- [x] RestaurantDetailScreen: API menu items, ranked by match score
- [x] MealDetailScreen: Daily fit calculation, ordering modal, healthify tips
- [x] ProfileScreen: User stats, logout, reset profile

#### Phase 6: Deep Linking
- [x] DoorDash app/web deep links
- [x] Uber Eats app/web deep links
- [x] Apple/Google Maps directions
- [x] Copy order to clipboard

### Pending Phases
- [ ] Phase 7: RevenueCat subscriptions
- [ ] Phase 8: App Store preparation

---

## Key Files Created

### Context (`src/context/`)
- `UserContext.js` - User profile, macros, preferences, recent restaurants
- `OnboardingContext.js` - Temporary data during onboarding flow
- `AuthContext.js` - Supabase auth state management
- `index.js` - Exports all contexts

### Services (`src/services/`)
- `supabase/config.js` - Supabase client with SecureStore adapter
- `supabase/auth.js` - Auth methods (signIn, signUp, signOut, etc.)
- `api/nutritionix.js` - Nutritionix API client
- `api/cache.js` - Response caching utilities
- `deepLink.js` - DoorDash, Uber Eats, Maps deep linking

### Utils (`src/utils/`)
- `macroCalculator.js` - TDEE, BMR, macro calculations
- `matchScore.js` - Meal ranking algorithm

### Environment
- `.env.example` - Template for API keys

---

## Goal-Specific Features
HardestPartScreen shows different text based on user's goal:
- **Bulk:** "Finding high-calorie affordable meals"
- **Cut:** "Finding low-calorie affordable meals"
- **Maintain:** "Finding calorie-conscious affordable meals"

MealDetailScreen tips change based on goal:
- **Bulk:** "Add double protein", "Add extra rice/bread"
- **Cut:** "Ask for no rice/bread", "Request light/no sauce"
- **Maintain:** "Add grilled chicken", "Dressing on the side"

---

## Technical Decisions

### Authentication
- **Supabase** for auth and future database
- expo-secure-store for secure token storage
- Guest mode allows app usage without account

### Restaurant Data
- **Nutritionix API** for branded food data (free tier: 500 calls/day)
- Local caching to reduce API calls
- Popular restaurants hardcoded as fallback

### Match Score Algorithm
Weighted scoring:
- Calories: 30% (within 10% = 100 score)
- Protein: 35% (most important for fitness)
- Macro Balance: 20% (ideal ranges check)
- Preferences: 15% (likes boost, dislikes penalize, allergens disqualify)

### Deep Linking
```javascript
// DoorDash app (if installed)
doordash://store/{slug}
doordash://search?query={restaurant}

// DoorDash web fallback
https://www.doordash.com/store/{slug}/

// Uber Eats
ubereats://search?q={restaurant}
https://www.ubereats.com/search?q={restaurant}
```

---

## Commands

### Run the app
```bash
cd "C:\Users\AJ Sherman\PycharmProjects\macromenu\MacroMenu" && npx expo start --tunnel
```

### Git workflow
```bash
cd "C:\Users\AJ Sherman\PycharmProjects\macromenu"
git add .
git commit -m "Your message"
git push origin main
```

---

## Dependencies Added
```json
{
  "@react-native-async-storage/async-storage": "2.1.0",
  "@supabase/supabase-js": "^2.x",
  "expo-secure-store": "~14.0.0",
  "expo-clipboard": "~7.0.0"
}
```

---

## Session Log

### December 11, 2025 (Latest Session)
Major implementation sprint completing Phases 1-6:

1. **Context Setup**
   - Created UserContext, OnboardingContext, AuthContext
   - Wrapped App.js with providers
   - AsyncStorage for persistence

2. **Supabase Auth**
   - Set up Supabase client with SecureStore
   - Implemented SignInScreen with email/password
   - Added guest mode and auth state management

3. **Nutritionix API**
   - Created API client for branded food search
   - Added caching layer with TTL
   - Implemented searchMenuItems for restaurant menus

4. **Match Score Algorithm**
   - Built macro calculator (TDEE, BMR, daily/per-meal targets)
   - Created match score with weighted breakdown
   - Added preference matching and allergen filtering

5. **Onboarding Integration**
   - Connected all 15 onboarding screens to context
   - Each screen saves appropriate data on navigation

6. **Main Screens Overhaul**
   - HomeScreen: User data, dynamic greeting, macro display
   - RestaurantResultsScreen: Real search, category filters
   - RestaurantDetailScreen: API menus, ranked by match score
   - MealDetailScreen: Daily fit, ordering, tips
   - ProfileScreen: Stats, logout, reset

7. **Deep Linking**
   - DoorDash/Uber Eats app detection
   - Web fallbacks
   - Copy order to clipboard

### Previous Sessions
- Fixed TimelineScreen custom button scroll issue
- Replaced "Browse by Category" chips with feature highlight cards
- Researched health app integrations (MFP not feasible)
- Planned MyFitnessPal workaround (clipboard + deep link)

---

## Next Steps
1. **Phase 7: RevenueCat** - Subscription management
2. **Phase 8: App Store** - Icons, screenshots, TestFlight, submission

---

*Last updated: December 11, 2025*
