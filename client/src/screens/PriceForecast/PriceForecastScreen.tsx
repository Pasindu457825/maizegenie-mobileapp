import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PriceForecastScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Price Forecast Results</Text>
            <Text style={styles.subtitle}>This screen will show predicted prices and recommendations.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#065F46',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
    },
});

export default PriceForecastScreen;

