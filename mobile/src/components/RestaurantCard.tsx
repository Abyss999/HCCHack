import React, { useRef, useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  style?: any;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const rotateZ = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotateZ.value}deg`,
        },
        {
          translateX: translateX.value,
        },
      ],
      opacity: opacity.value,
    };
  });

  const handleSwipeLeft = () => {
    translateX.value = withSpring(-400, { damping: 0.8, mass: 1, stiffness: 100 });
    rotateZ.value = withSpring(-15, { damping: 0.8 });
    opacity.value = withSpring(0, { damping: 0.8 });
    setTimeout(onSwipeLeft, 300);
  };

  const handleSwipeRight = () => {
    translateX.value = withSpring(400, { damping: 0.8, mass: 1, stiffness: 100 });
    rotateZ.value = withSpring(15, { damping: 0.8 });
    opacity.value = withSpring(0, { damping: 0.8 });
    setTimeout(onSwipeRight, 300);
  };

  const priceDisplay = restaurant.price_tier?.length ?? 0;
  const ratingDisplay = restaurant.rating != null ? restaurant.rating.toFixed(1) : "—";

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: "#262626",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Image */}
        <Image
          source={{ uri: restaurant.photo_url ?? undefined }}
          className="w-full h-80 bg-neutral-surface"
          resizeMode="cover"
        />

        {/* Info section */}
        <View className="p-4">
          {/* Header */}
          <View className="mb-3">
            <Text className="font-dm-sans text-h1 text-neutral-text mb-1">
              {restaurant.name}
            </Text>
            <Text className="text-body-sm text-neutral-text-secondary">
              {restaurant.address}
            </Text>
          </View>

          {/* Meta row */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row gap-3">
              {/* Rating */}
              <View className="flex-row items-center gap-1">
                <Text className="text-body font-medium text-primary">★</Text>
                <Text className="text-body-sm text-neutral-text-secondary">
                  {ratingDisplay}
                </Text>
              </View>

              {/* Price */}
              <View className="flex-row items-center gap-1">
                <Text className="text-body font-medium text-primary">$</Text>
                <Text className="text-body-sm text-neutral-text-secondary">
                  {priceDisplay}
                </Text>
              </View>

              {/* Distance (if available) */}
              <Text className="text-body-sm text-neutral-text-secondary">
                {restaurant.lat ? "0.5 km" : ""}
              </Text>
            </View>
          </View>

          {/* Cuisines */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {restaurant.cuisine_tags.slice(0, 3).map((cuisine, idx) => (
              <View
                key={idx}
                className="px-2 py-1 rounded-full bg-neutral-surface-light"
              >
                <Text className="text-caption text-neutral-text-secondary">
                  {cuisine}
                </Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleSwipeLeft}
              className="flex-1 py-3 rounded-md border border-destructive items-center justify-center"
            >
              <Text className="text-destructive font-roboto font-medium">
                Pass
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSwipeRight}
              className="flex-1 py-3 rounded-md bg-success items-center justify-center"
            >
              <Text className="text-white font-roboto font-medium">
                Like
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
