import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { TouchableOpacity } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const { colors } = useTheme();
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerRight: () => (
          <TouchableOpacity 
            onPress={async () => { await signOut(); router.replace("/sign-in"); }}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Лобі", 
          headerTitle: "Карткові ігри",
          tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size} color={color} /> 
        }} 
      />
    </Tabs>
  );
}
