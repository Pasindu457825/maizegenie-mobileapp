import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorProvider } from '../utils/errorHandling';

interface TestWrapperProps {
    children: React.ReactNode;
}

export default function TestWrapper({ children }: TestWrapperProps) {
    return (
        <ErrorProvider>
            <View style={styles.container}>
                <Text style={styles.title}>Test Wrapper</Text>
                {children}
            </View>
        </ErrorProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F0FDF4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#16A34A',
        marginBottom: 20,
        textAlign: 'center',
    },
});
