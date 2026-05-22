/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary (Warm Oranges/Browns)
        primary: {
          DEFAULT: "#d97757",
          light: "#f5a76d",
          dark: "#c7622a",
          accent: "#e8a885",
        },
        // Neutrals (Dark Mode)
        neutral: {
          bg: "#1a1a1a",
          surface: "#262626",
          "surface-light": "#3d3d3d",
          text: "#ffffff",
          "text-secondary": "#b3b3b3",
          "text-tertiary": "#808080",
          border: "#404040",
        },
        // Semantic
        success: "#4caf50",
        destructive: "#ef5350",
        warning: "#ffa726",
        info: "#29b6f6",
      },
      fontFamily: {
        "dm-sans": ["DM Sans", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        // Display
        "display-1": ["40px", { lineHeight: "48px" }],
        "display-2": ["32px", { lineHeight: "40px" }],
        // Heading
        "h1": ["24px", { lineHeight: "32px" }],
        "h2": ["20px", { lineHeight: "28px" }],
        // Body
        "body": ["16px", { lineHeight: "24px" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        "caption": ["12px", { lineHeight: "16px" }],
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
      },
      borderRadius: {
        "sm": "12px",
        "md": "16px",
        "lg": "24px",
      },
      shadowColor: {
        DEFAULT: "rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
