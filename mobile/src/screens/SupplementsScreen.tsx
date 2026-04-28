import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { useTranslation } from "../lib/i18n";
import { COLORS, SPACING, RADIUS } from "../lib/theme";

interface Product {
  privateLabelName: string;
  sku: string;
  retailPrice: number;
  count: string;
  countUnit: string;
  weight: number;
  weightUnit: string;
  isOnBackorder: boolean;
}

const PRODUCTS: Product[] = [
  {
    privateLabelName: "3PL Probiotics 30 C",
    sku: "000000000300095860",
    retailPrice: 41.10,
    count: "30",
    countUnit: "Capsules",
    weight: 1.6,
    weightUnit: "OZ",
    isOnBackorder: false,
  },
  {
    privateLabelName: "3PL Mood Formula 60 C",
    sku: "000000000300095859",
    retailPrice: 39.53,
    count: "60",
    countUnit: "Capsules",
    weight: 2.4,
    weightUnit: "OZ",
    isOnBackorder: false,
  },
  {
    privateLabelName: "Prenatal Vitamins 90 C",
    sku: "000000000300095861",
    retailPrice: 45.00,
    count: "90",
    countUnit: "Capsules",
    weight: 3.2,
    weightUnit: "OZ",
    isOnBackorder: false,
  },
  {
    privateLabelName: "Omega-3 DHA 60 S",
    sku: "000000000300095862",
    retailPrice: 38.00,
    count: "60",
    countUnit: "Softgels",
    weight: 2.0,
    weightUnit: "OZ",
    isOnBackorder: true,
  },
];

type Cart = Record<string, number>;

export default function SupplementsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [showCart, setShowCart] = useState(false);

  const filtered = PRODUCTS.filter((p) =>
    p.privateLabelName.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(sku: string) {
    setCart((prev) => ({ ...prev, [sku]: (prev[sku] ?? 0) + 1 }));
  }

  function removeFromCart(sku: string) {
    setCart((prev) => {
      const next = { ...prev };
      if ((next[sku] ?? 0) > 1) {
        next[sku]--;
      } else {
        delete next[sku];
      }
      return next;
    });
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [sku, qty]) => {
    const p = PRODUCTS.find((x) => x.sku === sku);
    return total + (p ? p.retailPrice * qty : 0);
  }, 0);

  if (showCart) {
    const cartItems = Object.entries(cart).map(([sku, qty]) => ({
      product: PRODUCTS.find((p) => p.sku === sku)!,
      qty,
    }));

    return (
      <View style={styles.container}>
        <View style={styles.cartHeader}>
          <TouchableOpacity onPress={() => setShowCart(false)}>
            <Text style={styles.backBtn}>← {t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.cartTitle}>Cart ({cartCount})</Text>
        </View>

        <ScrollView
          style={styles.cartList}
          contentContainerStyle={{ padding: SPACING.md }}
        >
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>{t.emptyCart}</Text>
          ) : (
            cartItems.map(({ product, qty }) => (
              <View key={product.sku} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{product.privateLabelName}</Text>
                  <Text style={styles.cartItemPrice}>
                    ${product.retailPrice.toFixed(2)} × {qty} = $
                    {(product.retailPrice * qty).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => removeFromCart(product.sku)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(product.sku)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {cartItems.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({cartCount} {t.items})</Text>
              <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => Linking.openURL("https://mooreobgyn.com/")}
            >
              <Text style={styles.checkoutBtnText}>{t.checkout}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.supplements}</Text>
        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => setShowCart(true)}
        >
          <Text style={styles.cartIconText}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t.searchSupplements}
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <Text style={styles.subtitle}>{t.supplementsDescription}</Text>

      {/* Products */}
      <ScrollView
        style={styles.productList}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((product) => (
          <View key={product.sku} style={styles.productCard}>
            <View style={styles.productInfo}>
              <View style={styles.productIcon}>
                <Text style={styles.productIconText}>💊</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product.privateLabelName}</Text>
                <Text style={styles.productDetails}>
                  {product.count} {product.countUnit} · {product.weight}{" "}
                  {product.weightUnit}
                </Text>
                {product.isOnBackorder && (
                  <View style={styles.backorderBadge}>
                    <Text style={styles.backorderText}>
                      {"Backorder"}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.productPrice}>${product.retailPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, product.isOnBackorder && styles.addBtnDisabled]}
              disabled={product.isOnBackorder}
              onPress={() => addToCart(product.sku)}
            >
              <Text style={styles.addBtnText}>
                {product.isOnBackorder ? "Backorder" : t.addToCart}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No products match your search.</Text>
        )}
      </ScrollView>
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
  cartIconBtn: { position: "relative", padding: 4 },
  cartIconText: { fontSize: 24 },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.roseDeep,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  searchContainer: { padding: SPACING.md, backgroundColor: COLORS.white },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMid,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  productList: { flex: 1 },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productInfo: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, marginBottom: SPACING.sm },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.roseBg,
    alignItems: "center",
    justifyContent: "center",
  },
  productIconText: { fontSize: 22 },
  productName: { fontSize: 14, fontWeight: "600", color: COLORS.textDark, marginBottom: 2 },
  productDetails: { fontSize: 12, color: COLORS.textMid },
  backorderBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: RADIUS.full,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  backorderText: { fontSize: 10, color: "#d97706", fontWeight: "600" },
  productPrice: { fontSize: 16, fontWeight: "700", color: COLORS.roseDeep },
  addBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: "center",
  },
  addBtnDisabled: { backgroundColor: COLORS.textLight },
  addBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  emptyText: { fontSize: 14, color: COLORS.textLight, textAlign: "center", marginTop: SPACING.xl },
  // Cart
  cartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { fontSize: 15, color: COLORS.roseDeep, fontWeight: "600" },
  cartTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  cartList: { flex: 1 },
  cartItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cartItemName: { fontSize: 14, fontWeight: "600", color: COLORS.textDark },
  cartItemPrice: { fontSize: 13, color: COLORS.textMid, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.roseBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtnText: { fontSize: 16, color: COLORS.roseDeep, fontWeight: "700" },
  qtyText: { fontSize: 15, fontWeight: "600", color: COLORS.textDark, minWidth: 20, textAlign: "center" },
  cartFooter: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  totalLabel: { fontSize: 15, color: COLORS.textMid },
  totalValue: { fontSize: 18, fontWeight: "700", color: COLORS.roseDeep },
  checkoutBtn: {
    backgroundColor: COLORS.roseDeep,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
