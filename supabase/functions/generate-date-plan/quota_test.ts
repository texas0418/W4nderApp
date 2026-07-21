// deno test supabase/functions/generate-date-plan/quota_test.ts
//
// The quota gate guards real API spend (~$0.47/generation), so every branch
// is pinned here — including the exact user-facing copy, which the app's
// error surfaces rely on.

import { assertEquals } from 'jsr:@std/assert';
import {
  LIGHT_MODES,
  PLAN_MODES,
  bucketForMode,
  checkQuota,
  isPaidTier,
  limitsForTier,
  windowStarts,
} from './quota.ts';

Deno.test('plan modes and light modes are disjoint buckets', () => {
  for (const m of PLAN_MODES) assertEquals(LIGHT_MODES.includes(m), false);
  assertEquals(bucketForMode('plan_for_me'), {
    isSuggestion: false,
    modeFilter: PLAN_MODES,
    label: 'plans',
  });
  assertEquals(bucketForMode('replace_stop'), {
    isSuggestion: true,
    modeFilter: LIGHT_MODES,
    label: 'quick searches',
  });
  // Unknown/missing modes count against the expensive bucket, never the free one.
  assertEquals(bucketForMode(undefined).isSuggestion, false);
  assertEquals(bucketForMode('anything_else').isSuggestion, false);
});

Deno.test('tier parsing: missing profile is free; any non-free tier is paid', () => {
  assertEquals(isPaidTier(null), false);
  assertEquals(isPaidTier({ subscription_tier: 'free' }), false);
  assertEquals(isPaidTier({ subscription_tier: 'premium' }), true);
  // Documented quirk: unrecognized tiers are treated as paid.
  assertEquals(isPaidTier({ subscription_tier: 'jetsetter' }), true);
});

Deno.test('limits match the pricing model', () => {
  assertEquals(limitsForTier(false), { monthly: 3, daily: 3 });
  assertEquals(limitsForTier(true), { monthly: 15, daily: 5 });
});

Deno.test('window starts are UTC and roll over correctly', () => {
  const midMonth = windowStarts(new Date('2026-07-21T15:30:00Z'));
  assertEquals(midMonth.monthStart, '2026-07-01T00:00:00.000Z');
  assertEquals(midMonth.dayStart, '2026-07-21T00:00:00.000Z');

  // Late on the last day of the year: still December's window, that day's start.
  const nye = windowStarts(new Date('2026-12-31T23:59:59Z'));
  assertEquals(nye.monthStart, '2026-12-01T00:00:00.000Z');
  assertEquals(nye.dayStart, '2026-12-31T00:00:00.000Z');

  // One second later: everything resets.
  const newYear = windowStarts(new Date('2027-01-01T00:00:00Z'));
  assertEquals(newYear.monthStart, '2027-01-01T00:00:00.000Z');
  assertEquals(newYear.dayStart, '2027-01-01T00:00:00.000Z');
});

Deno.test('free user: allowed under caps, blocked at them', () => {
  const base = { mode: 'plan_for_me', isPaid: false };
  assertEquals(checkQuota({ ...base, monthlyUsed: 0, dailyUsed: 0 }), { allowed: true });
  assertEquals(checkQuota({ ...base, monthlyUsed: 2, dailyUsed: 2 }), { allowed: true });

  const monthly = checkQuota({ ...base, monthlyUsed: 3, dailyUsed: 0 });
  assertEquals(monthly, {
    allowed: false,
    error: "You've used all 3 plans for this month on the free plan. Your limit resets on the 1st.",
  });
});

Deno.test('premium user: monthly cap 15, daily cap 5', () => {
  const base = { mode: 'single', isPaid: true };
  assertEquals(checkQuota({ ...base, monthlyUsed: 14, dailyUsed: 4 }), { allowed: true });

  assertEquals(checkQuota({ ...base, monthlyUsed: 15, dailyUsed: 0 }), {
    allowed: false,
    error: "You've used all 15 plans for this month. Your limit resets on the 1st.",
  });
  assertEquals(checkQuota({ ...base, monthlyUsed: 5, dailyUsed: 5 }), {
    allowed: false,
    error: 'Daily limit reached (5 plans). Try again tomorrow.',
  });
});

Deno.test('monthly cap is checked before daily cap', () => {
  const verdict = checkQuota({ mode: 'single', isPaid: true, monthlyUsed: 15, dailyUsed: 5 });
  assertEquals(verdict.allowed, false);
  if (!verdict.allowed) assertEquals(verdict.error.includes('this month'), true);
});

Deno.test('vacation mode is premium-only, even with quota to spare', () => {
  assertEquals(checkQuota({ mode: 'vacation', isPaid: false, monthlyUsed: 0, dailyUsed: 0 }), {
    allowed: false,
    error: 'Multi-day trip planning is a Premium feature. Upgrade to plan vacations.',
    premiumRequired: true,
  });
  assertEquals(checkQuota({ mode: 'vacation', isPaid: true, monthlyUsed: 0, dailyUsed: 0 }), {
    allowed: true,
  });
});

Deno.test('light modes get quick-search copy in errors', () => {
  const verdict = checkQuota({
    mode: 'suggest_destinations',
    isPaid: false,
    monthlyUsed: 3,
    dailyUsed: 0,
  });
  assertEquals(verdict.allowed, false);
  if (!verdict.allowed) {
    assertEquals(
      verdict.error,
      "You've used all 3 quick searches for this month on the free plan. Your limit resets on the 1st."
    );
  }
});
