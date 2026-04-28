import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { COLORS, SPACING, RADIUS } from "../lib/theme";
import { apiGet } from "../lib/api";

interface PregnancyProfile {
  id: string;
  currentWeek: number;
  dueDate: string;
  babyName?: string;
}

interface Milestone {
  week: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

const DEFAULT_MILESTONES: Milestone[] = [
  { week: 8, title: "First Prenatal Visit", description: "Initial checkup and blood tests", status: "completed" },
  { week: 12, title: "First Trimester Screening", description: "NT scan and blood work", status: "completed" },
  { week: 16, title: "Quad Screen Test", description: "Optional genetic screening", status: "completed" },
  { week: 20, title: "Anatomy Scan", description: "Detailed ultrasound examination", status: "completed" },
  { week: 24, title: "Glucose Screening", description: "Test for gestational diabetes", status: "current" },
  { week: 28, title: "Third Trimester Begins", description: "Regular checkups increase", status: "upcoming" },
  { week: 32, title: "Growth Scan", description: "Check baby's growth and position", status: "upcoming" },
  { week: 36, title: "Group B Strep Test", description: "Screening for GBS infection", status: "upcoming" },
  { week: 40, title: "Due Date", description: "Expected delivery date", status: "upcoming" },
];

function statusColor(status: Milestone["status"]) {
  if (status === "completed") return COLORS.success;
  if (status === "current") return COLORS.roseDeep;
  return COLORS.textLight;
}

function statusBg(status: Milestone["status"]) {
  if (status === "completed") return COLORS.mint;
  if (status === "current") return COLORS.roseBg;
  return "#f3f4f6";
}

export default function TimelineScreen() {
  const { t } = useTranslation();

  const { data: profile } = useQuery<PregnancyProfile>({
    queryKey: ["/api/pregnancy/profile"],
    queryFn: () => apiGet("/api/pregnancy/profile"),
  });

  const currentWeek = profile?.currentWeek ?? 24;

  const milestones: Milestone[] = DEFAULT_MILESTONES.map((m) => ({
    ...m,
    status:
      m.week < currentWeek
        ? "completed"
        : m.week === currentWeek
        ? "current"
        : "upcoming",
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.pregnancyTimeline}</Text>
        <TouchableOpacity
          style={styles.apptBtn}
          onPress={() => Linking.openURL("https://mooreobgyn.com/")}
        >
          <Text style={styles.apptBtnText}>{t.scheduleAppointment}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.weekLabel}>Currently at Week {currentWeek}</Text>

      {/* Milestone list */}
      {milestones.map((m, i) => (
        <View key={i} style={styles.milestoneRow}>
          {/* Line */}
          <View style={styles.lineCol}>
            <View
              style={[styles.circle, { backgroundColor: statusBg(m.status), borderColor: statusColor(m.status) }]}
            >
              <Text style={[styles.circleText, { color: statusColor(m.status) }]}>
                {m.week}
              </Text>
            </View>
            {i < milestones.length - 1 && <View style={styles.line} />}
          </View>

          {/* Content */}
          <View style={[styles.milestoneCard, { borderLeftColor: statusColor(m.status) }]}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneTitle}>{m.title}</Text>
              <Text style={[styles.statusBadge, { color: statusColor(m.status) }]}>
                {m.status === "completed"
                  ? t.completed
                  : m.status === "current"
                  ? "Current"
                  : t.upcoming}
              </Text>
            </View>
            <Text style={styles.milestoneDesc}>{m.description}</Text>
          </View>
        </View>
      ))}
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
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  apptBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  apptBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  weekLabel: {
    fontSize: 13,
    color: COLORS.textMid,
    marginBottom: SPACING.md,
  },
  milestoneRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  lineCol: {
    alignItems: "center",
    width: 52,
    marginRight: SPACING.sm,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: COLORS.border,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    flex: 1,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
  milestoneDesc: {
    fontSize: 12,
    color: COLORS.textMid,
  },
});
