import React, { useState } from "react";
import { View, Text } from "react-native";
import { Restaurant } from "@/types";
import { RestaurantCard } from "./RestaurantCard";

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
      <View className="flex-1 justify-center items-center">
        <Text className="text-h1 font-dm-sans text-neutral-text">
          No more restaurants
        </Text>
        <Text className="text-body-sm text-neutral-text-secondary mt-2">
          Waiting for results...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Card stack */}
      <View className="flex-1 justify-center items-center px-4">
        {restaurants
          .slice(currentIndex, currentIndex + 2)
          .map((restaurant, idx) => (
            <View
              key={restaurant.id}
              className="absolute w-full max-w-sm"
              style={{
                zIndex: 100 - idx,
                transform: [
                  {
                    scale: 1 - idx * 0.05,
                  },
                  {
                    translateY: idx * 12,
                  },
                ],
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
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: "#262626",
                    height: 500,
                  }}
                >
                  {/* Placeholder for next card */}
                </View>
              )}
            </View>
          ))}
      </View>

      {/* Info footer */}
      <View className="px-4 py-6 bg-neutral-surface rounded-t-lg">
        <Text className="text-center text-body-sm text-neutral-text-secondary">
          {remainingCount} restaurant{remainingCount !== 1 ? "s" : ""} left
        </Text>
      </View>
    </View>
  );
};
