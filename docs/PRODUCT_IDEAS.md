# Product Ideas Backlog

> Last updated: 2026-05-08
>
> This file captures product ideas that should influence the long-term roadmap, but are not automatically in scope for the current engineering phase. Move an idea into `BUILD_PLAN.md` only when we are ready to implement it end-to-end.

## Prioritization Rule

- Phase 3-5 must stay focused on real listings, search, bookings, and payments.
- Ideas below can be designed early, but should not delay the core marketplace.
- AI features must use verified Suknaa data, explicit user constraints, and clear fallback behavior. They must not invent availability, prices, ratings, or tourist facts.

## 1. Discover Syria

**Working route:** `/discover`

Build a tourism content layer that makes Suknaa useful even before the user knows where they want to stay.

Core idea:
- City guides for Syrian destinations.
- Landmarks, historical places, beaches, mountains, markets, family activities, and cultural stories.
- Restaurant and cafe recommendations.
- Local stories and editorial content that helps travelers understand the place, not just book accommodation.
- Direct links from each city/place/restaurant to nearby homes, hotels, and map results.

Restaurant rating idea:
- Create a Suknaa-owned rating system, for example `Suknaa Picks`, `Suknaa Stars`, or `Mukhtarat Suknaa`.
- Avoid implying affiliation with Michelin or copying its exact model.
- Ratings should be based on clear criteria: food quality, consistency, service, cleanliness, local character, value, and suitability for travelers.
- Early version can be curated manually by the Suknaa team.
- Later version can combine editorial reviews, guest feedback, reservation signals, and admin verification.

Possible content models:
- `discover_places`: city, landmark, neighborhood, beach, market, museum, religious site, nature area.
- `discover_restaurants`: cuisine, price level, opening hours, coordinates, editorial rating, traveler notes.
- `discover_stories`: articles and local guides.
- `discover_collections`: "Weekend in Latakia", "Old Damascus walk", "Family trip to Tartus".

Suggested phase:
- MVP content pages can start after Phase 3/4 data exists.
- Full map-connected discovery belongs around Phase 8 or Phase 11 growth.

## 2. Trips Dashboard

**Working route:** `/dashboard/trips`

Guest-facing "My Trips" area inspired by Airbnb-style trip management.

Core idea:
- Show upcoming, current, past, cancelled, and pending-payment trips.
- Each trip shows booking status, accommodation, dates, guests, payment status, host/hotel contact rules, invoice, and check-in instructions.
- After checkout, prompt for reviews.
- Trips can include vacation-rental (whole-unit) stays, hotel stays, or eventually multi-city plans.

Minimum useful version:
- After Phase 5 booking system: show confirmed and pending bookings.
- After Phase 6 chat/reviews: connect messages, review prompts, and notifications.

Suggested phase:
- Phase 5 for booking confirmation and invoice pages.
- Phase 6 for full guest dashboard experience.

## 3. Multi-City Trip Planner

**Working route ideas:** `/trips/plan`, `/search/multi-city`

Allow a guest to plan one journey across multiple Syrian cities in one flow.

Examples:
- "I want Damascus, Homs, and Latakia for 10 days."
- "Family trip from Aleppo to the coast with 2 nights in each city."
- "Find me affordable stays in more than one city during Eid."

Core behavior:
- User enters cities, dates, guest count, budget, and preferences.
- System searches each city segment in one flow.
- Results are grouped by itinerary day/city instead of a single list.
- User can save the plan, compare options, share it with family, and book each segment.

Important constraints:
- Do not reserve multiple stays until payment/booking confirmation is explicit.
- Clearly show that each city segment has separate availability and cancellation rules.
- Handle gaps, overlaps, and travel-time warnings.

Suggested phase:
- Not before Phase 5, because it depends on real availability and bookings.
- Better fit for Phase 8 guest smart features after wishlists/comparisons exist.

## 4. AI Search And Travel Assistant

**Working surfaces:** search bar, chat panel, trip planner, support assistant.

Core idea:
- A conversational assistant helps guests search, compare prices, choose dates, understand areas, and build trip plans based on Suknaa data.
- It should answer from the database: listings, hotels, room types, prices, availability, reviews, nearby attractions, restaurant picks, and policies.

Example prompts:
- "I need a family place near the sea in Latakia for 4 people next weekend."
- "What is cheaper: Damascus for 5 nights or split Damascus and Homs?"
- "Plan a 7-day Syria trip with two cities and mid-range stays."
- "Show me hotels with breakfast and parking under my budget."

Architecture notes:
- Use structured search tools first, then natural-language explanation.
- Never let the model invent prices, availability, rules, ratings, or restaurant status.
- Every recommendation should be traceable to returned database records.
- Add guardrails for medical/legal/safety claims and travel-sensitive content.
- Log assistant queries for product improvement without storing secrets or unnecessary personal data.

Suggested phase:
- "Smart search input" can be prototyped as UI earlier with deterministic parsing.
- Real AI assistant should wait until Phase 8+, after real inventory, pricing, reviews, and attractions exist.

## 5. Strategic Value

These ideas make Suknaa more than a booking engine:
- Guests can discover Syria, not only search for a bed.
- Restaurants and local places increase SEO and repeat visits.
- Multi-city planning supports tourists and returning expatriates better than a normal rental marketplace.
- The AI assistant can become a real differentiator if it is grounded in live Suknaa data.

The risk is scope creep. The mitigation is to keep these as a documented backlog until the marketplace core is working.
