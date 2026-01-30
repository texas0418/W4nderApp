import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function DateNightLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="my-preferences" />
      <Stack.Screen name="add-partner" />
      <Stack.Screen name="generate-plan" />
      <Stack.Screen name="edit-itinerary" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
