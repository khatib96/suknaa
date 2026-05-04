/**
 * Mock listings for Phase 1 — both Real Estate properties and Hospitality
 * hotels. The two are intentionally kept as separate types and arrays:
 * mixing them at the data layer would defeat the dual-system architecture.
 *
 * In Phase 3+ these come from the API:
 *   - Properties: GET /v1/properties + /v1/properties/:id
 *   - Hotels:     GET /v1/hotels      + /v1/hotels/:id
 */

import {
  SAMPLE_NEARBY_DAMASCUS,
  SAMPLE_NEARBY_LATAKIA,
  type NearbyAttraction,
} from "@/data/nearby-attractions";
import {
  GOVERNORATE_LABELS,
  type GovernorateId,
} from "@/data/syrian-governorates";

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export type CityId = GovernorateId;

export const CITY_LABELS = GOVERNORATE_LABELS;

// ---------------------------------------------------------------------------
// Real Estate (Airbnb-style)
// ---------------------------------------------------------------------------

export type PropertyType =
  | "house"
  | "apartment"
  | "villa"
  | "farm"
  | "cabin"
  | "chalet"
  | "studio";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "بيت",
  apartment: "شقة",
  villa: "فيلا",
  farm: "مزرعة",
  cabin: "كابينة",
  chalet: "شاليه",
  studio: "استوديو",
};

export type PropertyListing = {
  id: string;
  type: PropertyType;
  title: string;
  description: string;
  cityId: CityId;
  /** Neighbourhood / district shown next to the city */
  neighbourhood: string;
  /** Approximate display address (precise address hidden until booking). */
  approximateAddress: string;
  /** Latitude/longitude (rough) — for map display */
  lat: number;
  lng: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  /** Base nightly price in USD (what the host wrote — see PAYMENT_SYSTEM.md). */
  basePriceUsd: number;
  rating: number;
  reviewsCount: number;
  /** Cover + extra images */
  images: string[];
  /** Amenity ids (see data/amenities.ts) */
  amenityIds: string[];
  /** Public host slug (used by /host/[slug] later in Phase 1.5) */
  hostSlug: string;
  hostDisplayName: string;
  /** Mock list of nearby attractions */
  nearby: NearbyAttraction[];
};

const propertyImage1 =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80";
const propertyImage2 =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80";
const propertyImage3 =
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1400&q=80";
const propertyImage4 =
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80";
const propertyImage5 =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80";
const propertyImage6 =
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=80";
const propertyImage7 =
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80";
const propertyImage8 =
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=80";

export const PROPERTIES: PropertyListing[] = [
  {
    id: "prop-1",
    type: "villa",
    title: "فيلا فاخرة بإطلالة بانورامية",
    description:
      "فيلا حديثة في حي أبو رمانة بإطلالة كاملة على دمشق. مساحات واسعة، إضاءة طبيعية وفيرة، وحديقة خاصة مع مسبح صغير. مناسبة للعائلات والاجتماعات.",
    cityId: "damascus",
    neighbourhood: "أبو رمانة",
    approximateAddress: "حي أبو رمانة، دمشق",
    lat: 33.516,
    lng: 36.291,
    guests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 3,
    basePriceUsd: 95,
    rating: 4.9,
    reviewsCount: 128,
    images: [propertyImage1, propertyImage5, propertyImage6, propertyImage8],
    amenityIds: ["wifi", "parking", "ac", "pool", "kitchen", "garden", "barbecue"],
    hostSlug: "abu-omar",
    hostDisplayName: "أبو عمر",
    nearby: SAMPLE_NEARBY_DAMASCUS,
  },
  {
    id: "prop-2",
    type: "apartment",
    title: "شقة عصرية قريبة من المركز",
    description:
      "شقة حديثة بطابقين في المشروع السابع باللاذقية. قريبة من البحر والمطاعم. مناسبة لزوجين أو عائلة صغيرة.",
    cityId: "latakia",
    neighbourhood: "المشروع السابع",
    approximateAddress: "المشروع السابع، اللاذقية",
    lat: 35.522,
    lng: 35.793,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    basePriceUsd: 52,
    rating: 4.7,
    reviewsCount: 64,
    images: [propertyImage2, propertyImage4, propertyImage7],
    amenityIds: ["wifi", "ac", "kitchen", "washing-machine"],
    hostSlug: "rana",
    hostDisplayName: "رنا",
    nearby: SAMPLE_NEARBY_LATAKIA,
  },
  {
    id: "prop-3",
    type: "chalet",
    title: "شاليه على البحر مباشرة",
    description:
      "شاليه دافئ على شاطئ خاص في طرطوس. تصميم خشبي ريفي مع شرفة بحرية. مثالي لقضاء عطلة نهاية الأسبوع.",
    cityId: "tartus",
    neighbourhood: "الساحل",
    approximateAddress: "منطقة الساحل، طرطوس",
    lat: 34.889,
    lng: 35.886,
    guests: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 1,
    basePriceUsd: 68,
    rating: 4.8,
    reviewsCount: 41,
    images: [propertyImage3, propertyImage5, propertyImage6],
    amenityIds: ["wifi", "ac", "kitchen", "barbecue", "pets"],
    hostSlug: "abu-yamen",
    hostDisplayName: "أبو يامن",
    nearby: SAMPLE_NEARBY_LATAKIA,
  },
  {
    id: "prop-4",
    type: "house",
    title: "بيت دمشقي تراثي بفناء داخلي",
    description:
      "بيت عربي أصيل في دمشق القديمة، فناء داخلي مع نافورة وأشجار ياسمين. تجربة سكن غير اعتيادية في قلب المدينة العتيقة.",
    cityId: "damascus",
    neighbourhood: "دمشق القديمة",
    approximateAddress: "دمشق القديمة",
    lat: 33.511,
    lng: 36.306,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    basePriceUsd: 75,
    rating: 4.95,
    reviewsCount: 92,
    images: [propertyImage7, propertyImage1, propertyImage6],
    amenityIds: ["wifi", "ac", "kitchen", "garden"],
    hostSlug: "office-cham",
    hostDisplayName: "مكتب الشام العقاري",
    nearby: SAMPLE_NEARBY_DAMASCUS,
  },
  {
    id: "prop-5",
    type: "farm",
    title: "مزرعة في ريف الزبداني",
    description:
      "مزرعة هادئة بين الجبال، أشجار مثمرة، شواء، وموقد حطب. مكان مثالي للهروب من ضجيج المدينة.",
    cityId: "rif_dimashq",
    neighbourhood: "الريف",
    approximateAddress: "الزبداني، ريف دمشق",
    lat: 33.722,
    lng: 36.105,
    guests: 10,
    bedrooms: 3,
    beds: 6,
    bathrooms: 2,
    basePriceUsd: 110,
    rating: 4.85,
    reviewsCount: 35,
    images: [propertyImage8, propertyImage3, propertyImage5],
    amenityIds: ["parking", "barbecue", "garden", "pets"],
    hostSlug: "abu-salim",
    hostDisplayName: "أبو سليم",
    nearby: SAMPLE_NEARBY_DAMASCUS,
  },
  {
    id: "prop-6",
    type: "studio",
    title: "استوديو للعمل عن بُعد",
    description:
      "استوديو مدمج بإنترنت سريع، مكتب مريح، ومطبخ صغير. مناسب للمسافرين في رحلات عمل قصيرة.",
    cityId: "damascus",
    neighbourhood: "المالكي",
    approximateAddress: "المالكي، دمشق",
    lat: 33.518,
    lng: 36.281,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    basePriceUsd: 38,
    rating: 4.6,
    reviewsCount: 28,
    images: [propertyImage4, propertyImage2],
    amenityIds: ["wifi", "ac", "kitchen", "washing-machine"],
    hostSlug: "rana",
    hostDisplayName: "رنا",
    nearby: SAMPLE_NEARBY_DAMASCUS,
  },
];

export function findProperty(id: string): PropertyListing | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Hospitality (Booking-style)
// ---------------------------------------------------------------------------

export type HotelType = "hotel" | "hotel-apartment" | "resort" | "hostel";

export const HOTEL_TYPE_LABELS: Record<HotelType, string> = {
  hotel: "فندق",
  "hotel-apartment": "شقة فندقية",
  resort: "منتجع",
  hostel: "هوستل",
};

export type HotelListing = {
  id: string;
  type: HotelType;
  title: string;
  description: string;
  cityId: CityId;
  /** Hotels show precise addresses always (per project rules). */
  preciseAddress: string;
  lat: number;
  lng: number;
  /** 1-5 stars */
  stars: number;
  /** Score out of 10, Booking style */
  score: number;
  reviewsCount: number;
  images: string[];
  amenityIds: string[];
  /** Hospitality hosts are companies — display name for the company. */
  hostSlug: string;
  hostDisplayName: string;
  /** Cheapest visible nightly rate across all room types in USD */
  fromPriceUsd: number;
  /** Whether the hotel includes breakfast in *some* room types */
  breakfastAvailable: boolean;
  nearby: NearbyAttraction[];
};

const hotelImage1 =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80";
const hotelImage2 =
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80";
const hotelImage3 =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80";
const hotelImage4 =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80";
const hotelImage5 =
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80";

export const HOTELS: HotelListing[] = [
  {
    id: "hotel-1",
    type: "hotel",
    title: "فندق البحر الكبير",
    description:
      "فندق راقٍ على كورنيش اللاذقية بإطلالة مباشرة على البحر. مطبخ شامي وعالمي، وخدمة استقبال على مدار الساعة.",
    cityId: "latakia",
    preciseAddress: "كورنيش اللاذقية، اللاذقية، سوريا",
    lat: 35.5163,
    lng: 35.7813,
    stars: 4,
    score: 8.9,
    reviewsCount: 412,
    images: [hotelImage1, hotelImage3, hotelImage4],
    amenityIds: ["wifi", "ac", "pool", "breakfast", "reception24", "restaurant", "gym"],
    hostSlug: "blue-coast-hospitality",
    hostDisplayName: "Blue Coast Hospitality",
    fromPriceUsd: 78,
    breakfastAvailable: true,
    nearby: SAMPLE_NEARBY_LATAKIA,
  },
  {
    id: "hotel-2",
    type: "resort",
    title: "منتجع الشاطئ الذهبي",
    description:
      "منتجع ساحلي شامل بمسابح خارجية وداخلية ومطاعم متعددة. تجربة فاخرة على شاطئ طرطوس.",
    cityId: "tartus",
    preciseAddress: "ساحل طرطوس، الطريق العام",
    lat: 34.8895,
    lng: 35.886,
    stars: 5,
    score: 9.2,
    reviewsCount: 287,
    images: [hotelImage2, hotelImage4, hotelImage5],
    amenityIds: ["wifi", "ac", "pool", "breakfast", "reception24", "restaurant", "gym", "spa"],
    hostSlug: "golden-beach-group",
    hostDisplayName: "Golden Beach Group",
    fromPriceUsd: 120,
    breakfastAvailable: true,
    nearby: SAMPLE_NEARBY_LATAKIA,
  },
  {
    id: "hotel-3",
    type: "hotel-apartment",
    title: "شقق المالكي الفندقية",
    description:
      "شقق فندقية مفروشة بالكامل في قلب دمشق. مناسبة للإقامات الطويلة مع خدمات فندقية يومية.",
    cityId: "damascus",
    preciseAddress: "حي المالكي، دمشق، سوريا",
    lat: 33.5183,
    lng: 36.281,
    stars: 4,
    score: 8.6,
    reviewsCount: 156,
    images: [hotelImage3, hotelImage1, hotelImage5],
    amenityIds: ["wifi", "ac", "reception24", "parking"],
    hostSlug: "malki-suites",
    hostDisplayName: "Malki Suites",
    fromPriceUsd: 65,
    breakfastAvailable: false,
    nearby: SAMPLE_NEARBY_DAMASCUS,
  },
  {
    id: "hotel-4",
    type: "hostel",
    title: "نزل دمشق القديمة",
    description:
      "هوستل اقتصادي وهادئ في قلب دمشق القديمة. مناسب للمسافرين الباحثين عن تجربة محلية أصيلة.",
    cityId: "damascus",
    preciseAddress: "حي العمارة، دمشق القديمة",
    lat: 33.511,
    lng: 36.306,
    stars: 2,
    score: 8.3,
    reviewsCount: 98,
    images: [hotelImage4, hotelImage5],
    amenityIds: ["wifi", "breakfast", "reception24"],
    hostSlug: "old-damascus-hostel",
    hostDisplayName: "Old Damascus Hostel",
    fromPriceUsd: 22,
    breakfastAvailable: true,
    nearby: SAMPLE_NEARBY_DAMASCUS,
  },
];

export function findHotel(id: string): HotelListing | undefined {
  return HOTELS.find((h) => h.id === id);
}
