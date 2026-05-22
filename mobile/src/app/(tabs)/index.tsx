import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { tokens } = useAuth();
  const { createSession, joinSession, loading } = useSession(tokens);

  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleCreateSession = async () => {
    try {
      // For now, use a default location. In production, get user's actual location
      const session = await createSession(40.7128, -74.006); // NYC coords as example
      router.push(`/session/lobby?sessionId=${session.id}`);
    } catch (error) {
      Alert.alert("Error", "Failed to create session");
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode || joinCode.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-character code");
      return;
    }

    try {
      const session = await joinSession(joinCode.toUpperCase());
      router.push(`/session/lobby?sessionId=${session.id}`);
    } catch (error) {
      Alert.alert("Error", "Failed to join session. Check the code and try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      <ScrollView className="flex-1">
        {/* Header with user info */}
        <View className="px-4 pt-6 pb-8 flex-row justify-between items-center">
          <View>
            <Text className="font-dm-sans text-h1 text-neutral-text">
              Welcome back
            </Text>
            <Text className="text-body-sm text-neutral-text-secondary">
              {user?.name}
            </Text>
          </View>
          <Pressable
            onPress={logout}
            className="px-3 py-2 rounded-md border border-neutral-border"
          >
            <Text className="text-caption text-neutral-text-secondary">
              Logout
            </Text>
          </Pressable>
        </View>

        {/* Main actions */}
        <View className="px-4 gap-3 py-6">
          {/* Create session button */}
          <Pressable
            onPress={handleCreateSession}
            disabled={loading}
            className={`py-6 rounded-lg items-center justify-center ${
              loading ? "opacity-50" : ""
            }`}
            style={{
              backgroundColor: "#d97757",
            }}
          >
            <Text className="font-dm-sans text-h2 text-white mb-1">
              {loading ? "Creating..." : "Create Session"}
            </Text>
            <Text className="text-body-sm text-white/70">
              Start a new group decision
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-px bg-neutral-border" />
            <Text className="text-caption text-neutral-text-tertiary">or</Text>
            <View className="flex-1 h-px bg-neutral-border" />
          </View>

          {/* Join session button */}
          <Pressable
            onPress={() => setShowJoinCode(!showJoinCode)}
            className="py-6 rounded-lg items-center justify-center border border-primary"
          >
            <Text className="font-dm-sans text-h2 text-primary mb-1">
              Join Session
            </Text>
            <Text className="text-body-sm text-primary/70">
              Enter a 4-digit code
            </Text>
          </Pressable>
        </View>

        {/* Join code input */}
        {showJoinCode && (
          <View className="px-4 py-6 gap-3">
            <Text className="text-body-sm text-neutral-text-secondary">
              Enter the 4-character session code
            </Text>
            <TextInput
              placeholder="XXXX"
              placeholderTextColor="#808080"
              value={joinCode}
              onChangeText={(text) =>
                setJoinCode(text.toUpperCase().slice(0, 4))
              }
              maxLength={4}
              editable={!loading}
              style={{
                color: "#ffffff",
                fontFamily: "IBM Plex Mono",
                fontSize: 24,
                letterSpacing: 8,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: "#262626",
                borderWidth: 1,
                borderColor: "#d97757",
                textAlign: "center",
              }}
            />
            <Pressable
              onPress={handleJoinSession}
              disabled={loading || joinCode.length !== 4}
              className={`py-3 rounded-md items-center justify-center ${
                loading || joinCode.length !== 4 ? "opacity-50" : ""
              }`}
              style={{
                backgroundColor: "#d97757",
              }}
            >
              <Text className="text-white font-roboto font-medium text-body">
                {loading ? "Joining..." : "Join"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Quick tips */}
        <View className="px-4 py-8 gap-3">
          <Text className="text-body-sm font-medium text-neutral-text-secondary">
            How it works
          </Text>
          <View className="gap-2">
            <Text className="text-body-sm text-neutral-text-tertiary">
              • Create or join a session with friends
            </Text>
            <Text className="text-body-sm text-neutral-text-tertiary">
              • Swipe yes/no on nearby restaurants
            </Text>
            <Text className="text-body-sm text-neutral-text-tertiary">
              • Instant match when everyone agrees
            </Text>
            <Text className="text-body-sm text-neutral-text-tertiary">
              • See the top 3 options otherwise
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
