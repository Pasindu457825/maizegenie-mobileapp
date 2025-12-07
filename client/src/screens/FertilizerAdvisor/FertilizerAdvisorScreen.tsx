/**
 * Fertilizer Advisor Screen - Temporary Placeholder
 * TODO: Implement full fertilizer advisor flow similar to Yield Prediction
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Leaf, ArrowRight } from 'lucide-react-native';

export default function FertilizerAdvisorScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Leaf size={32} color="#16A34A" />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Fertilizer Advisor</Text>
                    <Text style={styles.headerSubtitle}>Coming Soon</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>🚧 Under Development</Text>
                    <Text style={styles.description}>
                        The Fertilizer Advisor feature is currently being developed.
                        It will provide personalized fertilizer recommendations based on:
                    </Text>

                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureBullet}>✓</Text>
                            <Text style={styles.featureText}>Soil type and condition</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureBullet}>✓</Text>
                            <Text style={styles.featureText}>Crop growth stage</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureBullet}>✓</Text>
                            <Text style={styles.featureText}>Field size and location</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureBullet}>✓</Text>
                            <Text style={styles.featureText}>Previous fertilizer application</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureBullet}>✓</Text>
                            <Text style={styles.featureText}>Weather conditions</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            💡 In the meantime, try the <Text style={styles.bold}>Yield Prediction</Text> feature
                            to estimate your maize harvest!
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Info */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Check back soon for updates</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 12,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#F59E0B',
        marginTop: 4,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
        marginBottom: 20,
    },
    featureList: {
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    featureBullet: {
        fontSize: 18,
        color: '#16A34A',
        fontWeight: '700',
    },
    featureText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    infoBox: {
        backgroundColor: '#FEF3C7',
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        borderRadius: 8,
        padding: 16,
    },
    infoText: {
        fontSize: 15,
        color: '#92400E',
        lineHeight: 22,
    },
    bold: {
        fontWeight: '700',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});
