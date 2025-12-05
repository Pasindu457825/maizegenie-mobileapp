import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Leaf, TrendingUp, AlertCircle, CheckCircle, BarChart3, PieChart, Activity } from 'lucide-react-native';

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

export default function PredictYieldScreen() {
    const navigation = useNavigation();

    const mockResults = {
        predictedYield: '2,450 kg',
        confidence: 85,
        factors: [
            { name: 'Weather conditions', impact: 'High' as const, value: 85, color: '#EF4444' },
            { name: 'Soil quality', impact: 'Medium' as const, value: 65, color: '#F59E0B' },
            { name: 'Irrigation', impact: 'High' as const, value: 78, color: '#EF4444' },
            { name: 'Seed variety', impact: 'Low' as const, value: 45, color: '#10B981' }
        ] as FactorData[],
        recommendations: [
            { title: 'Monitor soil moisture', description: 'Check soil moisture levels weekly for optimal growth', priority: 'High' as const },
            { title: 'Apply fertilizer', description: 'Use NPK fertilizer at recommended intervals', priority: 'High' as const },
            { title: 'Pest control', description: 'Implement integrated pest management measures', priority: 'Medium' as const },
            { title: 'Weed management', description: 'Remove weeds regularly to reduce competition', priority: 'Medium' as const }
        ] as RecommendationData[],
        monthlyYield: [
            { month: 'Jan', expected: 0, actual: 0 },
            { month: 'Feb', expected: 0, actual: 0 },
            { month: 'Mar', expected: 200, actual: 180 },
            { month: 'Apr', expected: 400, actual: 380 },
            { month: 'May', expected: 600, actual: 590 },
            { month: 'Jun', expected: 800, actual: 820 },
            { month: 'Jul', expected: 1000, actual: 980 },
            { month: 'Aug', expected: 1200, actual: 1150 },
            { month: 'Sep', expected: 1400, actual: 1380 },
            { month: 'Oct', expected: 1600, actual: 1590 },
            { month: 'Nov', expected: 1800, actual: 1750 },
            { month: 'Dec', expected: 2000, actual: 1950 }
        ]
    };

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

    const YieldBarChart = () => {
        const maxValue = Math.max(...mockResults.monthlyYield.map(d => d.expected));
        
        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <BarChart3 color="#16A34A" size={20} />
                    <Text style={styles.chartTitle}>Expected Yield Progress</Text>
                </View>
                <View style={styles.chart}>
                    {mockResults.monthlyYield.map((data, index) => (
                        <View key={index} style={styles.barContainer}>
                            <View style={styles.barWrapper}>
                                <View 
                                    style={[
                                        styles.expectedBar, 
                                        { 
                                            height: `${(data.expected / maxValue) * 100}%`,
                                            backgroundColor: '#BBF7D0'
                                        }
                                    ]} 
                                />
                                <View 
                                    style={[
                                        styles.actualBar, 
                                        { 
                                            height: `${(data.actual / maxValue) * 100}%`,
                                            backgroundColor: '#16A34A'
                                        }
                                    ]} 
                                />
                            </View>
                            <Text style={styles.barLabel}>{data.month}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#BBF7D0' }]} />
                        <Text style={styles.legendText}>Expected</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
                        <Text style={styles.legendText}>Actual</Text>
                    </View>
                </View>
            </View>
        );
    };

    const FactorRadar = () => {
        return (
            <View style={styles.factorContainer}>
                <View style={styles.factorHeader}>
                    <Activity color="#16A34A" size={20} />
                    <Text style={styles.factorTitle}>Impact Factors</Text>
                </View>
                <View style={styles.factorList}>
                    {mockResults.factors.map((factor, index) => (
                        <View key={index} style={styles.factorItem}>
                            <View style={styles.factorInfo}>
                                <Text style={styles.factorName}>{factor.name}</Text>
                                <View style={styles.factorBar}>
                                    <View 
                                        style={[
                                            styles.factorBarFill, 
                                            { 
                                                width: `${factor.value}%`,
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
    };

    const RecommendationsCard = () => {
        return (
            <View style={styles.recommendationsContainer}>
                <View style={styles.recommendationsHeader}>
                    <CheckCircle color="#16A34A" size={20} />
                    <Text style={styles.recommendationsTitle}>Recommendations</Text>
                </View>
                {mockResults.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                        <View style={styles.recommendationContent}>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(rec.priority) }]} />
                            <View style={styles.recommendationText}>
                                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                                <Text style={styles.recommendationDescription}>{rec.description}</Text>
                            </View>
                        </View>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityBgColor(rec.priority) }]}>
                            <Text style={[styles.priorityText, { color: getPriorityColor(rec.priority) }]}>
                                {rec.priority}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

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

                    <Text style={styles.title}>Yield Prediction Results</Text>
                    <Text style={styles.subtitle}>Smart Farming Analysis</Text>

                    {/* Main Result Card */}
                    <Card style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <TrendingUp color="#16A34A" size={24} />
                            <Text style={styles.resultTitle}>Prediction Summary</Text>
                        </View>

                        <View style={styles.yieldDisplay}>
                            <Text style={styles.yieldLabel}>Predicted Yield</Text>
                            <Text style={styles.yieldValue}>{mockResults.predictedYield}</Text>
                        </View>

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>Confidence Level</Text>
                            <View style={styles.confidenceBar}>
                                <View style={[styles.confidenceFill, { width: `${mockResults.confidence}%` }]} />
                                <Text style={styles.confidenceText}>{mockResults.confidence}%</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Charts Section */}
                    <YieldBarChart />
                    <FactorRadar />
                    <RecommendationsCard />

                    {/* Action Button */}
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('PredictYieldFormWizard' as never)}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonText}
                        icon={() => <TrendingUp color="#FFFFFF" size={20} />}
                    >
                        New Prediction
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
    chartContainer: {
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
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        marginBottom: 12,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
    },
    barWrapper: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: '80%',
        position: 'relative',
    },
    expectedBar: {
        width: 4,
        borderRadius: 2,
        marginRight: 1,
    },
    actualBar: {
        width: 4,
        borderRadius: 2,
        position: 'absolute',
        left: '50%',
    },
    barLabel: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 4,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#64748B',
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
