import "../global.css";

import { Stack } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function RootLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" options={{ animation: "none" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
      <Stack.Screen name="session" />
    </Stack>
  );
}
