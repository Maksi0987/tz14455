import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileScreen() {
  const user = useQuery(api.users.currentUser);
  const stats = useQuery(api.stats.getMyStats);
  const { signOut } = useAuthActions();
  const router = useRouter();
  
  const { isDark, setIsDark, musicOn, setMusicOn, sfxOn, setSfxOn, colors } = useTheme();

  // Показуємо завантаження тільки якщо дані ще тягнуться з бази
  if (user === undefined || stats === undefined) {
    return <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator color="#10B981" /></View>;
  }

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  // ФІКС: Якщо статистики ще немає (null), ставимо значення за замовчуванням
  const safeStats = stats || { level: 1, xp: 0, rank: "Новачок", wins: 0, losses: 0, draws: 0 };

  const currentLevelXp = (safeStats.level - 1) ** 2 * 10;
  const nextLevelXp = safeStats.level ** 2 * 10;
  const progressPercent = Math.min(100, Math.max(0, ((safeStats.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Кабінет</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#F43F5E" />
          </TouchableOpacity>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "Г"}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || "Гравець"}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>🏆 Ранг: {safeStats.rank}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Налаштування</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Темна тема (Лобі)</Text>
            </View>
            <Switch value={isDark} onValueChange={setIsDark} trackColor={{ false: "#767577", true: "#3B82F6" }} />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={musicOn ? "musical-notes" : "volume-mute"} size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Фонова музика</Text>
            </View>
            <Switch value={musicOn} onValueChange={setMusicOn} trackColor={{ false: "#767577", true: "#10B981" }} />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Ionicons name={sfxOn ? "volume-high" : "volume-mute-outline"} size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Звукові ефекти (SFX)</Text>
            </View>
            <Switch value={sfxOn} onValueChange={setSfxOn} trackColor={{ false: "#767577", true: "#8B5CF6" }} />
          </View>
        </View>

        <View style={[styles.levelCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.levelHeader}>
            <Text style={[styles.levelTitle, { color: colors.text }]}>Рівень {safeStats.level}</Text>
            <Text style={styles.xpText}>{safeStats.xp} / {nextLevelXp} XP</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.bg }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Статистика</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.1)" }]}>
            <Text style={[styles.statNumber, { color: "#10B981" }]}>{safeStats.wins}</Text>
            <Text style={styles.statLabel}>Перемоги</Text>
          </View>
          <View style={[styles.statBox, { borderColor: "#F43F5E", backgroundColor: "rgba(244,63,94,0.1)" }]}>
            <Text style={[styles.statNumber, { color: "#F43F5E" }]}>{safeStats.losses}</Text>
            <Text style={styles.statLabel}>Поразки</Text>
          </View>
          <View style={[styles.statBox, { borderColor: "#F59E0B", backgroundColor: "rgba(245,158,11,0.1)" }]}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>{safeStats.draws}</Text>
            <Text style={styles.statLabel}>Нічиї</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  logoutBtn: { padding: 8, backgroundColor: "rgba(244,63,94,0.1)", borderRadius: 12 },
  profileCard: { alignItems: "center", padding: 24, borderRadius: 24, marginBottom: 20, borderWidth: 1 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#3B82F6", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  userName: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 16 },
  rankBadge: { backgroundColor: "#F59E0B", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  rankText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  
  settingsCard: { padding: 8, borderRadius: 24, marginBottom: 24, borderWidth: 1 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(150,150,150,0.2)" },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { fontSize: 16, fontWeight: "600" },

  levelCard: { padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1 },
  levelHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  levelTitle: { fontSize: 18, fontWeight: "bold" },
  xpText: { color: "#3B82F6", fontSize: 16, fontWeight: "bold" },
  progressBarBg: { height: 12, borderRadius: 6, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 6 },
  
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12, marginLeft: 4 },
  statsGrid: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  statNumber: { fontSize: 28, fontWeight: "900", marginBottom: 4 },
  statLabel: { color: "#94A3B8", fontSize: 14, fontWeight: "600" }
});