import React from "react";
import { View, Text, Pressable, Share, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";

interface CodeDisplayProps {
  code: string;
  onCopy?: () => void;
  onShare?: () => void;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  onCopy,
  onShare,
}) => {
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert("Copied!", "Session code copied to clipboard");
      onCopy?.();
    } catch (error) {
      Alert.alert("Error", "Failed to copy code");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my DishMatch session! Code: ${code}`,
        title: "DishMatch Session",
      });
      onShare?.();
    } catch (error) {
      Alert.alert("Error", "Failed to share");
    }
  };

  const codeChars = code.split("");

  return (
    <View className="items-center gap-6">
      {/* Code boxes */}
      <View className="flex-row gap-2">
        {codeChars.map((char, index) => (
          <View
            key={index}
            className="w-15 h-15 rounded-md border-2 border-primary items-center justify-center"
            style={{
              backgroundColor: "#262626",
            }}
          >
            <Text className="font-mono text-display-1 text-primary font-bold">
              {char}
            </Text>
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={handleCopy}
          className="flex-1 px-4 py-3 rounded-md border border-primary items-center justify-center"
        >
          <Text className="text-primary font-roboto font-medium">Copy</Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          className="flex-1 px-4 py-3 rounded-md border border-primary items-center justify-center"
        >
          <Text className="text-primary font-roboto font-medium">Share</Text>
        </Pressable>
      </View>
    </View>
  );
};
