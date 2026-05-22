import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { UserPreferences } from "@/types";

export default function ProfileScreen() {
  const { user, tokens, logout } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    } else {
      // Initialize with defaults
      setPreferences({
        dietary_restrictions: [],
        cuisine_preferences: [],
        budget_range: "$$",
        max_distance_km: 5,
      });
    }
  }, [user]);

  const handleSavePreferences = async () => {
    if (!preferences || !tokens) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users/me/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        Alert.alert("Success", "Preferences saved");
      } else {
        Alert.alert("Error", "Failed to save preferences");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Dairy-free",
    "Nut-free",
  ];
  const cuisineOptions = [
    "Italian",
    "Asian",
    "Mexican",
    "Indian",
    "Mediterranean",
    "American",
  ];
  const budgetOptions = ["$", "$$", "$$$", "$$$$"] as const;

  const toggleDietary = (option: string) => {
    if (!preferences) return;
    const updated = preferences.dietary_restrictions.includes(option)
      ? preferences.dietary_restrictions.filter((d) => d !== option)
      : [...preferences.dietary_restrictions, option];
    setPreferences({ ...preferences, dietary_restrictions: updated });
  };

  const toggleCuisine = (option: string) => {
    if (!preferences) return;
    const updated = preferences.cuisine_preferences.includes(option)
      ? preferences.cuisine_preferences.filter((c) => c !== option)
      : [...preferences.cuisine_preferences, option];
    setPreferences({ ...preferences, cuisine_preferences: updated });
  };

  if (!preferences) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-bg justify-center items-center">
        <Text className="text-body text-neutral-text-secondary">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="pt-6 pb-8">
          <Text className="font-dm-sans text-display-2 text-neutral-text mb-2">
            Profile
          </Text>
          <Text className="text-body text-neutral-text-secondary">
            {user?.name}
          </Text>
        </View>

        {/* Preferences sections */}
        <View className="gap-8 pb-8">
          {/* Dietary Restrictions */}
          <View>
            <Text className="font-dm-sans text-h2 text-neutral-text mb-3">
              Dietary Restrictions
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => toggleDietary(option)}
                  className={`px-3 py-2 rounded-full ${
                    preferences.dietary_restrictions.includes(option)
                      ? "bg-primary"
                      : "bg-neutral-surface-light"
                  }`}
                >
                  <Text
                    className={`text-caption font-medium ${
                      preferences.dietary_restrictions.includes(option)
                        ? "text-white"
                        : "text-neutral-text-secondary"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Cuisine Preferences */}
          <View>
            <Text className="font-dm-sans text-h2 text-neutral-text mb-3">
              Favorite Cuisines
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {cuisineOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => toggleCuisine(option)}
                  className={`px-3 py-2 rounded-full ${
                    preferences.cuisine_preferences.includes(option)
                      ? "bg-primary"
                      : "bg-neutral-surface-light"
                  }`}
                >
                  <Text
                    className={`text-caption font-medium ${
                      preferences.cuisine_preferences.includes(option)
                        ? "text-white"
                        : "text-neutral-text-secondary"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Budget Range */}
          <View>
            <Text className="font-dm-sans text-h2 text-neutral-text mb-3">
              Budget Range
            </Text>
            <View className="flex-row gap-2">
              {budgetOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() =>
                    setPreferences({ ...preferences, budget_range: option })
                  }
                  className={`flex-1 py-3 rounded-md items-center justify-center ${
                    preferences.budget_range === option
                      ? "bg-primary"
                      : "bg-neutral-surface-light"
                  }`}
                >
                  <Text
                    className={`text-body font-medium ${
                      preferences.budget_range === option
                        ? "text-white"
                        : "text-neutral-text-secondary"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Max Distance */}
          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-dm-sans text-h2 text-neutral-text">
                Max Distance
              </Text>
              <Text className="text-h2 text-primary font-bold">
                {preferences.max_distance_km} km
              </Text>
            </View>
            <View className="flex-row gap-2">
              {[1, 3, 5, 10].map((km) => (
                <Pressable
                  key={km}
                  onPress={() =>
                    setPreferences({ ...preferences, max_distance_km: km })
                  }
                  className={`flex-1 py-2 rounded-md items-center justify-center ${
                    preferences.max_distance_km === km
                      ? "bg-primary"
                      : "bg-neutral-surface-light"
                  }`}
                >
                  <Text
                    className={`text-body-sm font-medium ${
                      preferences.max_distance_km === km
                        ? "text-white"
                        : "text-neutral-text-secondary"
                    }`}
                  >
                    {km}km
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Action buttons */}
          <View className="gap-2">
            <Pressable
              onPress={handleSavePreferences}
              disabled={loading}
              className={`py-3 rounded-md items-center justify-center ${
                loading ? "opacity-50" : ""
              }`}
              style={{ backgroundColor: "#d97757" }}
            >
              <Text className="text-white font-roboto font-medium text-body">
                {loading ? "Saving..." : "Save Preferences"}
              </Text>
            </Pressable>

            <Pressable
              onPress={logout}
              className="py-3 rounded-md border border-destructive items-center justify-center"
            >
              <Text className="text-destructive font-roboto font-medium text-body">
                Log Out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
