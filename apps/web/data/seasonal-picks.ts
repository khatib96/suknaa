/**
 * Seasonal picks shown on the homepage in the SeasonalPicks section.
 *
 * RULE: this section is hidden entirely if the array is empty.
 * Do not invent fake "seasonal" entries — leave it empty until real
 * data is available (per docs/UI_UX_VISION.md §3.7 "القاعدة الذهبية").
 */

export type SeasonalPick = {
  /** Unique id used as React key */
  id: string;
  /** Headline shown above the title */
  badge: string;
  /** Big title shown on the card */
  title: string;
  /** 1-2 line poetic description */
  description: string;
  /** Image path (relative to /public) or full URL */
  image: string;
  /** Where the "اكتشف" CTA should navigate */
  href: string;
};

/**
 * Title for the section. Switch this manually as the season changes
 * (or wire it to a backend signal in Phase 8).
 */
export const SEASONAL_TITLE = "وجهات الموسم المختارة";

export const SEASONAL_PICKS: SeasonalPick[] = [];
