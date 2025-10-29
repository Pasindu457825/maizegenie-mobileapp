import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PredictYieldLoadingScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        // Simulate API call delay
        const timer = setTimeout(() => {
            navigation.navigate('PredictYieldScreen' as never);
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* Header decoration */}
            <View style={styles.headerDecoration} />
            
            <View style={styles.content}>
                {/* Animated Icon */}
                <View style={styles.iconCircle}>
                    <View style={styles.iconInner}>
                        <Leaf color="#16A34A" size={40} />
                    </View>
                    <View style={styles.pulseRing} />
                </View>

                <Text style={styles.title}>Predicting Yield</Text>
                <Text style={styles.subtitle}>Smart Farming</Text>
                
                <View style={styles.loadingContainer}>
                    <View style={styles.spinner} />
                    <Text style={styles.loadingText}>Analyzing your data...</Text>
                    <Text style={styles.loadingSubtext}>This may take a few moments</Text>
                </View>
            </View>
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
    content: {
        flex: 1,
        justifyContent: 'center',
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
        marginBottom: 30,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        gap: 20,
        width: '100%',
    },
    spinner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#BBF7D0',
        borderTopColor: '#16A34A',
    },
    loadingText: {
        fontSize: 18,
        color: '#166534',
        fontWeight: '600',
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#334155',
        textAlign: 'center',
    },
});