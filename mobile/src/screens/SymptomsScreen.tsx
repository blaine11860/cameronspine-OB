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

interface SymptomLog {
  id: string;
  timestamp: string;
  symptoms: Record<string, number>;
  moodScore?: number;
  notes?: string;
}

const COMMON_SYMPTOMS = [
  "headache",
  "nausea",
  "fatigue",
  "back_pain",
  "swelling",
  "heartburn",
  "cramps",
  "dizziness",
  "constipation",
  "insomnia",
];

export default function SymptomsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, number>>({});
  const [customSymptom, setCustomSymptom] = useState("");
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState("");

  const { data: logs = [], isLoading } = useQuery<SymptomLog[]>({
    queryKey: ["/api/symptoms"],
    queryFn: () => apiGet("/api/symptoms"),
  });

  const logMutation = useMutation({
    mutationFn: (data: { symptoms: Record<string, number>; mood_score: number; notes: string }) =>
      apiPost("/api/symptoms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      setSelectedSymptoms({});
      setCustomSymptom("");
      setMoodScore(5);
      setNotes("");
      Alert.alert(t.success, t.saved);
    },
    onError: () => Alert.alert(t.error, t.tryAgain),
  });

  function toggleSymptom(name: string) {
    setSelectedSymptoms((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: 3 };
    });
  }

  function setSeverity(name: string, value: number) {
    setSelectedSymptoms((prev) => ({ ...prev, [name]: value }));
  }

  function addCustom() {
    const trimmed = customSymptom.trim().toLowerCase().replace(/\s+/g, "_");
    if (trimmed && !selectedSymptoms[trimmed]) {
      setSelectedSymptoms((prev) => ({ ...prev, [trimmed]: 3 }));
      setCustomSymptom("");
    }
  }

  function handleSubmit() {
    if (Object.keys(selectedSymptoms).length === 0) {
      Alert.alert(t.error, "Please select at least one symptom.");
      return;
    }
    logMutation.mutate({ symptoms: selectedSymptoms, mood_score: moodScore, notes });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>{t.symptomTracking}</Text>

      {/* Common Symptoms */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.commonSymptoms}</Text>
        <View style={styles.chipRow}>
          {COMMON_SYMPTOMS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => toggleSymptom(s)}
              style={[
                styles.chip,
                selectedSymptoms[s] ? styles.chipSelected : styles.chipDefault,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSymptoms[s] ? styles.chipTextSelected : styles.chipTextDefault,
                ]}
              >
                {s.replace(/_/g, " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Severity sliders for selected symptoms */}
      {Object.entries(selectedSymptoms).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.severityLevel}</Text>
          {Object.entries(selectedSymptoms).map(([name, val]) => (
            <View key={name} style={styles.severityRow}>
              <Text style={styles.severityName}>{name.replace(/_/g, " ")}</Text>
              <View style={styles.severityButtons}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setSeverity(name, level)}
                    style={[
                      styles.severityBtn,
                      val === level && styles.severityBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityBtnText,
                        val === level && styles.severityBtnTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Custom symptom */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.customSymptom}</Text>
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            value={customSymptom}
            onChangeText={setCustomSymptom}
            placeholder={t.customSymptom}
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addCustom}>
            <Text style={styles.addBtnText}>{t.addSymptom}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mood Score */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t.moodScore}: {moodScore}/10
        </Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setMoodScore(val)}
              style={[styles.moodBtn, moodScore === val && styles.moodBtnActive]}
            >
              <Text
                style={[
                  styles.moodBtnText,
                  moodScore === val && styles.moodBtnTextActive,
                ]}
              >
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.notes}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={logMutation.isPending}
      >
        {logMutation.isPending ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitBtnText}>{t.logSymptomsAction}</Text>
        )}
      </TouchableOpacity>

      {/* History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.symptomHistory}</Text>
        {isLoading ? (
          <ActivityIndicator color={COLORS.roseDeep} />
        ) : logs.length === 0 ? (
          <Text style={styles.emptyText}>No symptom logs yet.</Text>
        ) : (
          logs.slice(0, 10).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logDate}>
                {new Date(log.timestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.logSymptoms}>
                {Object.keys(log.symptoms).join(", ") || "—"}
              </Text>
              {log.moodScore !== undefined && (
                <Text style={styles.logMood}>Mood: {log.moodScore}/10</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.roseBg },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: SPACING.md,
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
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  chipDefault: { borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipSelected: { borderColor: COLORS.roseDeep, backgroundColor: COLORS.roseBg },
  chipText: { fontSize: 12 },
  chipTextDefault: { color: COLORS.textMid },
  chipTextSelected: { color: COLORS.roseDeep, fontWeight: "600" },
  severityRow: {
    marginBottom: SPACING.sm,
  },
  severityName: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  severityButtons: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  severityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  severityBtnActive: {
    backgroundColor: COLORS.roseDeep,
    borderColor: COLORS.roseDeep,
  },
  severityBtnText: { fontSize: 13, color: COLORS.textMid },
  severityBtnTextActive: { color: COLORS.white, fontWeight: "700" },
  customRow: { flexDirection: "row", gap: SPACING.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  addBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
  moodRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  moodBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBtnActive: { backgroundColor: COLORS.roseDeep, borderColor: COLORS.roseDeep },
  moodBtnText: { fontSize: 12, color: COLORS.textMid },
  moodBtnTextActive: { color: COLORS.white, fontWeight: "700" },
  submitBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  emptyText: { fontSize: 13, color: COLORS.textLight, textAlign: "center", paddingVertical: SPACING.sm },
  logRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.roseBg,
  },
  logDate: { fontSize: 12, color: COLORS.textLight, marginBottom: 2 },
  logSymptoms: { fontSize: 13, color: COLORS.textDark },
  logMood: { fontSize: 12, color: COLORS.roseDeep, marginTop: 2 },
});
