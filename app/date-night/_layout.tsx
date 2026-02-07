// app/date-night/_layout.tsx
import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function DateNightLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="my-preferences" />
      <Stack.Screen name="add-partner" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="build-itinerary" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="history" />
      <Stack.Screen name="generate-plan" />
      <Stack.Screen name="edit-itinerary" />
      <Stack.Screen name="confirm-booking" />
      <Stack.Screen name="shared-view" />
      <Stack.Screen name="rsvp" />
      <Stack.Screen name="expense-tracker" />
    </Stack>
  );
}
