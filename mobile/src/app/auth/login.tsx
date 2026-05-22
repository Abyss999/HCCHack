import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      <ScrollView className="flex-1 px-4">
        <View className="flex-1 justify-center py-12">
          {/* Header */}
          <View className="mb-12">
            <Text className="font-dm-sans text-display-1 text-primary mb-2">
              DishMatch
            </Text>
            <Text className="text-body text-neutral-text-secondary">
              Find your perfect meal together
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            <View>
              <Text className="text-body-sm text-neutral-text-secondary mb-2">
                Email
              </Text>
              <TextInput
                className="input"
                placeholder="you@example.com"
                placeholderTextColor="#808080"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
                style={{
                  color: "#ffffff",
                  fontFamily: "Roboto",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "#262626",
                  borderWidth: 1,
                  borderColor: "#404040",
                }}
              />
            </View>

            <View>
              <Text className="text-body-sm text-neutral-text-secondary mb-2">
                Password
              </Text>
              <TextInput
                className="input"
                placeholder="••••••••"
                placeholderTextColor="#808080"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                style={{
                  color: "#ffffff",
                  fontFamily: "Roboto",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "#262626",
                  borderWidth: 1,
                  borderColor: "#404040",
                }}
              />
            </View>
          </View>

          {/* Login button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`py-3 rounded-md items-center justify-center mb-4 ${
              loading ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: "#d97757",
            }}
          >
            <Text className="text-white font-roboto font-medium text-body">
              {loading ? "Logging in..." : "Log in"}
            </Text>
          </Pressable>

          {/* Sign up link */}
          <View className="flex-row justify-center gap-1">
            <Text className="text-body text-neutral-text">
              Don't have an account?
            </Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text className="text-body font-medium text-primary">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
