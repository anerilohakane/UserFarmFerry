import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '../types';

const { width, height } = Dimensions.get('window');

const GetStartedScreen = () => {
    const navigation = useNavigation();

    const handleGetStarted = () => {
        navigation.navigate(SCREEN_NAMES.LOGIN);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>

                    {/* Main Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/images/started.png')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Text Content */}
                    <View style={styles.textContainer}>
                        <Text style={styles.tagline}>Pure Freshness</Text>
                        <Text style={styles.subtitle}>
                            From Farm to Your Doorstep
                        </Text>
                    </View>

                    {/* Get Started Button */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGetStarted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    image: {
        width: width * 0.85,
        height: height * 0.4,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 80,
        top: -40,
    },
    tagline: {
        fontSize: 29,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 19,
    },
    button: {
        backgroundColor: '#004C46',
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 29,
        boxShadow: '0px 4px 8px rgba(128, 128, 0, 0.3)',
        elevation: 4,
        width: '100%',
        maxWidth: 270,
        alignItems: 'center',
        top: 19,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
});

export default GetStartedScreen;
