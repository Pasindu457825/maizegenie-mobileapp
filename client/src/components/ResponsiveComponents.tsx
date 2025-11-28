import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResponsiveCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    padding?: number;
    margin?: number;
    shadow?: boolean;
    bordered?: boolean;
    style?: any;
}

const { width, height } = Dimensions.get('window');

export default function ResponsiveCard({
    children,
    title,
    subtitle,
    padding = 20,
    margin = 0,
    shadow = true,
    bordered = true,
    style,
}: ResponsiveCardProps) {
    const insets = useSafeAreaInsets();

    const getCardStyles = () => {
        const baseStyle = {
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding,
            margin,
        };

        if (shadow) {
            baseStyle.shadowColor = '#16A34A';
            baseStyle.shadowOffset = { width: 0, height: 4 };
            baseStyle.shadowOpacity = 0.2;
            baseStyle.shadowRadius = 8;
            baseStyle.elevation = 6;
        }

        if (bordered) {
            baseStyle.borderWidth = 2;
            baseStyle.borderColor = '#BBF7D0';
        }

        return baseStyle;
    };

    return (
        <View style={[styles.card, getCardStyles(), style]}>
            {(title || subtitle) && (
                <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

interface ResponsiveContainerProps {
    children: React.ReactNode;
    padding?: number;
    scrollable?: boolean;
    style?: any;
}

export function ResponsiveContainer({
    children,
    padding = 20,
    scrollable = false,
    style,
}: ResponsiveContainerProps) {
    const insets = useSafeAreaInsets();

    const containerStyle = {
        flex: 1,
        backgroundColor: '#F0FDF4',
        paddingTop: insets.top + padding,
        paddingBottom: insets.bottom + padding,
        paddingHorizontal: padding,
    };

    if (scrollable) {
        return (
            <ScrollView 
                style={containerStyle}
                contentContainerStyle={style}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        );
    }

    return <View style={[containerStyle, style]}>{children}</View>;
}

interface ResponsiveGridProps {
    children: React.ReactNode;
    columns?: number;
    gap?: number;
    style?: any;
}

export function ResponsiveGrid({
    children,
    columns = 2,
    gap = 16,
    style,
}: ResponsiveGridProps) {
    const gridStyle = {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'space-between',
        gap,
        ...style,
    };

    const childStyle = {
        width: `${(100 - (gap * (columns - 1))) / columns}%`,
        marginBottom: gap,
    };

    return (
        <View style={gridStyle}>
            {React.Children.map(children, (child, index) => (
                <View key={index} style={childStyle}>
                    {child}
                </View>
            ))}
        </View>
    );
}

interface ResponsiveInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    error?: string;
    helperText?: string;
    required?: boolean;
    style?: any;
}

export function ResponsiveInput({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    error,
    helperText,
    required = false,
    style,
}: ResponsiveInputProps) {
    return (
        <View style={[styles.inputContainer, style]}>
            <Text style={styles.inputLabel}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[
                styles.inputWrapper,
                error && styles.inputError
            ]}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline
                    ]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    multiline={multiline}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
    },
    header: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#BBF7D0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    content: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        borderWidth: 2,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEE2E2',
    },
    input: {
        fontSize: 16,
        color: '#334155',
        textAlignVertical: 'top',
    },
    inputMultiline: {
        minHeight: 100,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    helperText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
        fontStyle: 'italic',
    },
});
