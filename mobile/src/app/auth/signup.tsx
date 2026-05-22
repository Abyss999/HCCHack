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

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, name);
    } catch (error) {
      Alert.alert("Signup Failed", "Please try again");
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
              Join DishMatch
            </Text>
            <Text className="text-body text-neutral-text-secondary">
              Create an account to get started
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            <View>
              <Text className="text-body-sm text-neutral-text-secondary mb-2">
                Full Name
              </Text>
              <TextInput
                className="input"
                placeholder="John Doe"
                placeholderTextColor="#808080"
                value={name}
                onChangeText={setName}
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

            <View>
              <Text className="text-body-sm text-neutral-text-secondary mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="input"
                placeholder="••••••••"
                placeholderTextColor="#808080"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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

          {/* Signup button */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            className={`py-3 rounded-md items-center justify-center mb-4 ${
              loading ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: "#d97757",
            }}
          >
            <Text className="text-white font-roboto font-medium text-body">
              {loading ? "Creating account..." : "Sign up"}
            </Text>
          </Pressable>

          {/* Login link */}
          <View className="flex-row justify-center gap-1">
            <Text className="text-body text-neutral-text">
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/auth/login")}>
              <Text className="text-body font-medium text-primary">
                Log in
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
