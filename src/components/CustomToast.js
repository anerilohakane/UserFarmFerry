import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

/*
  Professional Toast Configuration
  Usage: 
  Toast.show({
    type: 'success', // or 'error', 'info'
    text1: 'Title',
    text2: 'Message',
  });
*/

export const toastConfig = {
    success: ({ text1, text2 }) => (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                <Feather name="check" size={20} color="#166534" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{text1}</Text>
                {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
        </View>
    ),

    error: ({ text1, text2 }) => (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                <Feather name="alert-circle" size={20} color="#991b1b" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: '#991b1b' }]}>{text1}</Text>
                {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
        </View>
    ),

    info: ({ text1, text2 }) => (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
                <Feather name="info" size={20} color="#075985" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: '#075985' }]}>{text1}</Text>
                {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
        </View>
    ),

    // Special Toast for Wishlist actions
    wishlist: ({ text1, text2 }) => (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: '#ffe4e6' }]}>
                <MaterialCommunityIcons name="heart" size={20} color="#be123c" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: '#be123c' }]}>{text1}</Text>
                {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#004C46', // Default accent color, overridden by specific types if needed but here we just keep it clean or rely on internal icon colors
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    }
});
