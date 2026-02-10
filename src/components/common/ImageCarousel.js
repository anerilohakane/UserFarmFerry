import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

const ImageCarousel = ({ images, interval = 4000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current; // Opacity of the CURRENT image

    useEffect(() => {
        if (!images || images.length === 0) return;

        const timer = setInterval(() => {
            // Start fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => {
                // After fade out, change index and fade in
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            });
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval, fadeAnim]);

    if (!images || images.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Background Image (Next Image) - Visible when top image fades out */}
            <Image
                source={images[(currentIndex + 1) % images.length]}
                style={[styles.image, StyleSheet.absoluteFill]}
                resizeMode="cover"
            />

            {/* Foreground Image (Current Image) - Fades in/out */}
            <Animated.Image
                source={images[currentIndex]}
                style={[styles.image, { opacity: fadeAnim }]}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // helpful for cross-fades
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default ImageCarousel;
