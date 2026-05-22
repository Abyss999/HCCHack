import { useTheme } from "@/context/ThemeContext";

const LIGHT = {
  bg: "#faf9f7",
  surface: "#f2efeb",
  surfaceLight: "#e8e3dc",
  text: "#1c1917",
  textSecondary: "#78716c",
  textTertiary: "#a8a29e",
  border: "#d6d0c8",
  primary: "#d97757",
  primaryLight: "#f5a76d",
  placeholderText: "#a8a29e",
  inputBg: "#f2efeb",
  inputBorder: "#d6d0c8",
  cardBg: "#f2efeb",
  rankBadgeFallback: "#e8e3dc",
  rankBadgeFallbackText: "#1c1917",
};

const DARK = {
  bg: "#1a1a1a",
  surface: "#262626",
  surfaceLight: "#3d3d3d",
  text: "#ffffff",
  textSecondary: "#b3b3b3",
  textTertiary: "#808080",
  border: "#404040",
  primary: "#d97757",
  primaryLight: "#f5a76d",
  placeholderText: "#808080",
  inputBg: "#262626",
  inputBorder: "#404040",
  cardBg: "#262626",
  rankBadgeFallback: "#3d3d3d",
  rankBadgeFallbackText: "#ffffff",
};

export type Colors = typeof DARK;

export function useColors(): Colors {
  const { resolvedScheme } = useTheme();
  return resolvedScheme === "dark" ? DARK : LIGHT;
}
