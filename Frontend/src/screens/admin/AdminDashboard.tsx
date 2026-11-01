import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    RefreshControl, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { formatRWF } from '../../constants/i18n';

interface OrderItem {
    id: string;
    total_price: number;
    delivered: boolean;
    items?: any[];
    created_at?: string;
}

interface Stats {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    revenue: number;
}

// In-memory cache for instant zero-spinner loading on tab navigation
let cachedStats: Stats | null = null;
let cachedRecentOrders: OrderItem[] = [];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>(cachedStats || {
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        revenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState<OrderItem[]>(cachedRecentOrders);
    const [loading, setLoading] = useState(!cachedStats);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = useCallback(async (silent = false) => {
        try {
            if (!silent && !cachedStats) setLoading(true);
            let products: any[] = [];
            try {
                const pRes = await api.get('/products/');
                products = pRes.data || [];
            } catch (err) {
                console.warn('Products fetch error', err);
            }

            let orders: OrderItem[] = [];
            try {
                const oRes = await api.get('/orders/all');
                orders = oRes.data || [];
            } catch {
                try {
                    const fallbackRes = await api.get('/orders/');
                    orders = fallbackRes.data || [];
                } catch (e) {
                    console.warn('Orders fetch error', e);
                }
            }

            const pending = orders.filter((o) => !o.delivered).length;
            const delivered = orders.filter((o) => o.delivered).length;
            const revenue = orders
                .filter((o) => o.delivered)
                .reduce((sum: number, o: any) => sum + (parseFloat(o.total_price) || 0), 0);

            const newStats = {
                totalProducts: products.length,
                totalOrders: orders.length,
                pendingOrders: pending,
                deliveredOrders: delivered,
                revenue,
            };

            cachedStats = newStats;
            cachedRecentOrders = orders.slice(0, 5);

            setStats(newStats);
            setRecentOrders(orders.slice(0, 5));
        } catch (e) {
            console.error('Dashboard fetch error', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(!!cachedStats);
    }, [fetchStats]);

    const onRefresh = () => { setRefreshing(true); fetchStats(true); };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
    }

    const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
            }
        >
            <View style={styles.header}>
                <View style={styles.headerBadge}>
                    <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                    <Text style={styles.headerBadgeText}>E-SHOP CONTROL PANEL</Text>
                </View>
                <Text style={styles.greeting}>Welcome, Administrator</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <Text style={styles.sectionTitle}>Overview & Metrics</Text>
            <View style={styles.statsGrid}>
                <StatCard icon="cube-outline" label="Active Inventory" value={stats.totalProducts} color={Colors.primary} />
                <StatCard icon="receipt-outline" label="Total Purchases" value={stats.totalOrders} color="#0284C7" />
                <StatCard icon="time-outline" label="Pending Dispatch" value={stats.pendingOrders} color={Colors.secondary} />
                <StatCard icon="checkmark-circle-outline" label="Delivered" value={stats.deliveredOrders} color={Colors.success} />
                <StatCard icon="cash-outline" label="Delivered Revenue" value={formatRWF(stats.revenue)} color="#0F766E" />
            </View>

            {/* Recent Order Notifications */}
            <Text style={styles.sectionTitle}>Recent Customer Orders</Text>
            <View style={styles.recentOrdersContainer}>
                {recentOrders.length === 0 ? (
                    <Text style={styles.emptyText}>No recent orders available.</Text>
                ) : (
                    recentOrders.map((ord) => (
                        <View key={ord.id} style={styles.orderNotification}>
                            <View style={styles.orderNotifHeader}>
                                <Text style={styles.orderNotifId}>Order #{ord.id.startsWith('ORD-') ? ord.id.replace('ORD-', '') : ord.id.replace(/-/g, '').slice(0, 5).toUpperCase()}</Text>
                                <View style={[styles.badge, { backgroundColor: ord.delivered ? Colors.success : Colors.secondary }]}>
                                    <Text style={styles.badgeText}>{ord.delivered ? 'Delivered' : 'Pending'}</Text>
                                </View>
                            </View>
                            <Text style={styles.orderNotifDetails}>
                                Total: {formatRWF(parseFloat(ord.total_price as any || 0))} · {Array.isArray(ord.items) ? ord.items.filter((i: any) => !i?.is_customer_info).length : 0} items
                            </Text>
                        </View>
                    ))
                )}
            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        backgroundColor: Colors.primaryDark,
        padding: 22,
        paddingTop: 18,
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 8,
        gap: 5,
    },
    headerBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    greeting: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
    email: { fontSize: 13, color: '#CCFBF1', marginTop: 4 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textMuted,
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsGrid: { paddingHorizontal: 16, gap: 10 },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    statIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
    statLabel: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    recentOrdersContainer: { paddingHorizontal: 16, gap: 10 },
    orderNotification: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 1,
    },
    orderNotifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderNotifId: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    orderNotifDetails: {
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    emptyText: {
        color: Colors.textMuted,
        textAlign: 'center',
        marginVertical: 16,
    },
});
