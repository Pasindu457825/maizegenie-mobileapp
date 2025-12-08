import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions, Animated } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Leaf, Sprout, Scale, Calendar, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react-native';
import { useError, commonValidationRules, validateForm } from '../../utils/errorHandling';

const { width } = Dimensions.get('window');

interface FormData {
    soilType: string;
    cropStage: string;
    areaAcres: string;
    lastFertilized: string;
    fertilizerType: string;
}

interface FormStep {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    fields: {
        name: keyof FormData;
        label: string;
        placeholder?: string;
        type: 'picker' | 'input';
        options?: { label: string; value: string; description?: string }[];
        keyboardType?: 'numeric' | 'default';
        icon: React.ComponentType<{ size: number; color: string }>;
        helperText?: string;
    }[];
}

const formSteps: FormStep[] = [
    {
        id: 1,
        title: 'Soil Analysis',
        subtitle: 'Tell us about your soil conditions',
        description: 'Different soil types require different fertilizer approaches',
        icon: Sprout,
        fields: [
            {
                name: 'soilType',
                label: 'Soil Type',
                type: 'picker',
                icon: Sprout,
                helperText: 'Select your primary soil type for accurate recommendations',
                options: [
                    { label: 'Select Soil Type', value: '' },
                    { label: 'Clay', value: 'clay', description: 'Heavy soil, retains water well' },
                    { label: 'Sandy', value: 'sandy', description: 'Light soil, drains quickly' },
                    { label: 'Loamy', value: 'loamy', description: 'Balanced soil, ideal for most crops' },
                    { label: 'Silty', value: 'silty', description: 'Smooth texture, fertile' },
                    { label: 'Peaty', value: 'peaty', description: 'High organic matter' },
                    { label: 'Chalky', value: 'chalky', description: 'Alkaline soil, good drainage' }
                ]
            }
        ]
    },
    {
        id: 2,
        title: 'Crop Information',
        subtitle: 'Current growth stage details',
        description: 'Crop stage determines nutrient requirements',
        icon: Leaf,
        fields: [
            {
                name: 'cropStage',
                label: 'Crop Growth Stage',
                type: 'picker',
                icon: Leaf,
                helperText: 'Select the current stage of your maize crop',
                options: [
                    { label: 'Select Growth Stage', value: '' },
                    { label: 'Germination', value: 'germination', description: '0-2 weeks after planting' },
                    { label: 'Vegetative', value: 'vegetative', description: '2-8 weeks, active leaf growth' },
                    { label: 'Reproductive', value: 'reproductive', description: '8-12 weeks, tasseling stage' },
                    { label: 'Maturity', value: 'maturity', description: '12+ weeks, grain filling' }
                ]
            }
        ]
    },
    {
        id: 3,
        title: 'Farm Details',
        subtitle: 'Area and fertilizer history',
        description: 'Help us calculate the right quantities',
        icon: Scale,
        fields: [
            {
                name: 'areaAcres',
                label: 'Farm Area (Acres)',
                placeholder: 'Enter your farm area in acres (0.1 - 1000)',
                type: 'input',
                keyboardType: 'numeric',
                icon: Scale,
                helperText: 'Total area to be fertilized'
            },
            {
                name: 'lastFertilized',
                label: 'Last Fertilization Date',
                placeholder: 'YYYY-MM-DD (optional)',
                type: 'input',
                icon: Calendar,
                helperText: 'When did you last apply fertilizer?'
            },
            {
                name: 'fertilizerType',
                label: 'Previous Fertilizer Type',
                type: 'picker',
                icon: Leaf,
                helperText: 'What fertilizer did you use last time?',
                options: [
                    { label: 'Select Fertilizer Type', value: '' },
                    { label: 'NPK', value: 'npk', description: 'Balanced nitrogen, phosphorus, potassium' },
                    { label: 'Urea', value: 'urea', description: 'High nitrogen content' },
                    { label: 'DAP', value: 'dap', description: 'Diammonium phosphate' },
                    { label: 'MOP', value: 'mop', description: 'Muriate of potash' },
                    { label: 'SSP', value: 'ssp', description: 'Single super phosphate' },
                    { label: 'None/First time', value: 'none', description: 'No previous fertilization' }
                ]
            }
        ]
    }
];

export default function EnhancedFertilizerAdvisorWizard() {
    const navigation = useNavigation();
    const { showError, showSuccess } = useError();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        soilType: '',
        cropStage: '',
        areaAcres: '',
        lastFertilized: '',
        fertilizerType: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateStep = (stepIndex: number): boolean => {
        const step = formSteps[stepIndex];
        const validationRules: any = {};

        step.fields.forEach(field => {
            // Skip validation for optional fields
            if (field.name === 'lastFertilized') {
                if (formData[field.name]) {
                    validationRules[field.name] = commonValidationRules[field.name] || [];
                }
            } else {
                validationRules[field.name] = commonValidationRules[field.name] || [];
            }
        });

        const newErrors = validateForm(formData, validationRules);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showError('Please fill in all required fields correctly');
            return false;
        }

        return true;
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        try {
            if (currentStep < formSteps.length - 1) {
                setCurrentStep(currentStep + 1);
                showSuccess('Step completed successfully');
            } else {
                setIsSubmitting(true);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                navigation.navigate('FertilizerAdvisorResults' as never);
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const renderField = (field: FormStep['fields'][0]) => {
        const hasError = !!errors[field.name];
        const Icon = field.icon;
        const selectedOption = field.options?.find(opt => opt.value === formData[field.name]);

        if (field.type === 'picker') {
            return (
                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Icon color="#16A34A" size={16} />
                        <Text style={styles.inputLabel}>{field.label}</Text>
                        {hasError && <Text style={styles.errorText}>*</Text>}
                    </View>
                    <View style={[styles.pickerContainer, hasError && styles.pickerError]}>
                        <Picker
                            selectedValue={formData[field.name]}
                            onValueChange={(itemValue) => updateFormData(field.name, itemValue)}
                            style={styles.picker}
                        >
                            {field.options?.map((option) => (
                                <Picker.Item key={option.value} label={option.label} value={option.value} />
                            ))}
                        </Picker>
                    </View>
                    {selectedOption?.description && (
                        <View style={styles.optionDescription}>
                            <Info color="#16A34A" size={14} />
                            <Text style={styles.descriptionText}>{selectedOption.description}</Text>
                        </View>
                    )}
                    {field.helperText && !hasError && (
                        <Text style={styles.helperText}>{field.helperText}</Text>
                    )}
                    {hasError && <Text style={styles.errorMessage}>{errors[field.name]}</Text>}
                </View>
            );
        }

        return (
            <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                    <Icon color="#16A34A" size={16} />
                    <Text style={styles.inputLabel}>{field.label}</Text>
                    {hasError && <Text style={styles.errorText}>*</Text>}
                </View>
                <TextInput
                    value={formData[field.name]}
                    onChangeText={(text) => updateFormData(field.name, text)}
                    keyboardType={field.keyboardType || 'default'}
                    style={styles.input}
                    mode="outlined"
                    outlineStyle={[styles.inputOutline, hasError && styles.inputError]}
                    placeholder={field.placeholder}
                    error={hasError}
                />
                {field.helperText && !hasError && (
                    <Text style={styles.helperText}>{field.helperText}</Text>
                )}
                {hasError && <Text style={styles.errorMessage}>{errors[field.name]}</Text>}
            </View>
        );
    };

    const currentStepData = formSteps[currentStep];
    const CurrentIcon = currentStepData.icon;
    const progress = ((currentStep + 1) / formSteps.length) * 100;

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
                    {/* Step Indicator */}
                    <View style={styles.stepIndicator}>
                        <View style={styles.stepProgress}>
                            <View style={[styles.stepProgressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.stepText}>
                            Step {currentStep + 1} of {formSteps.length}
                        </Text>
                    </View>

                    {/* Icon Circle */}
                    <View style={styles.iconCircle}>
                        <View style={styles.iconInner}>
                            <CurrentIcon color="#16A34A" size={40} />
                        </View>
                        <View style={styles.pulseRing} />
                    </View>

                    <Text style={styles.title}>{currentStepData.title}</Text>
                    <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
                    <Text style={styles.description}>{currentStepData.description}</Text>

                    <View style={styles.formCard}>
                        {currentStepData.fields.map((field) => renderField(field))}
                    </View>

                    {/* Tips Section */}
                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
                        <View style={styles.tipItem}>
                            <Info color="#16A34A" size={16} />
                            <Text style={styles.tipText}>
                                {currentStep === 0 && 'Loamy soil is generally ideal for maize cultivation'}
                                {currentStep === 1 && 'Vegetative stage requires more nitrogen for leaf growth'}
                                {currentStep === 2 && 'Accurate area measurement helps calculate precise fertilizer amounts'}
                            </Text>
                        </View>
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.navigationContainer}>
                        {currentStep > 0 && (
                            <Button
                                mode="outlined"
                                onPress={handlePrevious}
                                style={[styles.previousButton, { flex: currentStep > 0 ? 1 : 0 }]}
                                labelStyle={styles.previousButtonText}
                                disabled={isSubmitting}
                                icon={() => <ChevronLeft color="#16A34A" size={20} />}
                            >
                                Previous
                            </Button>
                        )}
                        
                        <Button
                            mode="contained"
                            onPress={handleNext}
                            style={styles.nextButton}
                            labelStyle={styles.nextButtonText}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            icon={() => currentStep < formSteps.length - 1 ? 
                                <ChevronRight color="#FFFFFF" size={20} /> : 
                                <Check color="#FFFFFF" size={20} />
                            }
                        >
                            {currentStep < formSteps.length - 1 ? 'Next' : 'Get Recommendation'}
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
    stepIndicator: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepProgress: {
        width: '80%',
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    stepProgressFill: {
        height: '100%',
        backgroundColor: '#16A34A',
        borderRadius: 3,
    },
    stepText: {
        fontSize: 14,
        color: '#16A34A',
        fontWeight: '600',
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
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
        flex: 1,
    },
    errorText: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
    pickerContainer: {
        borderWidth: 2,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F0FDF4',
    },
    pickerError: {
        borderColor: '#EF4444',
    },
    picker: {
        height: 50,
    },
    input: {
        backgroundColor: '#F0FDF4',
    },
    inputOutline: {
        borderRadius: 12,
        borderColor: '#BBF7D0',
        borderWidth: 2,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    helperText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
        fontStyle: 'italic',
    },
    errorMessage: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    optionDescription: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 8,
        padding: 12,
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    descriptionText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 18,
    },
    tipsCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 12,
        textAlign: 'center',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 18,
    },
    navigationContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    previousButton: {
        backgroundColor: 'transparent',
        borderColor: '#16A34A',
        borderWidth: 2,
        borderRadius: 50,
    },
    previousButtonText: {
        color: '#16A34A',
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#16A34A',
        borderRadius: 50,
        flex: 2,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
