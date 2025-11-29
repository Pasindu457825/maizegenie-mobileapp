import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, ToastAndroid, Platform, View, Text } from 'react-native';

interface ErrorContextType {
    showError: (message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
    clearErrors: () => void;
    errors: string[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
    children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
    const [errors, setErrors] = useState<string[]>([]);

    const showError = (message: string, title = 'Error') => {
        setErrors(prev => [...prev, message]);
        
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
        }
    };

    const showSuccess = (message: string, title = 'Success') => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
        }
    };

    const showWarning = (message: string, title = 'Warning') => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
        }
    };

    const showInfo = (message: string, title = 'Information') => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
        }
    };

    const clearErrors = () => {
        setErrors([]);
    };

    const value: ErrorContextType = {
        showError,
        showSuccess,
        showWarning,
        showInfo,
        clearErrors,
        errors,
    };

    return (
        <ErrorContext.Provider value={value}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}

// Validation utilities
export const validators = {
    required: (value: string, fieldName: string) => {
        if (!value || value.trim() === '') {
            return `${fieldName} is required`;
        }
        return null;
    },

    numeric: (value: string, fieldName: string) => {
        if (value && isNaN(Number(value))) {
            return `${fieldName} must be a valid number`;
        }
        return null;
    },

    positiveNumber: (value: string, fieldName: string) => {
        const num = Number(value);
        if (value && (isNaN(num) || num <= 0)) {
            return `${fieldName} must be a positive number`;
        }
        return null;
    },

    email: (value: string, fieldName: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return `${fieldName} must be a valid email address`;
        }
        return null;
    },

    phone: (value: string, fieldName: string) => {
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
            return `${fieldName} must be a valid phone number`;
        }
        return null;
    },

    minLength: (value: string, fieldName: string, minLength: number) => {
        if (value && value.length < minLength) {
            return `${fieldName} must be at least ${minLength} characters long`;
        }
        return null;
    },

    maxLength: (value: string, fieldName: string, maxLength: number) => {
        if (value && value.length > maxLength) {
            return `${fieldName} must not exceed ${maxLength} characters`;
        }
        return null;
    },

    range: (value: string, fieldName: string, min: number, max: number) => {
        const num = Number(value);
        if (value && (isNaN(num) || num < min || num > max)) {
            return `${fieldName} must be between ${min} and ${max}`;
        }
        return null;
    },

    date: (value: string, fieldName: string) => {
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return `${fieldName} must be in YYYY-MM-DD format`;
        }
        return null;
    },

    futureDate: (value: string, fieldName: string) => {
        if (value) {
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (inputDate < today) {
                return `${fieldName} must be today or a future date`;
            }
        }
        return null;
    },

    pastDate: (value: string, fieldName: string) => {
        if (value) {
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            
            if (inputDate > today) {
                return `${fieldName} must be today or a past date`;
            }
        }
        return null;
    },
};

// Form validation helper
export interface ValidationRule {
    validator: (value: string, fieldName: string) => string | null;
    fieldName: string;
}

export interface FormValidationRules {
    [key: string]: ValidationRule[];
}

export function validateForm(
    data: Record<string, string>,
    rules: FormValidationRules
): Record<string, string> {
    const errors: Record<string, string> = {};

    Object.keys(rules).forEach(field => {
        const fieldRules = rules[field];
        const value = data[field];

        for (const rule of fieldRules) {
            const error = rule.validator(value || '', rule.fieldName);
            if (error) {
                errors[field] = error;
                break; // Stop at first error for this field
            }
        }
    });

    return errors;
}

// Common validation rule sets
export const commonValidationRules = {
    district: [
        { validator: validators.required, fieldName: 'District' },
    ],
    season: [
        { validator: validators.required, fieldName: 'Season' },
    ],
    variety: [
        { validator: validators.required, fieldName: 'Variety' },
    ],
    areaAcres: [
        { validator: validators.required, fieldName: 'Area' },
        { validator: validators.numeric, fieldName: 'Area' },
        { validator: validators.positiveNumber, fieldName: 'Area' },
        { validator: (value: string) => validators.range(value, 'Area', 0.1, 1000), fieldName: 'Area' },
    ],
    plantDate: [
        { validator: validators.required, fieldName: 'Plant Date' },
        { validator: validators.date, fieldName: 'Plant Date' },
        { validator: validators.pastDate, fieldName: 'Plant Date' },
    ],
    irrigation: [
        { validator: validators.required, fieldName: 'Irrigation Method' },
    ],
    soilType: [
        { validator: validators.required, fieldName: 'Soil Type' },
    ],
    cropStage: [
        { validator: validators.required, fieldName: 'Crop Stage' },
    ],
    lastFertilized: [
        { validator: validators.date, fieldName: 'Last Fertilized Date' },
        { validator: validators.pastDate, fieldName: 'Last Fertilized Date' },
    ],
    fertilizerType: [
        { validator: validators.required, fieldName: 'Fertilizer Type' },
    ],
};

// Error boundary component
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<
    { children: ReactNode; fallback?: ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: '#F0FDF4',
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#EF4444',
                        marginBottom: 8,
                        textAlign: 'center',
                    }}>
                        Something went wrong
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: '#64748B',
                        textAlign: 'center',
                    }}>
                        Please try again or restart the app if the problem persists.
                    </Text>
                </View>
            );
        }

        return this.props.children;
    }
}
