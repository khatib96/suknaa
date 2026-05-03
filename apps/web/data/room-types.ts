/**
 * Room types per hotel — the *defining* data structure of the Hospitality
 * domain (Booking-style). Each hotel has 3-5 room types; each type has a
 * `totalUnits` count and a real-time `availableUnits` (mocked here, served
 * by the inventory engine in Phase 4).
 *
 * Maps `hotelId → roomTypes[]`. Production source: `room_types` table.
 */

export type RoomTypeBedConfig = string;

export type RoomType = {
  id: string;
  /** Short display name like "Standard Double" or "Family Suite" */
  name: string;
  /** Short Arabic description */
  description: string;
  /** Maximum occupancy across adults+children */
  maxOccupancy: number;
  bedConfig: RoomTypeBedConfig;
  /** Total physical units of this type */
  totalUnits: number;
  /** Mock availability for the next viewable date range */
  availableUnits: number;
  /** Nightly price in USD shown to the guest */
  nightlyPriceUsd: number;
  /** Whether breakfast is included in this room type */
  breakfastIncluded: boolean;
  /** Free or non-refundable */
  isRefundable: boolean;
  images: string[];
  amenityIds: string[];
};

const roomImg1 =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80";
const roomImg2 =
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80";
const roomImg3 =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80";
const roomImg4 =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80";
const roomImg5 =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80";

export const ROOM_TYPES: Record<string, RoomType[]> = {
  "hotel-1": [
    {
      id: "hotel-1-rt-1",
      name: "غرفة قياسية مزدوجة",
      description: "غرفة بسرير مزدوج، إطلالة جانبية، حمام كامل وخدمات يومية.",
      maxOccupancy: 2,
      bedConfig: "سرير مزدوج ×1",
      totalUnits: 12,
      availableUnits: 5,
      nightlyPriceUsd: 78,
      breakfastIncluded: true,
      isRefundable: true,
      images: [roomImg1, roomImg2],
      amenityIds: ["wifi", "ac", "breakfast"],
    },
    {
      id: "hotel-1-rt-2",
      name: "غرفة بإطلالة بحرية",
      description: "غرفة فسيحة مع شرفة مطلة على البحر مباشرة.",
      maxOccupancy: 3,
      bedConfig: "سرير ملكي ×1",
      totalUnits: 8,
      availableUnits: 2,
      nightlyPriceUsd: 110,
      breakfastIncluded: true,
      isRefundable: true,
      images: [roomImg3, roomImg4],
      amenityIds: ["wifi", "ac", "breakfast"],
    },
    {
      id: "hotel-1-rt-3",
      name: "جناح عائلي",
      description: "جناح بغرفتين متصلتين، حمامين، وصالة جلوس صغيرة.",
      maxOccupancy: 5,
      bedConfig: "سرير ملكي ×1 + سريرين فرديين",
      totalUnits: 4,
      availableUnits: 1,
      nightlyPriceUsd: 165,
      breakfastIncluded: true,
      isRefundable: false,
      images: [roomImg5, roomImg1],
      amenityIds: ["wifi", "ac", "breakfast"],
    },
  ],
  "hotel-2": [
    {
      id: "hotel-2-rt-1",
      name: "غرفة كلاسيكية",
      description: "غرفة فسيحة بسرير ملكي وإطلالة على المسبح.",
      maxOccupancy: 2,
      bedConfig: "سرير ملكي ×1",
      totalUnits: 20,
      availableUnits: 7,
      nightlyPriceUsd: 120,
      breakfastIncluded: true,
      isRefundable: true,
      images: [roomImg1, roomImg3],
      amenityIds: ["wifi", "ac", "breakfast"],
    },
    {
      id: "hotel-2-rt-2",
      name: "بنغلو شاطئي",
      description: "بنغلو خاص قبالة الشاطئ، دش خارجي وتراس خصوصي.",
      maxOccupancy: 4,
      bedConfig: "سرير ملكي ×1 + أريكة قابلة للسحب",
      totalUnits: 10,
      availableUnits: 3,
      nightlyPriceUsd: 220,
      breakfastIncluded: true,
      isRefundable: false,
      images: [roomImg2, roomImg4],
      amenityIds: ["wifi", "ac", "breakfast"],
    },
    {
      id: "hotel-2-rt-3",
      name: "جناح المنتجع",
      description: "أكبر جناح في المنتجع بحوض جاكوزي خاص وخدمة كونسيرج.",
      maxOccupancy: 4,
      bedConfig: "سرير ملكي ×2",
      totalUnits: 5,
      availableUnits: 0,
      nightlyPriceUsd: 380,
      breakfastIncluded: true,
      isRefundable: false,
      images: [roomImg5, roomImg3],
      amenityIds: ["wifi", "ac", "breakfast"],
    },
  ],
  "hotel-3": [
    {
      id: "hotel-3-rt-1",
      name: "استوديو فندقي",
      description: "استوديو مفروش بغرفة استقبال صغيرة ومطبخ مدمج.",
      maxOccupancy: 2,
      bedConfig: "سرير مزدوج ×1",
      totalUnits: 14,
      availableUnits: 6,
      nightlyPriceUsd: 65,
      breakfastIncluded: false,
      isRefundable: true,
      images: [roomImg1, roomImg5],
      amenityIds: ["wifi", "ac", "kitchen"],
    },
    {
      id: "hotel-3-rt-2",
      name: "شقة بغرفة نوم واحدة",
      description: "شقة كاملة بمطبخ مجهز وغرفة جلوس منفصلة.",
      maxOccupancy: 3,
      bedConfig: "سرير ملكي ×1 + أريكة سرير",
      totalUnits: 10,
      availableUnits: 4,
      nightlyPriceUsd: 95,
      breakfastIncluded: false,
      isRefundable: true,
      images: [roomImg2, roomImg4],
      amenityIds: ["wifi", "ac", "kitchen"],
    },
  ],
  "hotel-4": [
    {
      id: "hotel-4-rt-1",
      name: "سرير في غرفة مشتركة",
      description: "سرير في غرفة مشتركة بـ 6 أسرّة، إطلالة على الفناء.",
      maxOccupancy: 1,
      bedConfig: "سرير دورين فردي ×1",
      totalUnits: 18,
      availableUnits: 11,
      nightlyPriceUsd: 22,
      breakfastIncluded: true,
      isRefundable: true,
      images: [roomImg5],
      amenityIds: ["wifi", "breakfast"],
    },
    {
      id: "hotel-4-rt-2",
      name: "غرفة خاصة مزدوجة",
      description: "غرفة خاصة بسرير مزدوج وحمام مشترك مع الطابق.",
      maxOccupancy: 2,
      bedConfig: "سرير مزدوج ×1",
      totalUnits: 6,
      availableUnits: 2,
      nightlyPriceUsd: 45,
      breakfastIncluded: true,
      isRefundable: true,
      images: [roomImg1, roomImg2],
      amenityIds: ["wifi", "breakfast"],
    },
  ],
};

export function getRoomTypes(hotelId: string): RoomType[] {
  return ROOM_TYPES[hotelId] ?? [];
}
