# RevenueCat / In-App Purchases — release checklist

The app code (SDK, paywall, webhook) landed in `feat/revenuecat-iap`. These are the
remaining **non-code** steps to make subscriptions live.

## RevenueCat dashboard (done)
- Project created; App Store app added (bundle `app.paintthetown.com`).
- In-App Purchase key (`.p8`) uploaded.
- Entitlements `premium` and `basic`.
- `default` offering with packages `basic_monthly`, `basic_annual`,
  `premium_monthly`, `premium_annual`.
- Public SDK key stored as `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in `.env`.

## App Store Connect (done)
- Subscription group "Paint the Town Membership" with the four products:
  - `app.paintthetown.basic.monthly` — $9.99
  - `app.paintthetown.basic.annual` — $59.99
  - `app.paintthetown.premium.monthly` — $19.99
  - `app.paintthetown.premium.annual` — $119.99

## Still to do
1. **Link the native module:** `pod install` (or `npx expo prebuild`) — `react-native-purchases`
   is a native dependency and won't work in a build that predates it.
2. **Deploy the webhook:** deploy `supabase/functions/revenuecat-webhook`. In RevenueCat →
   Integrations → Webhooks, set the function URL and an `Authorization` header value, then
   `supabase secrets set REVENUECAT_WEBHOOK_AUTH=<same value>`.
3. **Reorder subscription levels** in App Store Connect so Premium ranks above Basic
   (Level 1 = highest tier) for correct upgrade/downgrade proration.
4. **Sandbox test** purchase + restore from a TestFlight build.
5. **Subscription review screenshots:** each App Store Connect subscription needs a
   screenshot of the Membership purchase UI before it can be submitted.

## How tier sync works
`profiles.subscription_tier` is server-authoritative and read by `getPlanQuota()` and the
`generate-date-plan` edge function. Only the `revenuecat-webhook` function (service role)
writes it. The app calls `Purchases.logIn(user.id)`, so RevenueCat's `app_user_id` equals the
Supabase profile id and the webhook maps events straight to the row. The client mirrors the
live entitlement for instant UI feedback but never writes the tier.

> **Dependency changes:** never commit a macOS-generated `package-lock.json` — run the
> `Regenerate lockfile (Linux)` workflow (workflow_dispatch on the feature branch) instead.
