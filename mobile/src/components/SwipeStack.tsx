import React, { useState } from "react";
import { View, Text } from "react-native";
import { Restaurant } from "@/types";
import { RestaurantCard } from "./RestaurantCard";
import { useColors } from "@/hooks/useColors";

interface SwipeStackProps {
  restaurants: Restaurant[];
  onSwipe: (restaurantId: string, direction: "yes" | "no") => void;
  onStackEmpty: () => void;
}

export const SwipeStack: React.FC<SwipeStackProps> = ({
  restaurants,
  onSwipe,
  onStackEmpty,
}) => {
  const colors = useColors();
  const [swipedIndexes, setSwipedIndexes] = useState<number[]>([]);

  const handleSwipeLeft = () => {
    const currentIndex = swipedIndexes.length;
    const restaurant = restaurants[currentIndex];
    if (restaurant) {
      onSwipe(restaurant.id, "no");
      setSwipedIndexes([...swipedIndexes, currentIndex]);
      if (swipedIndexes.length + 1 >= restaurants.length) {
        onStackEmpty();
      }
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = swipedIndexes.length;
    const restaurant = restaurants[currentIndex];
    if (restaurant) {
      onSwipe(restaurant.id, "yes");
      setSwipedIndexes([...swipedIndexes, currentIndex]);
      if (swipedIndexes.length + 1 >= restaurants.length) {
        onStackEmpty();
      }
    }
  };

  const currentIndex = swipedIndexes.length;
  const remainingCount = restaurants.length - currentIndex;

  if (remainingCount === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }} className="text-h1 font-dm-sans">
          No more restaurants
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }} className="text-body-sm">
          Waiting for results...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Card stack */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }}>
        {restaurants.slice(currentIndex, currentIndex + 2).map((restaurant, idx) => (
          <View
            key={restaurant.id}
            style={{
              position: "absolute",
              width: "100%",
              maxWidth: 384,
              zIndex: 100 - idx,
              transform: [{ scale: 1 - idx * 0.05 }, { translateY: idx * 12 }],
            }}
          >
            {idx === 0 ? (
              <RestaurantCard
                restaurant={restaurant}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            ) : (
              <View
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: colors.surface,
                  height: 500,
                }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 24,
          backgroundColor: colors.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Text style={{ color: colors.textSecondary }} className="text-center text-body-sm">
          {remainingCount} restaurant{remainingCount !== 1 ? "s" : ""} left
        </Text>
      </View>
    </View>
  );
};
