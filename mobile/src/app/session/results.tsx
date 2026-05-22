import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { useColors } from "@/hooks/useColors";
import { SessionResult } from "@/types";

export default function ResultsScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { tokens } = useAuth();
  const { results, getResults, loading } = useSession(tokens);
  const colors = useColors();
  const [displayResults, setDisplayResults] = useState<SessionResult[]>([]);

  useEffect(() => {
    if (sessionId && tokens) {
      getResults(sessionId);
    }
  }, [sessionId, tokens]);

  useEffect(() => {
    if (results.length > 0) {
      setDisplayResults(results);
    }
  }, [results]);

  const wsHandlers = {
    onTop3Ready: (payload: any) => {
      setDisplayResults(payload.results);
    },
  };

  useWebSocket(sessionId || "", tokens?.access_token || "", wsHandlers);

  const handleReturnHome = () => {
    router.replace("/(tabs)");
  };

  if (loading && displayResults.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.textSecondary }} className="text-body">
          Calculating results...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
          <Text style={{ color: colors.text }} className="font-dm-sans text-display-2 mb-2">
            Top Results
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-body">
            Based on everyone's votes
          </Text>
        </View>

        {/* Results list */}
        <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}>
          {displayResults.map((result, index) => (
            <View
              key={result.restaurant.id}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              {/* Image + rank badge */}
              <View style={{ position: "relative", height: 192 }}>
                <Image
                  source={{ uri: result.restaurant.photo_url ?? undefined }}
                  style={{ width: "100%", height: "100%", backgroundColor: colors.surfaceLight }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    borderRadius: 999,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: index === 0 ? colors.primaryLight : colors.rankBadgeFallback,
                  }}
                >
                  <Text
                    className="font-dm-sans font-bold text-h2"
                    style={{ color: index === 0 ? "#1a1817" : colors.rankBadgeFallbackText }}
                  >
                    #{index + 1}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View style={{ padding: 16 }}>
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: colors.text }} className="font-dm-sans text-h1 mb-1">
                    {result.restaurant.name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text className="text-primary text-body font-medium">★</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-body-sm">
                      {result.restaurant.rating != null
                        ? result.restaurant.rating.toFixed(1)
                        : "—"}{" "}
                      • {result.restaurant.price_tier ?? "—"}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: colors.textSecondary }} className="text-body-sm mb-4">
                  {result.restaurant.address}
                </Text>

                {/* Agreement bar */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ color: colors.text }} className="text-body-sm font-medium">
                      Agreement
                    </Text>
                    <Text className="text-h2 font-bold text-primary">
                      {result.score_pct.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={{ height: 3, backgroundColor: colors.progressBg, borderRadius: 2, overflow: "hidden" }}>
                    <View
                      style={{ height: "100%", backgroundColor: colors.primary, borderRadius: 2, width: `${result.score_pct}%` }}
                    />
                  </View>
                  <Text style={{ color: colors.textTertiary }} className="text-caption mt-1">
                    {result.yes_count} of {result.total} members
                  </Text>
                </View>

                {/* Cuisine chips */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {result.restaurant.cuisine_tags.slice(0, 3).map((cuisine) => (
                    <View
                      key={cuisine}
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: colors.chipBg,
                        borderWidth: 1,
                        borderColor: colors.chipBorder,
                      }}
                    >
                      <Text style={{ color: "rgba(255,255,255,0.65)" }} className="text-caption-sm font-medium">
                        {cuisine}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}>
          <Pressable
            onPress={handleReturnHome}
            style={{
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-dm-sans text-h2">
              Start New Session
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
