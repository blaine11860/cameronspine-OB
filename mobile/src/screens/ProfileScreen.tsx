import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { COLORS, SPACING, RADIUS } from "../lib/theme";
import { apiGet, apiPost } from "../lib/api";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileCompleted?: boolean;
}

interface PregnancyProfile {
  id: string;
  userId: string;
  dueDate: string;
  currentWeek: number;
  babyName?: string;
  isHighRisk?: boolean;
  notes?: string;
}

const MOCK_USER: User = {
  id: "mock-user-1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@email.com",
};

const MOCK_PROFILE: PregnancyProfile = {
  id: "mock-profile-1",
  userId: "mock-user-1",
  dueDate: "2025-05-15",
  currentWeek: 24,
  babyName: "Baby Johnson",
  isHighRisk: false,
  notes: "Everything progressing well",
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<PregnancyProfile>({
    queryKey: ["/api/pregnancy/profile"],
    queryFn: () => apiGet("/api/pregnancy/profile"),
  });

  const pregnancyProfile = profile ?? MOCK_PROFILE;

  const [babyName, setBabyName] = useState(pregnancyProfile.babyName ?? "");
  const [notes, setNotes] = useState(pregnancyProfile.notes ?? "");
  const [isHighRisk, setIsHighRisk] = useState(pregnancyProfile.isHighRisk ?? false);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<PregnancyProfile>) =>
      apiPost("/api/pregnancy/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pregnancy/profile"] });
      Alert.alert(t.success, t.saved);
    },
    onError: () => Alert.alert(t.error, t.tryAgain),
  });

  function handleSave() {
    saveMutation.mutate({ babyName, notes, isHighRisk });
  }

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(pregnancyProfile.dueDate).getTime() - Date.now()) / 86400000
    )
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {(MOCK_USER.firstName?.[0] ?? "") + (MOCK_USER.lastName?.[0] ?? "")}
          </Text>
        </View>
        <Text style={styles.userName}>
          {MOCK_USER.firstName} {MOCK_USER.lastName}
        </Text>
        <Text style={styles.userEmail}>{MOCK_USER.email}</Text>
      </View>

      {/* Pregnancy Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pregnancyProfile.currentWeek}</Text>
          <Text style={styles.statLabel}>{t.currentWeek}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{daysLeft}</Text>
          <Text style={styles.statLabel}>Days Left</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{40 - pregnancyProfile.currentWeek}</Text>
          <Text style={styles.statLabel}>Weeks Left</Text>
        </View>
      </View>

      {/* Due Date */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.pregnancyInfo}</Text>

        <Text style={styles.label}>{t.dueDate}</Text>
        <Text style={styles.valueText}>
          {new Date(pregnancyProfile.dueDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        <Text style={[styles.label, { marginTop: SPACING.md }]}>{t.babyName}</Text>
        <TextInput
          style={styles.input}
          value={babyName}
          onChangeText={setBabyName}
          placeholder={t.babyName}
          placeholderTextColor={COLORS.textLight}
        />

        <TouchableOpacity
          onPress={() => setIsHighRisk((v) => !v)}
          style={styles.checkRow}
        >
          <View style={[styles.checkbox, isHighRisk && styles.checkboxChecked]}>
            {isHighRisk && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>{t.isHighRisk}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: SPACING.md }]}>{t.notes}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about your pregnancy..."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>{t.save}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.contactInfo}</Text>
        <Text style={styles.label}>{t.firstName}</Text>
        <Text style={styles.valueText}>{MOCK_USER.firstName}</Text>
        <Text style={[styles.label, { marginTop: SPACING.sm }]}>{t.lastName}</Text>
        <Text style={styles.valueText}>{MOCK_USER.lastName}</Text>
        <Text style={[styles.label, { marginTop: SPACING.sm }]}>{t.email}</Text>
        <Text style={styles.valueText}>{MOCK_USER.email}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.roseBg },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  avatarSection: { alignItems: "center", marginBottom: SPACING.lg },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.roseDeep,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  avatarInitials: { fontSize: 28, fontWeight: "700", color: COLORS.white },
  userName: { fontSize: 20, fontWeight: "700", color: COLORS.textDark },
  userEmail: { fontSize: 13, color: COLORS.textMid, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: COLORS.roseDeep },
  statLabel: { fontSize: 11, color: COLORS.textMid, marginTop: 2, textAlign: "center" },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textDark, marginBottom: SPACING.md },
  label: { fontSize: 12, fontWeight: "600", color: COLORS.textMid, marginBottom: 4 },
  valueText: { fontSize: 15, color: COLORS.textDark },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: COLORS.roseDeep, borderColor: COLORS.roseDeep },
  checkmark: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  checkLabel: { fontSize: 14, color: COLORS.textDark },
  saveBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});
