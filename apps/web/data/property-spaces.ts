/**
 * Per-room/space details for Real Estate properties (Airbnb-style).
 *
 * This is the *defining* difference between RE and Hospitality on the data
 * layer: properties have descriptive `property_spaces` with their own photos
 * and amenities; hotels have bookable `room_types` with inventory.
 *
 * Maps `propertyId → spaces[]`. In production this comes from the
 * `property_spaces` table (see docs/DATABASE_SCHEMA.md §B.2).
 */

export type SpaceKind =
  | "bedroom"
  | "bathroom"
  | "kitchen"
  | "living_room"
  | "garden"
  | "pool"
  | "terrace";

export const SPACE_LABELS: Record<SpaceKind, string> = {
  bedroom: "غرفة نوم",
  bathroom: "حمام",
  kitchen: "مطبخ",
  living_room: "صالة جلوس",
  garden: "حديقة",
  pool: "مسبح",
  terrace: "تراس",
};

export const SPACE_ICON_NAMES: Record<SpaceKind, string> = {
  bedroom: "BedDouble",
  bathroom: "Bath",
  kitchen: "Utensils",
  living_room: "Sofa",
  garden: "Trees",
  pool: "Waves",
  terrace: "Sun",
};

export type PropertySpace = {
  id: string;
  kind: SpaceKind;
  /** Display name (e.g. "غرفة النوم الرئيسية") */
  name: string;
  /** Short Arabic description */
  description: string;
  images: string[];
  /** Amenity ids that apply specifically to this space */
  amenityIds: string[];
  /** For bedrooms: bed configuration */
  bedConfig?: string;
};

const room1 =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";
const room2 =
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80";
const room3 =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80";
const bath1 =
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80";
const kitchen1 =
  "https://images.unsplash.com/photo-1556909114-44e3e9399a2b?auto=format&fit=crop&w=1200&q=80";
const livingRoom1 =
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80";
const garden1 =
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1200&q=80";

export const PROPERTY_SPACES: Record<string, PropertySpace[]> = {
  "prop-1": [
    {
      id: "prop-1-bed-master",
      kind: "bedroom",
      name: "غرفة النوم الرئيسية",
      description: "غرفة فسيحة بسرير ملكي وحمّام داخلي مع شرفة على المسبح.",
      images: [room1, room2],
      amenityIds: ["ac", "wifi"],
      bedConfig: "سرير ملكي ×1",
    },
    {
      id: "prop-1-bed-2",
      kind: "bedroom",
      name: "غرفة نوم 2",
      description: "غرفة بسريرين فرديين، خزانة كبيرة، وإطلالة على الحديقة.",
      images: [room2, room3],
      amenityIds: ["ac"],
      bedConfig: "سرير فردي ×2",
    },
    {
      id: "prop-1-bed-3",
      kind: "bedroom",
      name: "غرفة نوم 3",
      description: "غرفة هادئة بسرير مزدوج مناسبة للأطفال.",
      images: [room3],
      amenityIds: ["ac"],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-1-bath-1",
      kind: "bathroom",
      name: "الحمام الرئيسي",
      description: "حمام كامل مع جاكوزي ودش مطر.",
      images: [bath1],
      amenityIds: [],
    },
    {
      id: "prop-1-kitchen",
      kind: "kitchen",
      name: "المطبخ المفتوح",
      description: "مطبخ مجهز بالكامل: غسالة صحون، فرن، مايكرويف، وقهوة إسبريسو.",
      images: [kitchen1],
      amenityIds: ["kitchen", "washing-machine"],
    },
    {
      id: "prop-1-living",
      kind: "living_room",
      name: "صالة الجلوس",
      description: "صالة فسيحة مع تلفاز ذكي وشرفة بانورامية.",
      images: [livingRoom1],
      amenityIds: ["wifi", "ac"],
    },
    {
      id: "prop-1-garden",
      kind: "garden",
      name: "الحديقة",
      description: "حديقة خاصة مع مسبح صغير وركن شواء.",
      images: [garden1],
      amenityIds: ["pool", "barbecue", "garden"],
    },
  ],
  "prop-2": [
    {
      id: "prop-2-bed-1",
      kind: "bedroom",
      name: "غرفة النوم الأولى",
      description: "غرفة مشمسة بسرير مزدوج وإطلالة على البحر.",
      images: [room2],
      amenityIds: ["ac"],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-2-bed-2",
      kind: "bedroom",
      name: "غرفة النوم الثانية",
      description: "غرفة هادئة بسريرين فرديين.",
      images: [room3],
      amenityIds: ["ac"],
      bedConfig: "سرير فردي ×2",
    },
    {
      id: "prop-2-kitchen",
      kind: "kitchen",
      name: "المطبخ",
      description: "مطبخ صغير مجهز بكل الأساسيات.",
      images: [kitchen1],
      amenityIds: ["kitchen"],
    },
    {
      id: "prop-2-bath",
      kind: "bathroom",
      name: "الحمام",
      description: "حمام بسيط ونظيف مع دش حار.",
      images: [bath1],
      amenityIds: [],
    },
  ],
  "prop-3": [
    {
      id: "prop-3-bed-1",
      kind: "bedroom",
      name: "غرفة النوم الرئيسية",
      description: "غرفة بسرير مزدوج وشرفة بحرية.",
      images: [room1, room2],
      amenityIds: ["ac"],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-3-bed-2",
      kind: "bedroom",
      name: "غرفة الأطفال",
      description: "غرفة بسرير دورين وألعاب بسيطة.",
      images: [room3],
      amenityIds: [],
      bedConfig: "سرير دورين ×1",
    },
    {
      id: "prop-3-living",
      kind: "living_room",
      name: "الصالة",
      description: "صالة مفتوحة على الشرفة البحرية.",
      images: [livingRoom1],
      amenityIds: ["wifi"],
    },
    {
      id: "prop-3-terrace",
      kind: "terrace",
      name: "الشرفة البحرية",
      description: "شرفة كبيرة مع شواية وطاولة طعام.",
      images: [garden1],
      amenityIds: ["barbecue"],
    },
  ],
  "prop-4": [
    {
      id: "prop-4-bed-1",
      kind: "bedroom",
      name: "غرفة النوم الأولى",
      description: "غرفة تراثية بسرير خشبي ونوافذ مطلة على الفناء.",
      images: [room1],
      amenityIds: ["ac"],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-4-bed-2",
      kind: "bedroom",
      name: "غرفة النوم الثانية",
      description: "غرفة بسريرين فرديين وزخرفة دمشقية.",
      images: [room2],
      amenityIds: ["ac"],
      bedConfig: "سرير فردي ×2",
    },
    {
      id: "prop-4-bed-3",
      kind: "bedroom",
      name: "غرفة النوم الثالثة",
      description: "غرفة صغيرة هادئة.",
      images: [room3],
      amenityIds: [],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-4-garden",
      kind: "garden",
      name: "الفناء الداخلي",
      description: "فناء عربي تقليدي مع نافورة وأشجار ياسمين.",
      images: [garden1],
      amenityIds: ["garden"],
    },
  ],
  "prop-5": [
    {
      id: "prop-5-bed-1",
      kind: "bedroom",
      name: "غرفة النوم الأولى",
      description: "غرفة ريفية بسرير مزدوج.",
      images: [room1],
      amenityIds: [],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-5-bed-2",
      kind: "bedroom",
      name: "غرفة النوم الثانية",
      description: "غرفة بسريرين فرديين وموقد حطب.",
      images: [room2],
      amenityIds: [],
      bedConfig: "سرير فردي ×2",
    },
    {
      id: "prop-5-bed-3",
      kind: "bedroom",
      name: "غرفة الضيوف",
      description: "غرفة بسريرين مزدوجين.",
      images: [room3],
      amenityIds: [],
      bedConfig: "سرير مزدوج ×2",
    },
    {
      id: "prop-5-garden",
      kind: "garden",
      name: "أراضي المزرعة",
      description: "مساحة مفتوحة مع أشجار مثمرة وركن شواء.",
      images: [garden1],
      amenityIds: ["garden", "barbecue"],
    },
  ],
  "prop-6": [
    {
      id: "prop-6-bed",
      kind: "bedroom",
      name: "غرفة النوم/المعيشة",
      description: "غرفة استوديو مدمجة بسرير ومكتب عمل.",
      images: [room1],
      amenityIds: ["ac", "wifi"],
      bedConfig: "سرير مزدوج ×1",
    },
    {
      id: "prop-6-kitchen",
      kind: "kitchen",
      name: "ركن المطبخ",
      description: "ركن مطبخ صغير مع ميكروويف وثلاجة وحوض.",
      images: [kitchen1],
      amenityIds: ["kitchen"],
    },
    {
      id: "prop-6-bath",
      kind: "bathroom",
      name: "الحمام",
      description: "حمام مدمج عملي مع دش.",
      images: [bath1],
      amenityIds: [],
    },
  ],
};

export function getPropertySpaces(propertyId: string): PropertySpace[] {
  return PROPERTY_SPACES[propertyId] ?? [];
}
