import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';
import { SCREEN_NAMES } from '../types';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        image: require('../../assets/images/onboarding_dairy.png'),
        title: 'Pure & Organic Dairy',
        subtitle: 'Fresh milk, cheese, and butter straight from the farm to your table.',
    },
    {
        id: '2',
        image: require('../../assets/images/onboarding_fruit_veg.png'),
        title: 'Fresh from the Farm',
        subtitle: "Hand-picked fruits and vegetables delivering nature's best nutrition.",
    },
    {
        id: '3',
        image: require('../../assets/images/onboarding_grains.png'),
        title: 'The Finest Grains',
        subtitle: 'Wholesome grains and cereals for a healthy and balanced diet.',
    },
];

const OnboardingScreen = () => {
    const navigation = useNavigation();
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace(SCREEN_NAMES.GET_STARTED);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                bounces={false}
            />

            {/* Floating Circle Arrow Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <ArrowRight color="#fff" size={32} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    slide: {
        width: width,
        height: height,
        alignItems: 'center',
    },
    imageContainer: {
        width: width,
        height: height * 0.65, // 65% image height
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        width: width,
        paddingHorizontal: 32,
        paddingTop: 40,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32, // Overlap slightly
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#004C46',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    pagination: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#004C46',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#e5e7eb',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        right: 32,
    },
    circleButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#004C46',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#004C46',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});

export default OnboardingScreen;
