/**
 * Mock data for the public host profile page (`/host/[username]`).
 *
 * Each `slug` matches a `hostSlug` from `data/listings.ts`. When a property
 * or hotel references a slug not present here, the profile page returns 404
 * (handled in the page via `notFound()`).
 *
 * In Phase 6+ this is replaced by the API:
 *   GET /v1/hosts/:slug
 *   GET /v1/hosts/:slug/listings
 *   GET /v1/hosts/:slug/reviews
 */

export type HostKind = "individual" | "re_office" | "hotel_company";

export type HostKindLabels = {
  /** Heading shown on profile (e.g. "تعرَّف على أبو عمر"). */
  greeting: string;
  /** Short type label (badge / chip text). */
  typeLabel: string;
};

export const HOST_KIND_LABELS: Record<HostKind, HostKindLabels> = {
  individual: {
    greeting: "تعرَّف على المضيف",
    typeLabel: "مضيف فردي",
  },
  re_office: {
    greeting: "تعرَّف على المكتب",
    typeLabel: "مكتب عقاري",
  },
  hotel_company: {
    greeting: "تعرَّف على المُشغِّل",
    typeLabel: "شركة فنادق",
  },
};

export type HostMockReview = {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Host = {
  slug: string;
  displayName: string;
  kind: HostKind;
  bio: string;
  /** Languages the host speaks fluently (display only). */
  languages: string[];
  /** Average response time in minutes (used to derive "<1 hour" labels). */
  responseTimeMinutes: number;
  /** Response rate to messages, integer percent. */
  responseRatePercent: number;
  /** ISO month when the host joined (e.g. "2024-09"). */
  memberSince: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  /** True when rating >= 4.8. Surfaces a Super Host badge. */
  superHost: boolean;
  reviews: HostMockReview[];
};

export const HOSTS: Host[] = [
  {
    slug: "abu-omar",
    displayName: "أبو عمر",
    kind: "individual",
    bio: "مضيف من دمشق منذ أكثر من ثلاث سنوات، يحرص على راحة ضيوفه واستقبالهم بكرم سوري أصيل. عقاراته نظيفة، مرتَّبة، وقريبة من المعالم السياحية.",
    languages: ["العربية", "الإنجليزية"],
    responseTimeMinutes: 25,
    responseRatePercent: 98,
    memberSince: "2023-04",
    rating: 4.9,
    reviewsCount: 128,
    verified: true,
    superHost: true,
    reviews: [
      {
        id: "abu-omar-r1",
        guestName: "ليلى س.",
        rating: 5,
        comment:
          "استقبال رائع، الفيلا أجمل من الصور. أبو عمر متعاون جداً واستجابته سريعة على الرسائل.",
        date: "2026-03-12",
      },
      {
        id: "abu-omar-r2",
        guestName: "Marcus T.",
        rating: 5,
        comment:
          "Excellent host. The villa was spotless and the location stunning. Will definitely book again.",
        date: "2026-02-28",
      },
      {
        id: "abu-omar-r3",
        guestName: "خالد ع.",
        rating: 4.8,
        comment:
          "تجربة ممتازة مع العائلة. المسبح كان الإضافة المثالية لإقامتنا في دمشق.",
        date: "2026-01-15",
      },
    ],
  },
  {
    slug: "rana",
    displayName: "رنا",
    kind: "individual",
    bio: "مضيفة من اللاذقية، شغوفة بالضيافة والتفاصيل الدقيقة. شققها مفروشة بذوق عصري وتراعي احتياجات المسافرين العاملين عن بُعد.",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    responseTimeMinutes: 45,
    responseRatePercent: 95,
    memberSince: "2024-01",
    rating: 4.75,
    reviewsCount: 92,
    verified: true,
    superHost: false,
    reviews: [
      {
        id: "rana-r1",
        guestName: "فادي م.",
        rating: 5,
        comment:
          "الشقة قريبة من كل شيء، الإنترنت ممتاز، رنا متعاونة بشكل لا يُصدَّق.",
        date: "2026-04-02",
      },
      {
        id: "rana-r2",
        guestName: "Sophie L.",
        rating: 4.5,
        comment:
          "Beautiful apartment with a sea view. Rana was very welcoming and helpful.",
        date: "2026-03-18",
      },
      {
        id: "rana-r3",
        guestName: "نورا ح.",
        rating: 4.8,
        comment: "تجربة جميلة، مكان نظيف وهادئ، وكل شيء كما هو موصوف.",
        date: "2026-02-05",
      },
    ],
  },
  {
    slug: "office-cham",
    displayName: "مكتب الشام العقاري",
    kind: "re_office",
    bio: "مكتب عقاري متخصِّص في إدارة البيوت الدمشقية التراثية والشقق العصرية في قلب العاصمة. فريقنا يعتني بكل عقار كما لو كان منزله الخاص.",
    languages: ["العربية", "الإنجليزية"],
    responseTimeMinutes: 15,
    responseRatePercent: 99,
    memberSince: "2022-11",
    rating: 4.85,
    reviewsCount: 215,
    verified: true,
    superHost: true,
    reviews: [
      {
        id: "office-cham-r1",
        guestName: "أحمد ف.",
        rating: 5,
        comment:
          "احترافية عالية في التعامل، استلام المفاتيح كان سلساً والبيت دمشقي أصيل.",
        date: "2026-04-10",
      },
      {
        id: "office-cham-r2",
        guestName: "Emma R.",
        rating: 5,
        comment:
          "The traditional house was a once-in-a-lifetime experience. The team was very professional throughout.",
        date: "2026-03-22",
      },
      {
        id: "office-cham-r3",
        guestName: "سليم ج.",
        rating: 4.7,
        comment: "تواصل ممتاز قبل الوصول، البيت مرتَّب وتوصياتهم بالمطاعم رائعة.",
        date: "2026-02-14",
      },
    ],
  },
  {
    slug: "blue-coast-hospitality",
    displayName: "Blue Coast Hospitality",
    kind: "hotel_company",
    bio: "شركة ضيافة سورية تدير فنادق على الساحل السوري، تجمع بين الفخامة العصرية والكرم المحلي. خدمات استقبال 24 ساعة وفريق متعدِّد اللغات.",
    languages: ["العربية", "الإنجليزية", "الروسية"],
    responseTimeMinutes: 10,
    responseRatePercent: 100,
    memberSince: "2023-06",
    rating: 4.85,
    reviewsCount: 412,
    verified: true,
    superHost: true,
    reviews: [
      {
        id: "blue-coast-r1",
        guestName: "Olga V.",
        rating: 5,
        comment:
          "Immaculate hotel with stunning sea views. Staff was incredibly attentive and friendly.",
        date: "2026-04-15",
      },
      {
        id: "blue-coast-r2",
        guestName: "محمد ر.",
        rating: 4.8,
        comment:
          "إقامة ممتازة، الإفطار متنوِّع جداً والاستقبال على أعلى مستوى.",
        date: "2026-03-30",
      },
      {
        id: "blue-coast-r3",
        guestName: "ليث ع.",
        rating: 4.9,
        comment: "خدمة احترافية، الموقع رائع، والغرف نظيفة جداً وحديثة.",
        date: "2026-02-20",
      },
    ],
  },
  {
    slug: "golden-beach-group",
    displayName: "Golden Beach Group",
    kind: "hotel_company",
    bio: "مجموعة منتجعات شاطئية تقدِّم تجارب إقامة متكاملة على ساحل طرطوس واللاذقية. مرافق ترفيهية، مطاعم متنوِّعة، وفعاليات للعائلات.",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    responseTimeMinutes: 12,
    responseRatePercent: 99,
    memberSince: "2022-08",
    rating: 4.92,
    reviewsCount: 287,
    verified: true,
    superHost: true,
    reviews: [
      {
        id: "golden-beach-r1",
        guestName: "نسرين ك.",
        rating: 5,
        comment:
          "إجازة عائلية لا تُنسى. المسبح، الشاطئ، والطعام—كل شيء مثالي.",
        date: "2026-04-08",
      },
      {
        id: "golden-beach-r2",
        guestName: "Jean-Paul B.",
        rating: 5,
        comment:
          "Five-star experience from check-in to check-out. Highly recommended for families.",
        date: "2026-03-25",
      },
      {
        id: "golden-beach-r3",
        guestName: "حسام د.",
        rating: 4.85,
        comment: "منتجع راقٍ بكل تفاصيله، وفريق العمل ودود ومتعاون.",
        date: "2026-02-10",
      },
    ],
  },
];

export function findHost(slug: string): Host | undefined {
  return HOSTS.find((h) => h.slug === slug);
}

export function getAllHostSlugs(): string[] {
  return HOSTS.map((h) => h.slug);
}

/**
 * Convert raw response time (minutes) to a human-readable Arabic label.
 * Latin digits per project rules.
 */
export function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `أقل من ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "أقل من ساعة";
  return `أقل من ${hours} ساعات`;
}

/**
 * Format an ISO month string ("YYYY-MM") to "شهر YYYY" Arabic month-year label.
 * Latin digits per project rules.
 */
export function formatMemberSince(isoMonth: string): string {
  const [year, monthStr] = isoMonth.split("-");
  const month = Number.parseInt(monthStr, 10);
  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const monthName = monthNames[month - 1] ?? "";
  return `${monthName} ${year}`;
}
