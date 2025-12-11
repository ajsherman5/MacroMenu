# MacroMenu - Project Context & Development Notes

## Project Overview
MacroMenu is a React Native (Expo) app that helps users find restaurant meals that match their fitness goals (bulk, cut, maintain). The app provides personalized meal recommendations with macro information.

## Current State
- **Onboarding flow:** Complete (~20 screens)
- **UI:** Polished with animations, consistent green (#4ADE80) accent color
- **Restaurant logos:** 8 premium casual chains (Chipotle, Shake Shack, Jersey Mike's, Whataburger, Buffalo Wild Wings, Sonic, Chick-fil-A, CAVA)

## Goal-Specific Features
HardestPartScreen shows different text based on user's goal:
- **Bulk:** "Finding high-calorie affordable meals"
- **Cut:** "Finding low-calorie affordable meals"
- **Maintain:** "Finding calorie-conscious affordable meals"

---

## Competitor Analysis: MenuFit

### What They Do Well
1. **AI-Generated Meal Images** - Consistent style, clean backgrounds, professional presentation
2. **Custom Meal Names** - "Bulking Bowl", "Muscle Wrap Burrito", "Hard Gainer: Power Beast"
3. **Goal-Themed Descriptions** - LLM-generated motivating copy
4. **Match Scores** - 96-98 badges showing how well meal fits user's macros
5. **Smart Meal Combos** - Combines menu items to hit macro targets

### Their Image Strategy
- **Major chains:** AI-generated/enhanced meal photos (likely batch-generated, ~500-1000 images)
- **Local restaurants:** Google Places API photos (storefronts)
- NOT generating 22M images - using templates and smart caching

### Their Ordering Flow
- Links to DoorDash, restaurant website, or Apple Maps directions
- Currently broken: sends to App Store even when app installed (we can do better)
- Likely earning affiliate commission (2-5% per order)

---

## Our MVP Strategy

### Phase 1: Core Features (Weekend Sprint Goal)
- [ ] Restaurant menu database/API integration
- [ ] Meal recommendation engine based on user goals
- [ ] Nutrition data display (calories, protein, carbs, fats)
- [ ] Search and filtering

### Phase 2: Polish
- [ ] User accounts & data persistence
- [ ] Favorites system
- [ ] Premium animations and transitions

### Phase 3: Monetization
- [ ] DoorDash/Uber Eats affiliate integration
- [ ] Deep linking to specific restaurants (not homepage)

---

## Technical Decisions

### Restaurant Data Sources
- **Google Places API** - For local restaurants, photos, locations
- **Nutritionix or similar** - For menu/nutrition data
- **Manual curation** - Top 100-200 chains with quality data

### Image Strategy
1. **Major chains (top 100-200):** Curated logos, potentially AI-enhanced meal photos later
2. **Local restaurants:** Google Places photos in styled frames
3. **Fallback:** Category icons with restaurant name

### Deep Linking (Better than Competitor)
```
// Send users directly to restaurant in DoorDash app:
https://www.doordash.com/store/{store-slug}/

// Location-aware (finds nearest):
https://www.doordash.com/search/store/{restaurant-name}/?lat={lat}&lng={lng}
```

### Cart Limitation
- DoorDash/Uber Eats don't allow cart injection via public API
- Best we can do: Deep link to restaurant + show "Copy Order" with exact items
- Future: Apply for Partner API access once we have volume

---

## Ordering UX (MVP)
```
┌─────────────────────────────────────┐
│  Bulking Bowl - Chipotle            │
│  ⭐ 96 Match Score                  │
│                                     │
│  Your order:                        │
│  • Burrito Bowl                     │
│  • Double chicken (+$3.50)          │
│  • White rice                       │
│  • Black beans                      │
│  • Fajita veggies                   │
│  • Guac                             │
│                                     │
│  [Copy Order]  [Open DoorDash]      │
└─────────────────────────────────────┘
```

---

## Monetization Model
| Action | Revenue |
|--------|---------|
| Order via DoorDash affiliate link | ~$1-3 per order |
| Order via Uber Eats affiliate link | ~$1-3 per order |
| Premium subscription (future) | TBD |

---

## Timeline Estimate
- **MVP:** End of weekend (aggressive goal)
- **Full launch:** 4-6 weeks
- **With beta testing:** 6-8 weeks

---

## Commands

### Run the app
```bash
cd /Users/ajsherman/PycharmProjects/MacroMenu/MacroMenu && npx expo start
# If port 8081 busy:
cd /Users/ajsherman/PycharmProjects/MacroMenu/MacroMenu && npx expo start --port 8083
```

### Git workflow
```bash
cd /Users/ajsherman/PycharmProjects/MacroMenu
git add .
git commit -m "Your message"
git push origin main
```

---

## Files Modified This Session
- `MacroMenu/src/screens/onboarding/HardestPartScreen.js` - Goal-specific calorie text
- `MacroMenu/src/screens/onboarding/EveryRestaurantScreen.js` - Updated restaurant logos
- `MacroMenu/assets/logos/` - Added 8 new restaurant logos

---

## Next Session Priorities
1. Google Places API integration for restaurant data
2. Meal recommendation algorithm
3. Main app screens (post-onboarding)
4. Deep linking to DoorDash/Uber Eats
5. Premium loading animations

---

*Last updated: December 11, 2025*
