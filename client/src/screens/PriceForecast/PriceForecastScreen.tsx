import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { TrendingUp, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PriceForecastScreen() {
    const navigation = useNavigation();
    
    // Mock data for price forecast
    const mockResults = {
        currentPrice: 'Rs. 85.50/kg',
        predictedPrice: 'Rs. 92.25/kg',
        change: '+7.9%',
        confidence: 85,
        timeframe: 'Next 30 days',
        recommendations: [
            'Good time to sell if you have stock',
            'Consider forward contracting',
            'Monitor weather patterns'
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
                            <TrendingUp color="#3b82f6" size={40} />
                        </View>
                        <View style={styles.pulseRing} />
                    </View>

                    <Text style={styles.title}>Price Forecast</Text>
                    <Text style={styles.subtitle}>Market Analysis</Text>

                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <TrendingUp color="#3b82f6" size={24} />
                            <Text style={styles.resultTitle}>Forecast Results</Text>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPriceLabel}>Current Price</Text>
                            <Text style={styles.currentPrice}>{mockResults.currentPrice}</Text>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.predictedPriceLabel}>Predicted Price</Text>
                            <Text style={styles.predictedPrice}>{mockResults.predictedPrice}</Text>
                        </View>

                        <View style={styles.changeContainer}>
                            <Text style={styles.changeLabel}>Expected Change</Text>
                            <Text style={styles.changeValue}>{mockResults.change}</Text>
                        </View>

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>Confidence Level</Text>
                            <View style={styles.confidenceBarContainer}>
                                <View style={[styles.confidenceBar, { width: `${mockResults.confidence}%` }]} />
                                <Text style={styles.confidenceText}>{mockResults.confidence}%</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recommendations</Text>
                            {mockResults.recommendations.map((rec, index) => (
                                <View key={index} style={styles.recommendationItem}>
                                    <CheckCircle color="#3b82f6" size={16} />
                                    <Text style={styles.recommendationText}>{rec}</Text>
                                </View>
                            ))}
                        </View>

                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('PriceForecastForm' as never)}
                            style={styles.button}
                            labelStyle={styles.buttonText}
                        >
                            New Forecast
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
        backgroundColor: '#EFF6FF',
        position: 'relative',
    },
    headerDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: '#3b82f6',
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
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#3b82f6',
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
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#3b82f6',
        opacity: 0.3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#3b82f6',
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
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#BFDBFE',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BFDBFE',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e40af',
    },
    priceContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    currentPriceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    currentPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    predictedPriceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    predictedPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10B981',
    },
    changeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#ECFDF5',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    changeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    changeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
    },
    confidenceContainer: {
        marginBottom: 20,
    },
    confidenceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    confidenceBarContainer: {
        height: 24,
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    confidenceBar: {
        height: '100%',
        backgroundColor: '#3b82f6',
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
    section: {
        marginTop: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    recommendationText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#3b82f6',
        borderRadius: 50,
        paddingVertical: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});