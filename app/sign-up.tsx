import { useTheme } from "@/context/ThemeContext";
import { useAuthActions } from "@convex-dev/auth/react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SignUpScreen() {
  const { signIn } = useAuthActions();
  const convex = useConvex();
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUp = async () => {
    setErrorMsg("");
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password.trim()) {
      setErrorMsg("Будь ласка, заповніть усі обов'язкові поля.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Введіть коректний email (наприклад: name@gmail.com).");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Пароль має містити мінімум 8 символів.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Паролі не співпадають. Перевірте ввід.");
      return;
    }

    setIsLoading(true);
    try {
      const nameExists = await convex.query(api.users.checkName, { name: cleanName });
      if (nameExists) {
        setErrorMsg("Гравець з таким ім'ям вже існує! Придумайте інше.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", cleanName);
      formData.append("email", cleanEmail);
      formData.append("password", password);
      formData.append("flow", "signUp");

      await signIn("password", formData);
      router.replace("/(tabs)");
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      // Красиво обробляємо помилку з існуючим email
      if (errorMessage.includes("already exists")) {
        setErrorMsg("Цей email вже зареєстрований! Увійдіть або використайте інший.");
      } else {
        setErrorMsg(`Помилка: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="person-add" size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Новий гравець</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Створіть профіль для збереження статистики</Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="person-outline" size={22} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Ваше ім'я" value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="mail-outline" size={22} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="lock-outline" size={22} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Пароль (мін. 8 символів)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.textMuted} />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="verified-user" size={22} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Підтвердження пароля" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor={colors.textMuted} />
            </View>

            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]} onPress={handleSignUp} disabled={isLoading} activeOpacity={0.8}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <>
                <MaterialIcons name="how-to-reg" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Зареєструватися</Text>
              </>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>Вже маєте акаунт? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Увійти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: "center", marginBottom: 32 },
  iconContainer: { width: 80, height: 80, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 16, elevation: 4 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center" },
  form: { gap: 14 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  errorText: { color: "#F43F5E", textAlign: "center", fontSize: 14, fontWeight: "600", marginTop: 4, marginBottom: 4 },
  button: { flexDirection: "row", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, elevation: 3 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 28 },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: "700" },
});
