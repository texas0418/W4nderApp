import React from 'react';
import { PlansContent } from './(tabs)/my-plans';

/** Stack-pushed variant of My Plans (from the profile screen) — gets a back button. */
export default function PlansScreen() {
  return <PlansContent showBack />;
}
