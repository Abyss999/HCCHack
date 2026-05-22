import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="lobby" />
      <Stack.Screen name="swipe" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
