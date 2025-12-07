import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TrendingUp, Activity } from 'lucide-react-native';
import { YieldPredictionResponse, YieldPredictionFormData } from '../../types/farmerYieldPrediction';
import { useYieldForm } from '../../contexts/YieldFormContext';
import { translations } from '../../translations/translationYieldPrediction';

const { width } = Dimensions.get('window');

interface FactorData {
    name: string;
    impact: 'High' | 'Medium' | 'Low';
    value: number;
    color: string;
}

interface RecommendationData {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
}

type RouteParams = {
    PredictYieldScreen: {
        result: YieldPredictionResponse;
        formData: YieldPredictionFormData;
    };
};

export default function PredictYieldScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'PredictYieldScreen'>>();
    const { language } = useYieldForm();

    // Safe translation access with fallback
    const t = useMemo(() => {
        try {
            return translations.results[language] || translations.results.en;
        } catch (error) {
            console.warn('Translation error:', error);
            return translations.results.en;
        }
    }, [language]);

    // Get real data from backend API response
    const { result, formData } = route.params || {};

    // Memoize calculations to prevent unnecessary re-renders
    const displayResults = useMemo(() => {
        try {
            // NEW API FORMAT: Extract prediction data
            const prediction = result?.prediction || {};
            const impactFactors = result?.impact_factors || [];

            // Convert backend response to display format
            const landSize = parseFloat(formData?.land_size_value || '1');
            const landSizeHa = formData?.land_size_unit === 'Acres' ? landSize * 0.404686 : landSize;

            // Calculate total yield for the land
            const predictedYieldKg = prediction.predicted_yield_kg_per_ha
                ? Math.round(prediction.predicted_yield_kg_per_ha * landSizeHa)
                : 0;

            const confidencePercent = Math.round((prediction.confidence_score || 0) * 100);

            // Convert backend impact factors to display format with safe access
            const displayFactors: FactorData[] = impactFactors.map((factor: any) => {
                const impactLevel = factor.impact === 'positive' ? 'High' :
                    factor.impact === 'negative' ? 'Low' : 'Medium';
                
                // Safe string access for Sinhala text
                const factorName = language === 'si' 
                    ? (factor.description_sinhala || factor.description_english || 'N/A')
                    : (factor.description_english || 'N/A');

                return {
                    name: factorName,
                    impact: impactLevel,
                    value: Math.round((factor.weight || 0.5) * 100),
                    color: factor.impact === 'positive' ? '#10B981' :
                        factor.impact === 'negative' ? '#EF4444' : '#F59E0B'
                };
            });

            return {
                predictedYield: `${predictedYieldKg.toLocaleString()} kg`,
                confidence: confidencePercent,
                factors: displayFactors,
            };
        } catch (error) {
            console.error('Error processing results:', error);
            return {
                predictedYield: '0 kg',
                confidence: 0,
                factors: [],
            };
        }
    }, [result, formData, language]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            default: return '#10B981';
        }
    };

    const getPriorityBgColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#FEE2E2';
            case 'Medium': return '#FED7AA';
            default: return '#D1FAE5';
        }
    };

    // Navigation handler with useCallback to prevent re-creation
    const handleNewPrediction = useCallback(() => {
        navigation.navigate('PredictYieldFormWizard' as never);
    }, [navigation]);

    // Memoized component to prevent unnecessary re-renders
    const FactorRadar = useMemo(() => {
        if (!displayResults.factors || displayResults.factors.length === 0) {
            return null;
        }

        return (
            <View style={styles.factorContainer}>
                <View style={styles.factorHeader}>
                    <Activity color="#16A34A" size={20} />
                    <Text style={styles.factorTitle}>{t.impactFactors || 'Impact Factors'}</Text>
                </View>
                <View style={styles.factorList}>
                    {displayResults.factors.map((factor, index) => (
                        <View key={`factor-${index}`} style={styles.factorItem}>
                            <View style={styles.factorInfo}>
                                <Text style={styles.factorName} numberOfLines={2}>{factor.name}</Text>
                                <View style={styles.factorBar}>
                                    <View
                                        style={[
                                            styles.factorBarFill,
                                            {
                                                width: `${Math.min(factor.value, 100)}%`,
                                                backgroundColor: factor.color
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                            <View style={[styles.impactBadge, { backgroundColor: getPriorityBgColor(factor.impact) }]}>
                                <Text style={[styles.impactText, { color: getPriorityColor(factor.impact) }]}>
                                    {factor.impact}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }, [displayResults.factors, t.impactFactors]);


    return (
        <View style={styles.container}>
            {/* Header with decorative elements */}
            <View style={styles.headerDecoration} />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Icon Circle */}
                    <View style={styles.iconCircle}>
                        <View style={styles.iconInner}>
                            <TrendingUp color="#16A34A" size={40} />
                        </View>
                        <View style={styles.pulseRing} />
                    </View>

                    <Text style={styles.title}>{t.title || 'Yield Prediction'}</Text>
                    <Text style={styles.subtitle}>{t.subtitle || 'Your Results'}</Text>

                    {/* Main Result Card */}
                    <Card style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <TrendingUp color="#16A34A" size={24} />
                            <Text style={styles.resultTitle}>{t.predictedYield || 'Predicted Yield'}</Text>
                        </View>

                        <View style={styles.yieldDisplay}>
                            <Text style={styles.yieldValue}>{displayResults.predictedYield}</Text>
                        </View>

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>{t.confidence || 'Confidence'}</Text>
                            <View style={styles.confidenceBar}>
                                <View style={[styles.confidenceFill, { width: `${Math.min(displayResults.confidence, 100)}%` }]} />
                                <Text style={styles.confidenceText}>{displayResults.confidence}%</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Data Sections */}
                    {FactorRadar}

                    {/* Action Button */}
                    <Button
                        mode="contained"
                        onPress={handleNewPrediction}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonText}
                        icon={() => <TrendingUp color="#FFFFFF" size={20} />}
                    >
                        {t.newPrediction || 'New Prediction'}
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        position: 'relative',
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
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 30,
        paddingBottom: 40,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#16A34A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 24,
        textAlign: 'center',
    },
    resultCard: {
        width: '100%',
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534',
    },
    yieldDisplay: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    yieldLabel: {
        fontSize: 16,
        color: '#334155',
        marginBottom: 8,
    },
    yieldValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    confidenceContainer: {
        marginBottom: 10,
    },
    confidenceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    confidenceBar: {
        height: 24,
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    confidenceFill: {
        height: '100%',
        backgroundColor: '#16A34A',
        borderRadius: 12,
    },
    confidenceText: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 12,
    },
    harvestContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    harvestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    harvestTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    harvestContent: {
        gap: 12,
    },
    harvestDateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    harvestLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    harvestDate: {
        fontSize: 14,
        color: '#166534',
        fontWeight: '600',
    },
    harvestTarget: {
        color: '#16A34A',
        fontSize: 16,
        fontWeight: 'bold',
    },
    calendarReminder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 12,
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    reminderText: {
        fontSize: 13,
        color: '#92400E',
        fontWeight: '500',
        flex: 1,
    },
    calendarButton: {
        backgroundColor: '#16A34A',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 16,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    calendarButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    factorContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    factorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    factorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    factorList: {
        gap: 16,
    },
    factorItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    factorInfo: {
        flex: 1,
        marginRight: 12,
    },
    factorName: {
        fontSize: 16,
        color: '#334155',
        marginBottom: 8,
    },
    factorBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    factorBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    impactBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    impactText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    recommendationsContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    recommendationsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    recommendationsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    recommendationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    recommendationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 12,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    recommendationText: {
        flex: 1,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    recommendationDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionButton: {
        marginTop: 20,
        backgroundColor: '#16A34A',
        borderRadius: 50,
        paddingVertical: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
