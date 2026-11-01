import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import CartItemRow from '../../components/CartItemRow';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { formatRWF } from '../../constants/i18n';

export default function CustomerCart() {
    const { cartItems, totalPrice } = useCart();
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="basket-outline" size={54} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>{t.emptyCart}</Text>
                    <Text style={styles.emptySubtitle}>
                        Discover curated items and add them to your shopping bag.
                    </Text>
                    <Button title={t.exploreProducts} onPress={() => router.push('/(tabs)/tab1')} style={{ marginTop: 20, width: 220 }} />
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={({ item }) => <CartItemRow item={item} />}
                        keyExtractor={(item) => item.product_id.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t.total}</Text>
                            <Text style={styles.totalValue}>{formatRWF(totalPrice)}</Text>
                        </View>
                        <Button title={t.checkout} onPress={() => router.push('/checkout')} />
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12, backgroundColor: Colors.background },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 4,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalLabel: { fontSize: 16, fontWeight: '600', color: Colors.textMuted },
    totalValue: { fontSize: 20, fontWeight: '800', color: Colors.primaryDark },
});
