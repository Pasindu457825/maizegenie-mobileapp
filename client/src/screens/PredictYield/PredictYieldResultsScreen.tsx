import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, Alert, Platform, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Leaf, TrendingUp, AlertCircle, CheckCircle, Calendar, Activity, CalendarPlus } from 'lucide-react-native';
import { YieldPredictionResponse, YieldPredictionFormData } from '../../types/yieldPrediction';
import { useYieldForm } from '../../contexts/YieldFormContext';
import { translations } from '../../translations/yieldPrediction';
import * as ExpoCalendar from 'expo-calendar';

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
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

    // Get translations
    const t = translations.results[language];

    // Get real data from backend API response
    const { result, formData } = route.params || {};

    // Debug logging
    console.log('📊 Results Screen - Received Data:');
    console.log('Backend Result:', JSON.stringify(result, null, 2));
    console.log('Form Data:', JSON.stringify(formData, null, 2));

    // Convert backend response to display format
    const landSize = parseFloat(formData?.land_size_value || '1');
    const predictedYieldKg = result?.yield_prediction_t_ha
        ? Math.round(result.yield_prediction_t_ha * 1000 * landSize)
        : 0;

    console.log('Calculated Yield (kg):', predictedYieldKg);

    const confidencePercent = result?.confidence === 'High' ? 85 :
        result?.confidence === 'Medium' ? 70 : 50;

    // Convert backend factors to display format
    const displayFactors: FactorData[] = result?.factors?.map(factor => ({
        name: factor.name,
        impact: factor.impact,
        value: Math.round(factor.value * 100), // Convert 0-1 to 0-100
        color: factor.impact === 'High' ? '#EF4444' :
            factor.impact === 'Medium' ? '#F59E0B' : '#10B981'
    })) || [];

    const displayResults = {
        predictedYield: `${predictedYieldKg.toLocaleString()} kg`,
        confidence: confidencePercent,
        factors: displayFactors,
        harvestWindow: result?.harvest_window,
        calendarEvent: result?.calendar_event
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

    // One-Tap Add to Calendar Function
    const addHarvestToCalendar = async () => {
        if (!displayResults.harvestWindow) {
            Alert.alert(
                language === 'si' ? 'දෝෂයකි' : 'Error',
                language === 'si' ? 'අස්වැන්න නෙලීමේ කාලය නොමැත' : 'No harvest window available'
            );
            return;
        }

        setIsAddingToCalendar(true);

        try {
            // Request calendar permissions
            const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    language === 'si' ? 'අවසරය අවශ්‍යයි' : 'Permission Required',
                    t.permissionDenied
                );
                setIsAddingToCalendar(false);
                return;
            }

            // Get default calendar
            const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];

            if (!defaultCalendar) {
                throw new Error('No calendar available');
            }

            // Parse dates
            const startDate = new Date(displayResults.harvestWindow.start);
            const targetDate = new Date(displayResults.harvestWindow.target);
            const endDate = new Date(displayResults.harvestWindow.end);

            // Create event title and notes
            const eventTitle = language === 'si' 
                ? `🌾 ${formData?.variety || 'ඉරිඟු'} අස්වැන්න නෙලීම`
                : `🌾 ${formData?.variety || 'Maize'} Harvest`;

            const eventNotes = language === 'si'
                ? `අපේක්ෂිත අස්වැන්න: ${displayResults.predictedYield}\nදිස්ත්‍රික්කය: ${formData?.district || '-'}\nඉඩමේ ප්‍රමාණය: ${formData?.land_size_value || '-'} අක්කර\n\nඅස්වැන්න නෙලීමේ කාලය:\n• ආරම්භය: ${startDate.toLocaleDateString()}\n• ඉලක්කය: ${targetDate.toLocaleDateString()}\n• අවසානය: ${endDate.toLocaleDateString()}`
                : `Predicted Yield: ${displayResults.predictedYield}\nDistrict: ${formData?.district || '-'}\nLand Size: ${formData?.land_size_value || '-'} Acres\n\nHarvest Window:\n• Start: ${startDate.toLocaleDateString()}\n• Target: ${targetDate.toLocaleDateString()}\n• End: ${endDate.toLocaleDateString()}`;

            // Create calendar event (all-day event spanning the harvest window)
            const eventId = await ExpoCalendar.createEventAsync(defaultCalendar.id, {
                title: eventTitle,
                startDate: startDate,
                endDate: endDate,
                allDay: true,
                notes: eventNotes,
                alarms: [
                    { relativeOffset: -7 * 24 * 60 }, // 7 days before (in minutes)
                    { relativeOffset: -1 * 24 * 60 }, // 1 day before (in minutes)
                ],
            });

            console.log('✅ Calendar event created:', eventId);

            // Enhanced success alert with detailed information
            const successMessage = language === 'si'
                ? `දින දර්ශනයට සාර්ථකව එකතු කරන ලදී!\n\n📅 සිදුවීම: ${eventTitle}\n📆 දිනය: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n🔔 සිහිකැඳවීම්:\n• ${new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} (දින 7කට පෙර)\n• ${new Date(targetDate.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()} (දිනකට පෙර)\n\nඔබේ දින දර්ශනය පරීක්ෂා කරන්න!`
                : `Successfully added to calendar!\n\n📅 Event: ${eventTitle}\n📆 Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n🔔 Reminders set:\n• ${new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} (7 days before)\n• ${new Date(targetDate.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()} (1 day before)\n\nCheck your calendar app!`;

            Alert.alert(
                language === 'si' ? '✅ සාර්ථකයි!' : '✅ Success!',
                successMessage,
                [
                    { 
                        text: language === 'si' ? 'හරි' : 'OK',
                        style: 'default'
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Calendar error:', error);
            Alert.alert(
                language === 'si' ? 'දෝෂයකි' : 'Error',
                t.calendarError,
                [{ text: 'OK' }]
            );
        } finally {
            setIsAddingToCalendar(false);
        }
    };

    const HarvestWindowCard = () => {
        if (!displayResults.harvestWindow) return null;

        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        return (
            <View style={styles.harvestContainer}>
                <View style={styles.harvestHeader}>
                    <Calendar color="#16A34A" size={20} />
                    <Text style={styles.harvestTitle}>{t.harvestWindow}</Text>
                </View>
                <View style={styles.harvestContent}>
                    <View style={styles.harvestDateRow}>
                        <Text style={styles.harvestLabel}>{t.startDate}:</Text>
                        <Text style={styles.harvestDate}>{formatDate(displayResults.harvestWindow.start)}</Text>
                    </View>
                    <View style={styles.harvestDateRow}>
                        <Text style={styles.harvestLabel}>{t.targetDate}:</Text>
                        <Text style={[styles.harvestDate, styles.harvestTarget]}>{formatDate(displayResults.harvestWindow.target)}</Text>
                    </View>
                    <View style={styles.harvestDateRow}>
                        <Text style={styles.harvestLabel}>{t.endDate}:</Text>
                        <Text style={styles.harvestDate}>{formatDate(displayResults.harvestWindow.end)}</Text>
                    </View>
                </View>
                {displayResults.calendarEvent && (
                    <View style={styles.calendarReminder}>
                        <AlertCircle color="#F59E0B" size={16} />
                        <Text style={styles.reminderText}>{displayResults.calendarEvent.title}</Text>
                    </View>
                )}

                {/* Add to Calendar Button */}
                <TouchableOpacity 
                    style={styles.calendarButton}
                    onPress={addHarvestToCalendar}
                    disabled={isAddingToCalendar}
                >
                    <CalendarPlus size={20} color="#FFFFFF" />
                    <Text style={styles.calendarButtonText}>
                        {isAddingToCalendar 
                            ? (language === 'si' ? 'එකතු කරමින්...' : 'Adding...') 
                            : t.addToCalendar}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const FactorRadar = () => {
        return (
            <View style={styles.factorContainer}>
                <View style={styles.factorHeader}>
                    <Activity color="#16A34A" size={20} />
                    <Text style={styles.factorTitle}>{t.impactFactors}</Text>
                </View>
                <View style={styles.factorList}>
                    {displayResults.factors.map((factor, index) => (
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

                    <Text style={styles.title}>{t.title}</Text>
                    <Text style={styles.subtitle}>{t.subtitle}</Text>

                    {/* Main Result Card */}
                    <Card style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <TrendingUp color="#16A34A" size={24} />
                            <Text style={styles.resultTitle}>{t.title}</Text>
                        </View>

                        <View style={styles.yieldDisplay}>
                            <Text style={styles.yieldLabel}>{t.predictedYield}</Text>
                            <Text style={styles.yieldValue}>{displayResults.predictedYield}</Text>
                        </View>

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>{t.confidence}</Text>
                            <View style={styles.confidenceBar}>
                                <View style={[styles.confidenceFill, { width: `${displayResults.confidence}%` }]} />
                                <Text style={styles.confidenceText}>{displayResults.confidence}%</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Data Sections */}
                    <HarvestWindowCard />
                    <FactorRadar />

                    {/* Action Button */}
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('PredictYieldFormWizard' as never)}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonText}
                        icon={() => <TrendingUp color="#FFFFFF" size={20} />}
                    >
                        {t.newPrediction}
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
