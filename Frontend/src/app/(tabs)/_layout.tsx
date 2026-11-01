import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { DevIcon } from '../../components/DevInfoModal';

export default function TabLayout() {
    const { user } = useAuth();
    const { cartCount } = useCart();
    const { t } = useLanguage();
    const isAdmin = user?.role === 'admin' || user?.is_admin === true;
    const insets = useSafeAreaInsets();

    // Dynamically calculate bottom padding for modern navigation bars
    const isAndroid = Platform.OS === 'android';
    const bottomPadding = insets.bottom > 0 ? insets.bottom : (isAndroid ? 10 : 6);
    const tabHeight = 56 + bottomPadding;

    return (
        <Tabs
            backBehavior="history"
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: tabHeight,
                    paddingBottom: bottomPadding,
                    paddingTop: 6,
                    elevation: 12,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginTop: 2,
                    letterSpacing: 0.2,
                },
                headerStyle: {
                    backgroundColor: Colors.primaryDark,
                    elevation: 4,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '800',
                    fontSize: 18,
                    letterSpacing: 0.5,
                },
                headerRight: () => <DevIcon />,
            }}
        >
            <Tabs.Screen
                name="tab1"
                options={{
                    title: isAdmin ? t.dashboard : t.home,
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={isAdmin ? (focused ? 'stats-chart' : 'stats-chart-outline') : (focused ? 'bag-handle' : 'bag-handle-outline')}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tab2"
                options={{
                    title: isAdmin ? t.products : t.search,
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={isAdmin ? (focused ? 'cube' : 'cube-outline') : (focused ? 'compass' : 'compass-outline')}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tab3"
                options={{
                    title: isAdmin ? t.deliveries : t.cart,
                    tabBarBadge: !isAdmin && cartCount > 0 ? cartCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: Colors.secondary,
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: '700',
                    },
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={isAdmin ? (focused ? 'paper-plane' : 'paper-plane-outline') : (focused ? 'basket' : 'basket-outline')}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tab4"
                options={{
                    title: isAdmin ? t.reports : t.orders,
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={isAdmin ? (focused ? 'bar-chart' : 'bar-chart-outline') : (focused ? 'receipt' : 'receipt-outline')}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t.profile,
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'person-circle' : 'person-circle-outline'}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            {/* Root index redirect so /(tabs) routes smoothly to tab1 */}
            <Tabs.Screen
                name="index"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
