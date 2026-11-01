import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { formatRWF } from '../constants/i18n';

export default function ProductCard({ product }: { product: any }) {
    const router = useRouter();

    const rawImages: string[] = Array.isArray(product?.images) ? product.images : [];
    const validImages = rawImages.filter((img: any) => typeof img === 'string' && img.startsWith('http'));
    const imageUrl = validImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
    const imageCount = validImages.length;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/product/${product.id}`)}
            activeOpacity={0.85}
        >
            <View style={styles.imageWrapper}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                {imageCount > 1 && (
                    <View style={styles.imageBadge}>
                        <Ionicons name="images-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.imageBadgeText}>{imageCount}</Text>
                    </View>
                )}
                {product?.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText} numberOfLines={1}>
                            {product.category}
                        </Text>
                    </View>
                )}
            </View>
            <Text style={styles.name} numberOfLines={1}>
                {product?.name || 'Product'}
            </Text>
            <View style={styles.priceRow}>
                <Text style={styles.price}>{formatRWF(parseFloat(product?.price || 0))}</Text>
                <View style={styles.quickAddIcon}>
                    <Ionicons name="add" size={16} color={Colors.primary} />
                </View>
            </View>
            {/* Show quantity badge only when low stock */}
            {typeof product?.quantity === 'number' && product.quantity <= 5 && product.quantity > 0 && (
                <View style={styles.lowStockBadge}>
                    <Ionicons name="flame" size={12} color={Colors.error} />
                    <Text style={styles.lowStock}>Only {product.quantity} left!</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 3,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: 135,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    imageBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    categoryBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.primaryDark,
    },
    quickAddIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lowStockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 3,
    },
    lowStock: {
        fontSize: 11,
        color: Colors.error,
        fontWeight: '700',
    },
});
