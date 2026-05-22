import { Tabs } from "expo-router";
import { View, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#262626",
          borderTopColor: "#404040",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Roboto",
          marginTop: 4,
        },
        tabBarActiveTintColor: "#d97757",
        tabBarInactiveTintColor: "#808080",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: 12,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
