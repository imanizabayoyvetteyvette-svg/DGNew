import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Button({ title, onPress, loading, style, textStyle, variant = 'primary' }: any) {
    const isSecondary = variant === 'secondary';
    return (
        <TouchableOpacity
            style={[
                styles.btn,
                isSecondary && styles.btnSecondary,
                style,
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={isSecondary ? Colors.primary : '#FFFFFF'} />
            ) : (
                <Text style={[styles.txt, isSecondary && styles.txtSecondary, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    btnSecondary: {
        backgroundColor: Colors.primaryLight,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        shadowOpacity: 0.05,
    },
    txt: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    txtSecondary: {
        color: Colors.primaryDark,
    },
});
