import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Leaf, CheckCircle, AlertCircle, BarChart3, PieChart, Droplets, Sun, Calendar, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface NutrientData {
    name: string;
    amount: string;
    percentage: number;
    purpose: string;
    color: string;
    unit: string;
}

interface ScheduleData {
    stage: string;
    timing: string;
    fertilizer: string;
    amount: string;
    priority: 'High' | 'Medium' | 'Low';
}

interface WarningData {
    title: string;
    description: string;
    severity: 'Critical' | 'Warning' | 'Info';
    icon: React.ComponentType<{ size: number; color: string }>;
}

export default function FertilizerAdvisorResultsScreen() {
    const navigation = useNavigation();

    const mockResults = {
        recommendation: 'Apply NPK 15-15-15 fertilizer',
        totalArea: '2.5 acres',
        totalFertilizer: '500 kg',
        nutrients: [
            { 
                name: 'Nitrogen (N)', 
                amount: '75 kg', 
                percentage: 30, 
                purpose: 'Promotes leaf growth and chlorophyll production',
                color: '#10B981',
                unit: 'kg/acre'
            },
            { 
                name: 'Phosphorus (P)', 
                amount: '75 kg', 
                percentage: 30, 
                purpose: 'Supports root development and flowering',
                color: '#3B82F6',
                unit: 'kg/acre'
            },
            { 
                name: 'Potassium (K)', 
                amount: '100 kg', 
                percentage: 40, 
                purpose: 'Enhances disease resistance and grain filling',
                color: '#F59E0B',
                unit: 'kg/acre'
            }
        ] as NutrientData[],
        schedule: [
            { 
                stage: 'Basal Application', 
                timing: 'At planting', 
                fertilizer: 'NPK 15-15-15', 
                amount: '200 kg',
                priority: 'High' as const
            },
            { 
                stage: 'First Top Dress', 
                timing: '3-4 weeks after planting', 
                fertilizer: 'Urea', 
                amount: '150 kg',
                priority: 'High' as const
            },
            { 
                stage: 'Second Top Dress', 
                timing: '6-8 weeks after planting', 
                fertilizer: 'NPK 15-15-15', 
                amount: '150 kg',
                priority: 'Medium' as const
            }
        ] as ScheduleData[],
        warnings: [
            { 
                title: 'Weather Conditions', 
                description: 'Avoid application during heavy rain to prevent runoff',
                severity: 'Critical' as const,
                icon: AlertCircle
            },
            { 
                title: 'Soil Moisture', 
                description: 'Apply when soil has adequate moisture for better absorption',
                severity: 'Warning' as const,
                icon: Droplets
            },
            { 
                title: 'Safety Equipment', 
                description: 'Wear gloves and mask when handling fertilizers',
                severity: 'Info' as const,
                icon: CheckCircle
            }
        ] as WarningData[]
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return '#EF4444';
            case 'Warning': return '#F59E0B';
            default: return '#10B981';
        }
    };

    const getSeverityBgColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return '#FEE2E2';
            case 'Warning': return '#FED7AA';
            default: return '#D1FAE5';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            default: return '#10B981';
        }
    };

    const NutrientPieChart = () => {
        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <PieChart color="#16A34A" size={20} />
                    <Text style={styles.chartTitle}>Nutrient Breakdown</Text>
                </View>
                
                {/* Pie Chart Visualization */}
                <View style={styles.pieChartContainer}>
                    <View style={styles.pieChart}>
                        {mockResults.nutrients.map((nutrient, index) => {
                            const rotation = index === 0 ? 0 : 
                                index === 1 ? mockResults.nutrients[0].percentage * 3.6 :
                                (mockResults.nutrients[0].percentage + mockResults.nutrients[1].percentage) * 3.6;
                            
                            return (
                                <View 
                                    key={index}
                                    style={[
                                        styles.pieSlice,
                                        {
                                            backgroundColor: nutrient.color,
                                            transform: [{ rotate: `${rotation}deg` }],
                                            width: `${nutrient.percentage * 2}%`,
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>
                    
                    {/* Legend */}
                    <View style={styles.nutrientLegend}>
                        {mockResults.nutrients.map((nutrient, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: nutrient.color }]} />
                                <View style={styles.legendText}>
                                    <Text style={styles.legendName}>{nutrient.name}</Text>
                                    <Text style={styles.legendAmount}>{nutrient.amount}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const ApplicationSchedule = () => {
        return (
            <View style={styles.scheduleContainer}>
                <View style={styles.scheduleHeader}>
                    <Calendar color="#16A34A" size={20} />
                    <Text style={styles.scheduleTitle}>Application Schedule</Text>
                </View>
                
                {mockResults.schedule.map((item, index) => (
                    <View key={index} style={styles.scheduleItem}>
                        <View style={styles.scheduleTimeline}>
                            <View style={[styles.timelineDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                            {index < mockResults.schedule.length - 1 && (
                                <View style={styles.timelineLine} />
                            )}
                        </View>
                        
                        <View style={styles.scheduleContent}>
                            <View style={styles.scheduleHeaderRow}>
                                <Text style={styles.scheduleStage}>{item.stage}</Text>
                                <View style={[styles.priorityBadge, { backgroundColor: getSeverityBgColor(item.priority) }]}>
                                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                        {item.priority}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.scheduleDetails}>
                                <View style={styles.scheduleDetail}>
                                    <Sun color="#64748B" size={14} />
                                    <Text style={styles.scheduleDetailText}>{item.timing}</Text>
                                </View>
                                <View style={styles.scheduleDetail}>
                                    <Leaf color="#64748B" size={14} />
                                    <Text style={styles.scheduleDetailText}>{item.fertilizer}</Text>
                                </View>
                                <View style={styles.scheduleDetail}>
                                    <TrendingUp color="#64748B" size={14} />
                                    <Text style={styles.scheduleDetailText}>{item.amount}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const NutrientDetails = () => {
        return (
            <View style={styles.nutrientDetailsContainer}>
                <View style={styles.nutrientDetailsHeader}>
                    <BarChart3 color="#16A34A" size={20} />
                    <Text style={styles.nutrientDetailsTitle}>Nutrient Details</Text>
                </View>
                
                {mockResults.nutrients.map((nutrient, index) => (
                    <View key={index} style={styles.nutrientDetailItem}>
                        <View style={styles.nutrientDetailHeader}>
                            <View style={[styles.nutrientColorIndicator, { backgroundColor: nutrient.color }]} />
                            <Text style={styles.nutrientDetailName}>{nutrient.name}</Text>
                            <Text style={styles.nutrientDetailAmount}>{nutrient.amount}</Text>
                        </View>
                        
                        <View style={styles.nutrientBar}>
                            <View 
                                style={[
                                    styles.nutrientBarFill, 
                                    { 
                                        width: `${nutrient.percentage * 2}%`,
                                        backgroundColor: nutrient.color
                                    }
                                ]} 
                            />
                        </View>
                        
                        <Text style={styles.nutrientPurpose}>{nutrient.purpose}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const WarningsSection = () => {
        return (
            <View style={styles.warningsContainer}>
                <View style={styles.warningsHeader}>
                    <AlertCircle color="#16A34A" size={20} />
                    <Text style={styles.warningsTitle}>Important Guidelines</Text>
                </View>
                
                {mockResults.warnings.map((warning, index) => {
                    const Icon = warning.icon;
                    return (
                        <View key={index} style={styles.warningItem}>
                            <View style={[styles.warningIconContainer, { backgroundColor: getSeverityBgColor(warning.severity) }]}>
                                <Icon color={getSeverityColor(warning.severity)} size={16} />
                            </View>
                            <View style={styles.warningContent}>
                                <Text style={styles.warningTitle}>{warning.title}</Text>
                                <Text style={styles.warningDescription}>{warning.description}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header decoration */}
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
                            <Leaf color="#16A34A" size={40} />
                        </View>
                        <View style={styles.pulseRing} />
                    </View>

                    <Text style={styles.title}>Fertilizer Recommendation</Text>
                    <Text style={styles.subtitle}>Smart Farming Analysis</Text>

                    {/* Main Recommendation Card */}
                    <View style={styles.mainRecommendationCard}>
                        <View style={styles.recommendationHeader}>
                            <CheckCircle color="#16A34A" size={24} />
                            <Text style={styles.recommendationTitle}>Your Recommendation</Text>
                        </View>

                        <View style={styles.recommendationContainer}>
                            <Text style={styles.recommendationText}>{mockResults.recommendation}</Text>
                        </View>

                        <View style={styles.quickStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Area</Text>
                                <Text style={styles.statValue}>{mockResults.totalArea}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Fertilizer</Text>
                                <Text style={styles.statValue}>{mockResults.totalFertilizer}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Visual Components */}
                    <NutrientPieChart />
                    <NutrientDetails />
                    <ApplicationSchedule />
                    <WarningsSection />

                    {/* Action Button */}
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('FertilizerAdvisor' as never)}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonText}
                        icon={() => <Leaf color="#FFFFFF" size={20} />}
                    >
                        New Recommendation
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
    mainRecommendationCard: {
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
    recommendationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    recommendationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534',
    },
    recommendationContainer: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    recommendationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#16A34A',
        textAlign: 'center',
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
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
    pieChartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pieChart: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F0FDF4',
        borderWidth: 2,
        borderColor: '#BBF7D0',
        position: 'relative',
        overflow: 'hidden',
    },
    pieSlice: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        borderRadius: 60,
    },
    nutrientLegend: {
        flex: 1,
        marginLeft: 20,
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        flex: 1,
    },
    legendName: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
    },
    legendAmount: {
        fontSize: 12,
        color: '#64748B',
    },
    nutrientDetailsContainer: {
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
    nutrientDetailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    nutrientDetailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    nutrientDetailItem: {
        marginBottom: 20,
    },
    nutrientDetailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    nutrientColorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    nutrientDetailName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    nutrientDetailAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    nutrientBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    nutrientBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    nutrientPurpose: {
        fontSize: 14,
        color: '#64748B',
        fontStyle: 'italic',
    },
    scheduleContainer: {
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
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    scheduleTimeline: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginTop: 8,
    },
    scheduleContent: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    scheduleHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    scheduleStage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
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
    scheduleDetails: {
        gap: 8,
    },
    scheduleDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scheduleDetailText: {
        fontSize: 14,
        color: '#64748B',
    },
    warningsContainer: {
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
    warningsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    warningsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
    },
    warningItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    warningIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    warningDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
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
