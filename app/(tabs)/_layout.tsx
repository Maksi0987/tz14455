import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarStyle: { backgroundColor: "#0F172A", borderTopColor: "#1E293B" },
      tabBarActiveTintColor: "#3B82F6",
      tabBarInactiveTintColor: "#64748B"
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: "Ігри", tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size} color={color} /> }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ title: "Кабінет", tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} 
      />
    </Tabs>
  );
}