import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Leaf, CheckCircle, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FertilizerAdvisorResultsScreen() {
    const navigation = useNavigation();

    const mockResults = {
        recommendation: 'Apply 200kg of NPK fertilizer per acre',
        nutrients: [
            { name: 'Nitrogen', amount: '100kg', purpose: 'Promotes leaf growth' },
            { name: 'Phosphorus', amount: '50kg', purpose: 'Supports root development' },
            { name: 'Potassium', amount: '50kg', purpose: 'Enhances disease resistance' }
        ],
        timing: 'Apply 2 weeks after planting and again at flowering stage',
        warnings: [
            'Avoid application during heavy rain',
            'Wear protective equipment when handling'
        ]
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
                    <Text style={styles.subtitle}>Smart Farming</Text>

                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <CheckCircle color="#16A34A" size={24} />
                            <Text style={styles.resultTitle}>Your Recommendation</Text>
                        </View>

                        <View style={styles.recommendationContainer}>
                            <Text style={styles.recommendationText}>{mockResults.recommendation}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Nutrient Breakdown</Text>
                            {mockResults.nutrients.map((nutrient, index) => (
                                <View key={index} style={styles.nutrientItem}>
                                    <Text style={styles.nutrientName}>{nutrient.name}</Text>
                                    <Text style={styles.nutrientAmount}>{nutrient.amount}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Application Timing</Text>
                            <Text style={styles.timingText}>{mockResults.timing}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Important Warnings</Text>
                            {mockResults.warnings.map((warning, index) => (
                                <View key={index} style={styles.warningItem}>
                                    <AlertCircle color="#F59E0B" size={16} />
                                    <Text style={styles.warningText}>{warning}</Text>
                                </View>
                            ))}
                        </View>

                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('FertilizerAdvisor' as never)}
                            style={styles.button}
                            labelStyle={styles.buttonText}
                        >
                            New Recommendation
                        </Button>
                    </View>
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
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultCard: {
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
    section: {
        marginTop: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 12,
    },
    nutrientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    nutrientName: {
        fontSize: 16,
        color: '#334155',
    },
    nutrientAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    timingText: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
        backgroundColor: '#F0FDF4',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    warningItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#16A34A',
        borderRadius: 50,
        paddingVertical: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});