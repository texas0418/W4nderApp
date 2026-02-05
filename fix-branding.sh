#!/bin/bash
# ============================================
# W4nder P0: Fix "Wanderlust" → "W4nder" Branding
# ============================================
# Run from the root of your W4nderApp repo:
#   chmod +x fix-branding.sh && ./fix-branding.sh
#
# This script fixes ALL 6 files that still reference "Wanderlust"
# ============================================

set -e

echo "🔧 W4nder Branding Fix — P0"
echo "============================"
echo ""

# Track changes
CHANGES=0

# --- 1. Onboarding Welcome Screen ---
FILE="app/onboarding/index.tsx"
if [ -f "$FILE" ]; then
  # Fix the welcome title: "Wanderlust" → "W4nder"
  sed -i '' 's/>Wanderlust<\/Text>/>W4nder<\/Text>/' "$FILE"
  # Fix the subtitle to match W4nder brand voice
  sed -i '' 's/Your personal AI travel companion\. Let us create unforgettable journeys together\./Your AI-powered travel companion. Smarter trips, unforgettable journeys./' "$FILE"
  echo "✅ $FILE — Fixed welcome title & subtitle"
  CHANGES=$((CHANGES + 1))
else
  echo "⚠️  $FILE not found — skipping"
fi

# --- 2. AppContext Storage Keys ---
FILE="contexts/AppContext.tsx"
if [ -f "$FILE" ]; then
  sed -i '' "s/'wanderlust_onboarding'/'w4nder_onboarding'/" "$FILE"
  sed -i '' "s/'wanderlust_user'/'w4nder_user'/" "$FILE"
  sed -i '' "s/'wanderlust_trips'/'w4nder_trips'/" "$FILE"
  sed -i '' "s/'wanderlust_bookings'/'w4nder_bookings'/" "$FILE"
  sed -i '' "s/'wanderlust_notifications'/'w4nder_notifications'/" "$FILE"
  sed -i '' "s/'wanderlust_bucket_list'/'w4nder_bucket_list'/" "$FILE"
  echo "✅ $FILE — Fixed 6 storage keys"
  CHANGES=$((CHANGES + 1))
else
  echo "⚠️  $FILE not found — skipping"
fi

# --- 3. Emergency Screen ---
FILE="app/emergency.tsx"
if [ -f "$FILE" ]; then
  sed -i '' 's/>Wanderlust Support</>W4nder Support</' "$FILE"
  echo "✅ $FILE — Fixed support title"
  CHANGES=$((CHANGES + 1))
else
  echo "⚠️  $FILE not found — skipping"
fi

# --- 4. Profile Tab Footer ---
FILE="app/(tabs)/profile.tsx"
if [ -f "$FILE" ]; then
  sed -i '' 's/>Wanderlust v1\.0\.0</>W4nder v1.0.0</' "$FILE"
  echo "✅ $FILE — Fixed footer version text"
  CHANGES=$((CHANGES + 1))
else
  echo "⚠️  $FILE not found — skipping"
fi

# --- 5. Offline Mode Storage Key ---
FILE="app/offline-mode.tsx"
if [ -f "$FILE" ]; then
  sed -i '' "s/'wanderlust_offline_trips'/'w4nder_offline_trips'/" "$FILE"
  echo "✅ $FILE — Fixed offline storage key"
  CHANGES=$((CHANGES + 1))
else
  echo "⚠️  $FILE not found — skipping"
fi

# --- 6. Group Trip Share Link & Message ---
FILE="app/group-trip.tsx"
if [ -f "$FILE" ]; then
  sed -i '' 's|https://wanderlust\.app/|https://w4nder.app/|' "$FILE"
  sed -i '' 's/on Wanderlust!/on W4nder!/' "$FILE"
  echo "✅ $FILE — Fixed share link & message"
  CHANGES=$((CHANGES + 1))
else
  echo "⚠️  $FILE not found — skipping"
fi

echo ""
echo "============================"
echo "✅ Done! Fixed $CHANGES files."
echo ""
echo "⚠️  Note: Changing storage keys (wanderlust_* → w4nder_*) will"
echo "   reset local data for existing users. This is fine for a"
echo "   pre-launch demo app but would need a migration in production."
echo ""
echo "Next step: Verify with  grep -r 'Wanderlust\|wanderlust' --include='*.tsx' --include='*.ts'"
