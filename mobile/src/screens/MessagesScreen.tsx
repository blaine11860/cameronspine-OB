import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { COLORS, SPACING, RADIUS } from "../lib/theme";
import { apiGet, apiPost } from "../lib/api";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isEmergency?: boolean;
  isRead?: boolean;
}

const MOCK_SENDER_ID = "mock-user-1";
const MOCK_CLINICIAN = { id: "clinician-1", name: "Dr. Moore", role: "clinician" };

export default function MessagesScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: () => apiGet("/api/messages"),
  });

  const sendMutation = useMutation({
    mutationFn: (data: { content: string; recipientId: string; isEmergency: boolean }) =>
      apiPost("/api/messages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageText("");
      setIsEmergency(false);
    },
    onError: () => Alert.alert(t.error, t.tryAgain),
  });

  function handleSend() {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    sendMutation.mutate({
      content: trimmed,
      recipientId: MOCK_CLINICIAN.id,
      isEmergency,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{MOCK_CLINICIAN.name}</Text>
          <Text style={styles.headerSub}>{"Clinician"}</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Message list */}
      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={COLORS.roseDeep} />
      ) : (
        <ScrollView
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>
                No messages yet. Send a message to your care team.
              </Text>
            </View>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === MOCK_SENDER_ID;
            return (
              <View
                key={msg.id}
                style={[
                  styles.bubble,
                  isMine ? styles.bubbleMine : styles.bubbleTheirs,
                  msg.isEmergency && styles.bubbleEmergency,
                ]}
              >
                {msg.isEmergency && (
                  <Text style={styles.emergencyLabel}>🚨 {t.emergency}</Text>
                )}
                <Text
                  style={[
                    styles.bubbleText,
                    isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                  ]}
                >
                  {msg.content}
                </Text>
                <Text style={styles.bubbleTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          onPress={() => setIsEmergency((v) => !v)}
          style={[styles.emergencyToggle, isEmergency && styles.emergencyToggleActive]}
        >
          <Text style={styles.emergencyToggleText}>🚨</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder={t.typeMessage}
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.sendBtnText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.roseBg },
  header: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textDark },
  headerSub: { fontSize: 12, color: COLORS.textMid },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  messageList: { flex: 1 },
  messageContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: "center" },
  bubble: {
    maxWidth: "75%",
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bubbleMine: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.roseDeep,
  },
  bubbleTheirs: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleEmergency: {
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  emergencyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.error,
    marginBottom: 2,
  },
  bubbleText: { fontSize: 14 },
  bubbleTextMine: { color: COLORS.white },
  bubbleTextTheirs: { color: COLORS.textDark },
  bubbleTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  emergencyToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.roseBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emergencyToggleActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  emergencyToggleText: { fontSize: 16 },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textDark,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.roseDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.roseSoft },
  sendBtnText: { color: COLORS.white, fontSize: 16 },
});
