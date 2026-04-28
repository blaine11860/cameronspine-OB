import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Image,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { COLORS, SPACING, RADIUS } from "../lib/theme";
import { apiGet } from "../lib/api";

interface PregnancyProfile {
  id: string;
  userId: string;
  dueDate: string;
  currentWeek: number;
  babyName?: string;
  isHighRisk?: boolean;
  notes?: string;
}

// Demo data — same as the web app's mock
const MOCK_USER = {
  firstName: "Sarah",
  lastName: "Johnson",
  profileImageUrl:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
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

function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  return Math.max(0, Math.ceil((due.getTime() - today.getTime()) / 86400000));
}

export default function HomeScreen() {
  const { t } = useTranslation();

  const { data: profile } = useQuery<PregnancyProfile>({
    queryKey: ["/api/pregnancy/profile"],
    queryFn: () => apiGet("/api/pregnancy/profile"),
  });

  const pregnancyProfile = profile ?? MOCK_PROFILE;
  const days = daysUntilDue(pregnancyProfile.dueDate);

  const { data: recentSymptoms, isLoading: symptomsLoading } = useQuery<any[]>({
    queryKey: ["/api/symptoms"],
    queryFn: () => apiGet("/api/symptoms"),
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>♥</Text>
          </View>
          <Text style={styles.appName}>Moore Maternal Care</Text>
        </View>
        <Image
          source={{ uri: MOCK_USER.profileImageUrl }}
          style={styles.avatar}
        />
      </View>

      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          {t.welcomeBack}, {MOCK_USER.firstName}!
        </Text>
        <Text style={styles.subtitleText}>{t.pregnancyJourney}</Text>
      </View>

      {/* Progress Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1, marginRight: SPACING.sm }]}>
          <Text style={styles.statNumber}>{pregnancyProfile.currentWeek}</Text>
          <Text style={styles.statLabel}>{t.currentWeek}</Text>
        </View>
        <View style={[styles.statCard, { flex: 1, marginLeft: SPACING.sm }]}>
          <Text style={styles.statNumber}>{days}</Text>
          <Text style={styles.statLabel}>{t.daysUntilDue}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Week {pregnancyProfile.currentWeek} of 40
        </Text>
        {pregnancyProfile.babyName && (
          <Text style={styles.cardSubtitle}>{pregnancyProfile.babyName}</Text>
        )}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${(pregnancyProfile.currentWeek / 40) * 100}%` as any },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Week 1</Text>
          <Text style={styles.progressLabel}>Week 40</Text>
        </View>
      </View>

      {/* Schedule Appointment */}
      <View style={styles.appointmentCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appointmentTitle}>{t.schedulingSection}</Text>
          <Text style={styles.appointmentDesc}>{t.schedulingDescription}</Text>
        </View>
        <TouchableOpacity
          style={styles.appointmentBtn}
          onPress={() => Linking.openURL("https://mooreobgyn.com/")}
        >
          <Text style={styles.appointmentBtnText}>{t.bookAppointment}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.recentActivity}</Text>
        {symptomsLoading ? (
          <ActivityIndicator color={COLORS.roseDeep} />
        ) : recentSymptoms && recentSymptoms.length > 0 ? (
          recentSymptoms.slice(0, 3).map((s: any, i: number) => (
            <View key={s.id ?? i} style={styles.activityRow}>
              <View style={styles.activityDot} />
              <View>
                <Text style={styles.activityText}>Symptom logged</Text>
                <Text style={styles.activityDate}>
                  {new Date(s.loggedAt ?? s.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No recent activity. Start logging symptoms!
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roseBg,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.roseDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    color: COLORS.white,
    fontSize: 18,
  },
  appName: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.roseSoft,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textMid,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.roseDeep,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMid,
    marginTop: 2,
  },
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMid,
    marginBottom: SPACING.sm,
  },
  progressBg: {
    height: 10,
    backgroundColor: COLORS.roseBg,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.full,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  appointmentCard: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  appointmentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  appointmentDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    flexShrink: 1,
  },
  appointmentBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  appointmentBtnText: {
    color: COLORS.roseDeep,
    fontSize: 13,
    fontWeight: "600",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.roseBg,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.roseDeep,
  },
  activityText: {
    fontSize: 13,
    color: COLORS.textDark,
  },
  activityDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    paddingVertical: SPACING.md,
  },
});
