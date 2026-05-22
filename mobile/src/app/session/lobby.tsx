import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { CodeDisplay } from "@/components/CodeDisplay";
import { Avatar } from "@/components/ui/Button";
import { Session, SessionMember } from "@/types";

export default function LobbyScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { tokens, user } = useAuth();
  const { session, getSession, startSwiping, loading } = useSession(tokens);
  const [members, setMembers] = useState<SessionMember[]>([]);

  useEffect(() => {
    if (sessionId && tokens) {
      getSession(sessionId);
    }
  }, [sessionId, tokens]);

  useEffect(() => {
    if (session) {
      setMembers(session.members);
    }
  }, [session]);

  // WebSocket connection
  const wsHandlers = {
    onMemberJoined: (payload: any) => {
      setMembers((prev) => {
        const exists = prev.find((m) => m.user_id === payload.user_id);
        if (exists) return prev;
        return [...prev, payload];
      });
    },
    onPhaseChange: (payload: any) => {
      if (payload.phase === "swiping") {
        router.push(`/session/swipe?sessionId=${sessionId}`);
      }
    },
  };

  useWebSocket(sessionId || "", tokens?.access_token || "", wsHandlers);

  const isHost = user?.id === session?.host_user_id;

  const handleStartSwiping = async () => {
    if (!sessionId || members.length < 2) {
      Alert.alert("Error", "At least 2 people are needed to start");
      return;
    }

    try {
      await startSwiping(sessionId);
      router.push(`/session/swipe?sessionId=${sessionId}`);
    } catch (error) {
      Alert.alert("Error", "Failed to start swiping");
    }
  };

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-bg justify-center items-center">
        <Text className="text-body text-neutral-text-secondary">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-6 pb-8">
          <Text className="font-dm-sans text-display-2 text-neutral-text mb-2">
            Your Session
          </Text>
          <Text className="text-body text-neutral-text-secondary">
            Invite friends to join
          </Text>
        </View>

        {/* Session code */}
        <View className="px-4 py-8 bg-neutral-surface rounded-lg mx-4 mb-8">
          <Text className="text-body-sm text-neutral-text-secondary text-center mb-4">
            Share this code
          </Text>
          <CodeDisplay code={session.code} />
        </View>

        {/* Members section */}
        <View className="px-4 mb-8">
          <Text className="font-dm-sans text-h2 text-neutral-text mb-4">
            Members ({members.length})
          </Text>

          {members.length === 0 ? (
            <Text className="text-body-sm text-neutral-text-secondary">
              Waiting for friends to join...
            </Text>
          ) : (
            <View className="gap-3">
              {members.map((member) => (
                <View
                  key={member.user_id}
                  className="flex-row items-center gap-3 p-3 bg-neutral-surface rounded-md"
                >
                  <Avatar
                    name={member.name}
                    userId={member.user_id}
                    size="md"
                    online={true}
                  />
                  <View className="flex-1">
                    <Text className="text-body text-neutral-text">
                      {member.name}
                    </Text>
                    <Text className="text-caption text-neutral-text-tertiary">
                      {member.user_id === user?.id ? "You" : "Joined"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Start button (host only) */}
        {isHost && (
          <View className="px-4 pb-8">
            <Pressable
              onPress={handleStartSwiping}
              disabled={loading || members.length < 2}
              className={`py-4 rounded-lg items-center justify-center ${
                loading || members.length < 2 ? "opacity-50" : ""
              }`}
              style={{
                backgroundColor: members.length >= 2 ? "#d97757" : "#808080",
              }}
            >
              <Text className="text-white font-dm-sans text-h2">
                {loading ? "Starting..." : "Start Swiping"}
              </Text>
            </Pressable>
            {members.length < 2 && (
              <Text className="text-caption text-neutral-text-tertiary text-center mt-2">
                Need at least 2 members to start
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
