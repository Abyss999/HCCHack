import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { SwipeStack } from "@/components/SwipeStack";
import { MatchModal } from "@/components/MatchModal";
import { Restaurant } from "@/types";

export default function SwipeScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { tokens } = useAuth();
  const { restaurants, getRestaurants, submitSwipe, loading } =
    useSession(tokens);
  const [swipeCount, setSwipeCount] = useState(0);
  const [memberProgress, setMemberProgress] = useState<
    Record<string, number>
  >({});
  const [matchedRestaurant, setMatchedRestaurant] =
    useState<Restaurant | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    if (sessionId && tokens) {
      getRestaurants(sessionId);
    }
  }, [sessionId, tokens]);

  const wsHandlers = {
    onSwipeProgress: (payload: any) => {
      setMemberProgress((prev) => ({
        ...prev,
        [payload.user_id]: payload.swipe_count,
      }));
    },
    onInstantMatch: (payload: any) => {
      setMatchedRestaurant(payload.restaurant);
      setShowMatch(true);
    },
    onPhaseChange: (payload: any) => {
      if (payload.phase === "results") {
        router.push(`/session/results?sessionId=${sessionId}`);
      }
    },
  };

  useWebSocket(sessionId || "", tokens?.access_token || "", wsHandlers);

  const handleSwipe = async (restaurantId: string, direction: "yes" | "no") => {
    try {
      await submitSwipe(sessionId || "", restaurantId, direction);
      setSwipeCount((prev) => prev + 1);
    } catch (error) {
      Alert.alert("Error", "Failed to submit swipe");
    }
  };

  const handleMatchClose = () => {
    setShowMatch(false);
    router.push(`/session/results?sessionId=${sessionId}`);
  };

  const minSwipes = 5;
  const maxSwipes = 10;
  const canSeeResults = swipeCount >= minSwipes;

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      {/* Progress bar */}
      <View className="px-4 py-4 gap-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-body-sm text-neutral-text-secondary">
            Your swipes: {swipeCount}/{maxSwipes}
          </Text>
          {canSeeResults && (
            <Pressable
              onPress={() =>
                router.push(`/session/results?sessionId=${sessionId}`)
              }
              className="px-3 py-1 rounded-full border border-primary"
            >
              <Text className="text-caption text-primary font-medium">
                See Results
              </Text>
            </Pressable>
          )}
        </View>

        {/* Progress bar */}
        <View className="h-2 bg-neutral-surface rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{
              width: `${(swipeCount / maxSwipes) * 100}%`,
            }}
          />
        </View>

        {/* Member progress dots */}
        <View className="flex-row gap-1">
          {Object.entries(memberProgress).map(([userId, count]) => (
            <View
              key={userId}
              className="flex-1 h-1 bg-neutral-surface rounded-full overflow-hidden"
            >
              <View
                className="h-full bg-primary-light"
                style={{
                  width: `${(count / maxSwipes) * 100}%`,
                }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Swipe stack */}
      <View className="flex-1">
        {restaurants.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-h1 text-neutral-text">
              Loading restaurants...
            </Text>
          </View>
        ) : (
          <SwipeStack
            restaurants={restaurants}
            onSwipe={handleSwipe}
            onStackEmpty={() => {
              if (!canSeeResults) {
                Alert.alert(
                  "Keep going!",
                  `Swipe ${minSwipes - swipeCount} more to see results`
                );
              }
            }}
          />
        )}
      </View>

      {/* Match modal */}
      <MatchModal
        visible={showMatch}
        restaurant={matchedRestaurant}
        onClose={handleMatchClose}
      />
    </SafeAreaView>
  );
}
