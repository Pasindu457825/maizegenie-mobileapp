import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import { Leaf, Droplets, Sun, Wind, CheckCircle, MapPin } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { YieldPredictionRequest, YieldPredictionFormData, YieldPredictionResponse } from '../../types/yieldPrediction';
import { API_BASE } from '../../services/api';

const { width } = Dimensions.get('window');

interface ProcessStep {
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ size: number; color: string }>;
}

const processSteps: ProcessStep[] = [
    {
        id: 1,
        title: 'Analyzing Location',
        description: 'Processing district and climate data',
        icon: MapPin
    },
    {
        id: 2,
        title: 'Evaluating Season',
        description: 'Assessing seasonal patterns',
        icon: Sun
    },
    {
        id: 3,
        title: 'Processing Variety',
        description: 'Analyzing crop characteristics',
        icon: Leaf
    },
    {
        id: 4,
        title: 'Calculating Factors',
        description: 'Computing environmental variables',
        icon: Wind
    },
    {
        id: 5,
        title: 'Generating Prediction',
        description: 'Finalizing yield forecast',
        icon: CheckCircle
    }
];

type RouteParams = {
    PredictYieldLoading: {
        payload: YieldPredictionRequest;
        formData: YieldPredictionFormData;
    };
};

export default function PredictYieldLoadingScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'PredictYieldLoading'>>();
    const { payload, formData } = route.params || {};

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        // Initial fade in animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();

        // Step progression with API call simulation
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                const next = prev + 1;
                if (next >= processSteps.length) {
                    clearInterval(stepInterval);
                    // Make real API call
                    setTimeout(async () => {
                        try {
                            console.log('🚀 Calling yield prediction API...');
                            console.log('🌐 API URL:', `${API_BASE}/api/yield/predict`);
                            console.log('Payload:', JSON.stringify(payload, null, 2));
                            
                            // Add timeout to prevent hanging
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                            
                            const response = await fetch(`${API_BASE}/api/yield/predict`, {
                                method: 'POST',
                                headers: { 
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                                signal: controller.signal,
                            });
                            
                            clearTimeout(timeoutId);

                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(`API Error ${response.status}: ${errorText}`);
                            }

                            const data: YieldPredictionResponse = await response.json();
                            console.log('✅ API Response:', data);

                            // Navigate to results with real API data
                            (navigation as any).navigate('PredictYieldScreen', {
                                result: data,
                                formData: formData, // Also pass form data for context
                            });
                        } catch (error) {
                            console.error('❌ API Error:', error);
                            Alert.alert(
                                'Prediction Failed',
                                error instanceof Error 
                                    ? `Error: ${error.message}` 
                                    : 'Failed to get yield prediction. Please try again.',
                                [
                                    {
                                        text: 'Go Back',
                                        onPress: () => navigation.goBack()
                                    }
                                ]
                            );
                        }
                    }, 500);
                    return prev;
                }
                setProgress((next / processSteps.length) * 100);
                return next;
            });
        }, 600);

        return () => {
            clearInterval(stepInterval);
        };
    }, [navigation, fadeAnim, scaleAnim, payload, formData]);

    const CurrentIcon = processSteps[currentStep]?.icon || Leaf;

    return (
        <View style={styles.container}>
            {/* Animated Background Pattern */}
            <View style={styles.backgroundPattern}>
                {[...Array(6)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.patternCircle,
                            {
                                top: Math.random() * 100,
                                left: Math.random() * 100,
                                opacity: 0.1 + Math.random() * 0.2
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Header decoration with gradient effect */}
            <View style={styles.headerDecoration}>
                <View style={styles.headerGradient} />
            </View>
            
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                {/* Animated Icon Container */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <View style={styles.iconInner}>
                            <CurrentIcon color="#16A34A" size={40} />
                        </View>
                        <View style={styles.pulseRing} />
                        <View style={[styles.pulseRing, styles.pulseRing2]} />
                    </View>
                </View>

                <Text style={styles.title}>Predicting Yield</Text>
                <Text style={styles.subtitle}>Smart Farming Analysis</Text>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View 
                            style={[
                                styles.progressFill, 
                                { width: `${progress}%` }
                            ]} 
                        />
                    </View>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>

                {/* Current Step Display */}
                <View style={styles.stepContainer}>
                    <View style={styles.stepHeader}>
                        <Text style={styles.stepTitle}>{processSteps[currentStep]?.title}</Text>
                        <Text style={styles.stepDescription}>{processSteps[currentStep]?.description}</Text>
                    </View>

                    {/* Step Indicators */}
                    <View style={styles.stepIndicators}>
                        {processSteps.map((step, index) => (
                            <View key={step.id} style={styles.stepIndicator}>
                                <View style={[
                                    styles.stepDot,
                                    index <= currentStep ? styles.stepDotActive : styles.stepDotInactive
                                ]}>
                                    {index < currentStep && (
                                        <CheckCircle color="#FFFFFF" size={12} />
                                    )}
                                </View>
                                {index < processSteps.length - 1 && (
                                    <View style={[
                                        styles.stepLine,
                                        index < currentStep ? styles.stepLineActive : styles.stepLineInactive
                                    ]} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Loading Details */}
                    <View style={styles.loadingDetails}>
                        <View style={styles.loadingRow}>
                            <View style={styles.loadingDot} />
                            <Text style={styles.loadingText}>Analyzing weather patterns...</Text>
                        </View>
                        <View style={styles.loadingRow}>
                            <View style={styles.loadingDot} />
                            <Text style={styles.loadingText}>Processing soil data...</Text>
                        </View>
                        <View style={styles.loadingRow}>
                            <View style={[styles.loadingDot, styles.loadingDotActive]} />
                            <Text style={[styles.loadingText, styles.loadingTextActive]}>
                                Calculating yield metrics...
                            </Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    patternCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#16A34A',
    },
    headerDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: '#16A34A',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 0,
    },
    headerGradient: {
        flex: 1,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#16A34A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        position: 'relative',
    },
    iconInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#15803D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#16A34A',
        opacity: 0.3,
    },
    pulseRing2: {
        width: 140,
        height: 140,
        borderRadius: 70,
        opacity: 0.1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#16A34A',
        fontWeight: '600',
        marginBottom: 30,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
    },
    progressBar: {
        width: '80%',
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#16A34A',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    stepContainer: {
        width: '100%',
        alignItems: 'center',
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 4,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 14,
        color: '#334155',
        textAlign: 'center',
    },
    stepIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        marginBottom: 30,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotActive: {
        backgroundColor: '#16A34A',
    },
    stepDotInactive: {
        backgroundColor: '#E2E8F0',
        borderWidth: 2,
        borderColor: '#CBD5E1',
    },
    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: '#16A34A',
    },
    stepLineInactive: {
        backgroundColor: '#E2E8F0',
    },
    loadingDetails: {
        width: '100%',
        paddingHorizontal: 20,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#CBD5E1',
        marginRight: 12,
    },
    loadingDotActive: {
        backgroundColor: '#16A34A',
    },
    loadingText: {
        fontSize: 14,
        color: '#64748B',
    },
    loadingTextActive: {
        color: '#16A34A',
        fontWeight: '600',
    },
});