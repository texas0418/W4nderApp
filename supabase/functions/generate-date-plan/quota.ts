/**
 * Usage-cap logic, extracted pure so it can be tested without burning
 * generations. index.ts supplies the DB counts; everything else — tier
 * parsing, buckets, windows, and the verdict — lives here.
 *
 * Caps are sized against measured API cost (~$0.40-0.50/generation on
 * Sonnet 5 builders): premium median usage ~5/mo stays high-margin, worst
 * case ~15 stays profitable at $9.99/mo after the App Store cut. The
 * monthly cap is the cost ceiling; the daily cap only spreads usage out.
 *
 * The client mirrors these numbers in services/datePlanService.ts
 * (getPlanQuota) — keep the two in sync.
 */

/** Full plan generations — the expensive bucket. */
export const PLAN_MODES = ['plan_for_me', 'single', 'vacation'];
/** Cheap calls (destination search, stop swap) share their own bucket. */
export const LIGHT_MODES = ['suggest_destinations', 'replace_stop'];

export interface QuotaLimits {
  monthly: number;
  daily: number;
}

export interface QuotaBucket {
  modeFilter: string[];
  label: string;
  isSuggestion: boolean;
}

export function bucketForMode(mode: unknown): QuotaBucket {
  const isSuggestion = LIGHT_MODES.includes(String(mode));
  return {
    isSuggestion,
    modeFilter: isSuggestion ? LIGHT_MODES : PLAN_MODES,
    label: isSuggestion ? 'quick searches' : 'plans',
  };
}

/** A missing profile row is free; any non-'free' tier counts as paid. */
export function isPaidTier(profileRow: { subscription_tier?: string | null } | null): boolean {
  return !!profileRow && profileRow.subscription_tier !== 'free';
}

export function limitsForTier(isPaid: boolean): QuotaLimits {
  return isPaid ? { monthly: 15, daily: 5 } : { monthly: 3, daily: 3 };
}

/** UTC month/day window starts, as ISO strings for created_at comparison. */
export function windowStarts(now: Date): { monthStart: string; dayStart: string } {
  return {
    monthStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
    dayStart: new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).toISOString(),
  };
}

export type QuotaVerdict =
  | { allowed: true }
  | { allowed: false; error: string; premiumRequired?: boolean };

/**
 * The gate itself. Vacation mode fans out one generation per day — a 10-day
 * trip costs dollars, not cents — so it's premium-only (destination browsing
 * stays free as an upsell funnel).
 */
export function checkQuota(params: {
  mode: unknown;
  isPaid: boolean;
  monthlyUsed: number;
  dailyUsed: number;
}): QuotaVerdict {
  const { mode, isPaid, monthlyUsed, dailyUsed } = params;
  const { label } = bucketForMode(mode);
  const limits = limitsForTier(isPaid);

  if (String(mode) === 'vacation' && !isPaid) {
    return {
      allowed: false,
      error: 'Multi-day trip planning is a Premium feature. Upgrade to plan vacations.',
      premiumRequired: true,
    };
  }
  if (monthlyUsed >= limits.monthly) {
    return {
      allowed: false,
      error: `You've used all ${limits.monthly} ${label} for this month${isPaid ? '' : ' on the free plan'}. Your limit resets on the 1st.`,
    };
  }
  if (dailyUsed >= limits.daily) {
    return {
      allowed: false,
      error: `Daily limit reached (${limits.daily} ${label}). Try again tomorrow.`,
    };
  }
  return { allowed: true };
}
