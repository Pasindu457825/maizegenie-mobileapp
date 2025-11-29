import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResponsiveButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export default function ResponsiveButton({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
}: ResponsiveButtonProps) {
    const insets = useSafeAreaInsets();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!disabled && !loading) {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (!disabled && !loading) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    };

    const handlePress = () => {
        if (!disabled && !loading) {
            onPress();
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: '#F0FDF4',
                    borderColor: '#16A34A',
                    borderWidth: 2,
                };
            case 'danger':
                return {
                    backgroundColor: '#EF4444',
                    borderColor: '#EF4444',
                    borderWidth: 0,
                };
            default:
                return {
                    backgroundColor: '#16A34A',
                    borderColor: '#16A34A',
                    borderWidth: 0,
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    minHeight: 36,
                };
            case 'large':
                return {
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 50,
                    minHeight: 56,
                };
            default:
                return {
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    minHeight: 48,
                };
        }
    };

    const getTextStyles = () => {
        let baseStyle = {
            fontWeight: 'bold' as const,
        };

        switch (size) {
            case 'small':
                return {
                    ...baseStyle,
                    fontSize: 14,
                };
            case 'large':
                return {
                    ...baseStyle,
                    fontSize: 18,
                };
            default:
                return {
                    ...baseStyle,
                    fontSize: 16,
                };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'secondary':
                return '#16A34A';
            default:
                return '#FFFFFF';
        }
    };

    return (
        <Animated.View style={[
            { transform: [{ scale: scaleAnim }] },
            fullWidth && { width: '100%' }
        ]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    getVariantStyles(),
                    getSizeStyles(),
                    disabled && styles.disabled,
                    fullWidth && { width: '100%' }
                ]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
            >
                <View style={styles.buttonContent}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[
                        styles.buttonText,
                        getTextStyles(),
                        { color: getTextColor() },
                        disabled && styles.disabledText
                    ]}>
                        {loading ? 'Loading...' : title}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        textAlign: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#E2E8F0',
        borderColor: '#E2E8F0',
    },
    disabledText: {
        color: '#64748B',
    },
});
