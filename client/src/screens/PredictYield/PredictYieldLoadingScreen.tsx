import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Card, Title } from 'react-native-paper';

export default function PredictYieldLoadingScreen() {
    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.content}>
                    <ActivityIndicator animating={true} size="large" color="#6200ee" />
                    <Title style={styles.title}>Predicting Yield...</Title>
                    <Text style={styles.subtitle}>Please wait while we process your data</Text>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    card: {
        width: '100%',
        maxWidth: 400
    },
    content: {
        alignItems: 'center',
        padding: 32
    },
    title: {
        marginTop: 16,
        textAlign: 'center'
    },
    subtitle: {
        marginTop: 8,
        textAlign: 'center',
        color: '#666'
    }
});
