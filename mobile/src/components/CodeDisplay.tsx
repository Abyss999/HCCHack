import React from "react";
import { View, Text, Pressable, Share, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useColors } from "@/hooks/useColors";

interface CodeDisplayProps {
  code: string;
  onCopy?: () => void;
  onShare?: () => void;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, onCopy, onShare }) => {
  const colors = useColors();

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Copied!", text2: "Session code copied to clipboard" });
      onCopy?.();
    } catch {
      Toast.show({ type: "error", text1: "Failed to copy" });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my DishMatch session! Code: ${code}`,
        title: "DishMatch Session",
      });
      onShare?.();
    } catch {
      Alert.alert("Error", "Failed to share");
    }
  };

  return (
    <View style={{ alignItems: "center", gap: 24 }}>
      {/* Code boxes */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {code.split("").map((char, index) => (
          <View
            key={index}
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surfaceLight,
            }}
          >
            <Text className="font-mono text-display-1 text-primary font-bold">
              {char}
            </Text>
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={handleCopy}
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-primary font-roboto font-medium">Copy</Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-primary font-roboto font-medium">Share</Text>
        </Pressable>
      </View>
    </View>
  );
};
