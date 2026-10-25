import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { DevIcon } from '../../components/DevInfoModal';

export default function TabLayout() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.is_admin === true;

    return (
        <Tabs
            backBehavior="history"
            screenOptions={{
                tabBarPosition: 'top',
                tabBarActiveTintColor: Colors.accent,
                tabBarInactiveTintColor: '#B7B0A4',
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: Colors.primary,
                    borderBottomColor: '#3B352A',
                    borderBottomWidth: 1,
                    height: 58,
                    paddingBottom: 6,
                    paddingTop: 6,
                    elevation: 10,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
                headerRight: () => <DevIcon />,
            }}
        >
            <Tabs.Screen
                name="tab1"
                options={{
                    title: isAdmin ? 'Dashboard' : 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name={isAdmin ? 'grid-outline' : 'home-outline'}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tab2"
                options={{
                    title: isAdmin ? 'Products' : 'Search',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name={isAdmin ? 'cube-outline' : 'search-outline'}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tab3"
                options={{
                    title: isAdmin ? 'Deliveries' : 'Cart',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name={isAdmin ? 'checkmark-done-circle-outline' : 'cart-outline'}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tab4"
                options={{
                    title: isAdmin ? 'Reports' : 'Orders',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name={isAdmin ? 'bar-chart-outline' : 'list-outline'}
                            size={size}
                            color={color as string}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-outline"
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