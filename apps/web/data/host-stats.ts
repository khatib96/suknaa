/**
 * Live numbers shown on the /become-a-host page.
 *
 * RULE (per UI_UX_VISION §4.2): the strip is hidden completely if this array
 * is empty. Do NOT invent fake stats — leave it empty until real data is wired.
 */

export type HostStat = {
  id: string;
  /** Big number, e.g. "1,200+" — keep numerals Latin */
  value: string;
  /** Short label below the number */
  label: string;
};

export const HOST_STATS: HostStat[] = [];
