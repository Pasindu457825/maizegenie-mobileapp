import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PredictYieldScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // In a real app, you'd get prediction results from route params or API

    const mockResults = {
        predictedYield: '2,450 kg',
        confidence: '85%',
        factors: ['Weather conditions', 'Soil quality', 'Irrigation'],
        recommendations: [
            'Monitor soil moisture regularly',
            'Apply fertilizer at recommended intervals',
            'Consider pest control measures'
        ]
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Yield Prediction Results</Title>

                    <View style={styles.resultContainer}>
                        <Text style={styles.label}>Predicted Yield:</Text>
                        <Text style={styles.value}>{mockResults.predictedYield}</Text>
                    </View>

                    <View style={styles.resultContainer}>
                        <Text style={styles.label}>Confidence Level:</Text>
                        <Text style={styles.value}>{mockResults.confidence}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Factors:</Text>
                        <View style={styles.chipContainer}>
                            {mockResults.factors.map((factor, index) => (
                                <Chip key={index} style={styles.chip}>{factor}</Chip>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recommendations:</Text>
                        {mockResults.recommendations.map((rec, index) => (
                            <Paragraph key={index} style={styles.recommendation}>• {rec}</Paragraph>
                        ))}
                    </View>

                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('PredictYieldFormScreen' as never)}
                        style={styles.button}
                    >
                        New Prediction
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    card: {
        marginBottom: 16
    },
    resultContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    value: {
        fontSize: 18,
        color: '#6200ee'
    },
    section: {
        marginTop: 16
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    chip: {
        margin: 4
    },
    recommendation: {
        marginVertical: 4
    },
    button: {
        marginTop: 24
    }
});
