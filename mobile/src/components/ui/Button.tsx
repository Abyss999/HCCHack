import React from "react";
import { View, Text, Pressable, Image } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) => {
  const baseClass = "rounded-md px-4 py-3 min-h-11 justify-center items-center";
  const variantClass = {
    primary: "bg-primary",
    secondary: "bg-neutral-surface-light",
    ghost: "border border-neutral-border",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass} ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      <Text
        className={`text-white font-roboto font-medium text-body ${
          variant === "ghost" ? "text-neutral-text" : ""
        }`}
      >
        {loading ? "Loading..." : label}
      </Text>
    </Pressable>
  );
};

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}) => {
  return (
    <TextInput
      className="input mb-4"
      placeholder={placeholder}
      placeholderTextColor="#808080"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={{
        color: "#ffffff",
        fontFamily: "Roboto",
      }}
    />
  );
};

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className="card"
      style={{
        backgroundColor: "#262626",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      {children}
    </Pressable>
  );
};

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  userId: string;
}

// Simple deterministic color from user ID
const getAvatarColor = (userId: string): string => {
  const colors = ["#d97757", "#f5a76d", "#c7622a", "#e8a885", "#c67352"];
  const hash = userId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  online = true,
  userId,
}) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
  };
  const sizeValue = sizes[size];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const bgColor = getAvatarColor(userId);

  return (
    <View className="relative">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: sizeValue,
          height: sizeValue,
          backgroundColor: bgColor,
        }}
      >
        <Text
          className="font-dm-sans font-bold text-white"
          style={{
            fontSize: sizeValue * 0.4,
          }}
        >
          {initials}
        </Text>
      </View>
      {online && (
        <View
          className="absolute rounded-full bg-success border-2 border-neutral-surface"
          style={{
            width: sizeValue * 0.25,
            height: sizeValue * 0.25,
            right: -2,
            top: -2,
          }}
        />
      )}
    </View>
  );
};

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1 rounded-full ${
        selected ? "bg-primary" : "bg-neutral-surface-light"
      }`}
    >
      <Text className="text-neutral-text text-caption font-medium">
        {label}
      </Text>
    </Pressable>
  );
};

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
}) => {
  const sizes = {
    sm: 24,
    md: 40,
    lg: 60,
  };

  return (
    <View
      className="justify-center items-center"
      style={{
        width: sizes[size],
        height: sizes[size],
      }}
    >
      {/* Placeholder for spinner - would use react-native-reanimated in production */}
      <Text className="text-primary text-body">Loading...</Text>
    </View>
  );
};

import { TextInput } from "react-native";
