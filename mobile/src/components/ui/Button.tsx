import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useColors } from "@/hooks/useColors";

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
  const colors = useColors();

  const bgColor = {
    primary: colors.primary,
    secondary: colors.surfaceLight,
    ghost: "transparent",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: variant === "ghost" ? colors.border : undefined,
        opacity: disabled || loading ? 0.5 : 1,
      }}
    >
      <Text
        className="font-roboto font-medium text-body"
        style={{ color: variant === "ghost" ? colors.text : "#ffffff" }}
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
  const colors = useColors();

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.placeholderText}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={{
        color: colors.text,
        fontFamily: "Roboto",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.inputBg,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        marginBottom: 16,
      }}
    />
  );
};

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, onPress }) => {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
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

const getAvatarColor = (userId: string): string => {
  const colors = ["#d97757", "#f5a76d", "#c7622a", "#e8a885", "#c67352"];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  online = true,
  userId,
}) => {
  const colors = useColors();
  const sizes = { sm: 32, md: 40, lg: 56 };
  const sizeValue = sizes[size];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const bgColor = getAvatarColor(userId);

  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          className="font-dm-sans font-bold text-white"
          style={{ fontSize: sizeValue * 0.4 }}
        >
          {initials}
        </Text>
      </View>
      {online && (
        <View
          style={{
            position: "absolute",
            width: sizeValue * 0.25,
            height: sizeValue * 0.25,
            borderRadius: sizeValue * 0.125,
            right: -2,
            top: -2,
            backgroundColor: "#4caf50",
            borderWidth: 2,
            borderColor: colors.surface,
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

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress }) => {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: selected ? colors.primary : colors.surfaceLight,
      }}
    >
      <Text
        className="text-caption font-medium"
        style={{ color: selected ? "#ffffff" : colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md" }) => {
  const sizes = { sm: 24, md: 40, lg: 60 };

  return (
    <View style={{ width: sizes[size], height: sizes[size], justifyContent: "center", alignItems: "center" }}>
      <Text className="text-primary text-body">Loading...</Text>
    </View>
  );
};
