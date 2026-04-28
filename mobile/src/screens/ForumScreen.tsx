import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { COLORS, SPACING, RADIUS } from "../lib/theme";
import { apiGet, apiPost } from "../lib/api";

interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  createdAt: string;
  replyCount?: number;
}

const CATEGORIES = ["all", "general", "nutrition", "exercise", "symptoms", "postpartum"];

export default function ForumScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");

  const { data: threads = [], isLoading } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/threads", category],
    queryFn: () =>
      apiGet(
        `/api/forum/threads${category !== "all" ? `?category=${category}` : ""}`
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; category: string }) =>
      apiPost("/api/forum/threads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
      setShowCreate(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("general");
      Alert.alert(t.success, "Thread created!");
    },
    onError: () => Alert.alert(t.error, t.tryAgain),
  });

  function handleCreate() {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert(t.error, "Title and content are required.");
      return;
    }
    createMutation.mutate({ title: newTitle, content: newContent, category: newCategory });
  }

  const categoryLabel: Record<string, string> = {
    all: t.allCategories,
    general: t.general,
    nutrition: t.nutrition,
    exercise: t.exercise,
    symptoms: t.symptomsCategory,
    postpartum: t.postpartum,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.communityForum}</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setShowCreate(true)}
        >
          <Text style={styles.createBtnText}>+ {t.createNewThread}</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.catChip, category === cat && styles.catChipActive]}
          >
            <Text
              style={[styles.catChipText, category === cat && styles.catChipTextActive]}
            >
              {categoryLabel[cat] ?? cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Thread list */}
      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={COLORS.roseDeep} />
      ) : (
        <ScrollView
          style={styles.threadList}
          contentContainerStyle={styles.threadListContent}
          showsVerticalScrollIndicator={false}
        >
          {threads.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>
                No threads yet. Be the first to start a conversation!
              </Text>
            </View>
          ) : (
            threads.map((thread) => (
              <View key={thread.id} style={styles.threadCard}>
                <View style={styles.threadTop}>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>
                      {categoryLabel[thread.category] ?? thread.category}
                    </Text>
                  </View>
                  <Text style={styles.threadDate}>
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.threadTitle}>{thread.title}</Text>
                <Text style={styles.threadContent} numberOfLines={2}>
                  {thread.content}
                </Text>
                <View style={styles.threadFooter}>
                  <Text style={styles.replyCount}>
                    💬 {thread.replyCount ?? 0} {t.replies}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Thread Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.createNewThread}</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>{t.threadTitle}</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder={t.threadTitle}
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.label}>{t.categories}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: SPACING.md }}
            >
              {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={[styles.catChip, newCategory === cat && styles.catChipActive, { marginRight: 8 }]}
                >
                  <Text
                    style={[styles.catChipText, newCategory === cat && styles.catChipTextActive]}
                  >
                    {categoryLabel[cat] ?? cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>{t.threadContent}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newContent}
              onChangeText={setNewContent}
              placeholder={t.threadContent}
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>{t.createThread}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.roseBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  createBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  createBtnText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  categoryBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 52,
  },
  categoryContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 8 },
  catChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  catChipActive: { backgroundColor: COLORS.roseDeep, borderColor: COLORS.roseDeep },
  catChipText: { fontSize: 12, color: COLORS.textMid },
  catChipTextActive: { color: COLORS.white, fontWeight: "600" },
  threadList: { flex: 1 },
  threadListContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: "center" },
  threadCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  threadTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  catBadge: {
    backgroundColor: COLORS.roseBg,
    borderRadius: RADIUS.full,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  catBadgeText: { fontSize: 11, color: COLORS.roseDeep, fontWeight: "600" },
  threadDate: { fontSize: 11, color: COLORS.textLight },
  threadTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textDark, marginBottom: 4 },
  threadContent: { fontSize: 13, color: COLORS.textMid, marginBottom: SPACING.sm },
  threadFooter: { flexDirection: "row" },
  replyCount: { fontSize: 12, color: COLORS.textLight },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  modalClose: { fontSize: 20, color: COLORS.textMid, padding: 4 },
  modalBody: { padding: SPACING.md },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textDark, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  submitBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
