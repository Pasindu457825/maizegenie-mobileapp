import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { PredictYieldStackParamList } from '../../navigation/PredictYieldStack';
import { Leaf, Globe, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type NavProp = StackNavigationProp<PredictYieldStackParamList, 'LanguageSelection'>;

export default function LanguageSelectionScreen() {
    const navigation = useNavigation<NavProp>();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLanguageSelect = (language: 'si' | 'en') => {
        // Navigate to LocationField with language parameter
        navigation.navigate('LocationField', { language });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#15803D" />

            {/* Background Decoration */}
            <View style={styles.backgroundTop} />
            <View style={styles.backgroundBottom} />

            {/* Animated Circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* Logo/Icon Section */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>🌽</Text>
                    </View>
                    <View style={styles.pulseRing} />
                    <View style={[styles.pulseRing, styles.pulseRing2]} />
                </View>

                {/* Title Section */}
                <Animated.View
                    style={[
                        styles.titleContainer,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.title}>Yield Prediction</Text>
                    <Text style={styles.subtitle}>අස්වැන්න පුරෝකථනය</Text>
                </Animated.View>

                {/* Language Selection Cards */}
                <Animated.View
                    style={[
                        styles.languageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.languageHeader}>
                        <Globe color="#10B981" size={24} />
                        <Text style={styles.languageHeaderText}>Choose Your Language</Text>
                        <Text style={styles.languageHeaderTextSi}>ඔබේ භාෂාව තෝරන්න</Text>
                    </View>

                    {/* Sinhala Option */}
                    <TouchableOpacity
                        style={styles.languageCard}
                        onPress={() => handleLanguageSelect('si')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.languageCardContent}>
                            <View style={styles.languageIcon}>
                                <Text style={styles.languageEmoji}>🇱🇰</Text>
                            </View>
                            <View style={styles.languageTextContainer}>
                                <Text style={styles.languageTitle}>සිංහල</Text>
                                <Text style={styles.languageSubtitle}>Sinhala Language</Text>
                            </View>
                            <ChevronRight color="#10B981" size={24} />
                        </View>
                    </TouchableOpacity>

                    {/* English Option */}
                    <TouchableOpacity
                        style={styles.languageCard}
                        onPress={() => handleLanguageSelect('en')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.languageCardContent}>
                            <View style={styles.languageIcon}>
                                <Text style={styles.languageEmoji}>🇬🇧</Text>
                            </View>
                            <View style={styles.languageTextContainer}>
                                <Text style={styles.languageTitle}>English</Text>
                                <Text style={styles.languageSubtitle}>English Language</Text>
                            </View>
                            <ChevronRight color="#10B981" size={24} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    backgroundTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.4,
        backgroundColor: '#047857',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backgroundBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.3,
        backgroundColor: '#ECFDF5',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    circle1: {
        position: 'absolute',
        top: 60,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    circle2: {
        position: 'absolute',
        top: 200,
        left: -80,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
    },
    circle3: {
        position: 'absolute',
        bottom: 100,
        right: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 10,
    },
    iconContainer: {
        marginBottom: 32,
        position: 'relative',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    iconText: {
        fontSize: 64,
    },
    pulseRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: '#10B981',
        opacity: 0.3,
        top: -10,
        left: -10,
    },
    pulseRing2: {
        width: 160,
        height: 160,
        borderRadius: 80,
        opacity: 0.15,
        top: -20,
        left: -20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#D1FAE5',
        marginBottom: 4,
    },
    subtitleEn: {
        fontSize: 16,
        color: '#A7F3D0',
        fontWeight: '500',
    },
    languageContainer: {
        width: '100%',
        maxWidth: 400,
    },
    languageHeader: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#D1FAE5',
    },
    languageHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#047857',
        marginTop: 8,
    },
    languageHeaderTextSi: {
        fontSize: 14,
        color: '#059669',
        marginTop: 4,
    },
    languageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#D1FAE5',
    },
    languageCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    languageIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    languageEmoji: {
        fontSize: 32,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 4,
    },
    languageSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '600',
        marginBottom: 4,
    },
    footerTextSi: {
        fontSize: 13,
        color: '#10B981',
        fontWeight: '500',
    },
});
