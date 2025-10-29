import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Leaf, Sprout, Scale, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FormData {
    soilType: string;
    cropStage: string;
    areaAcres: string;
    lastFertilized: string;
    fertilizerType: string;
}

export default function FertilizerAdvisorScreen() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState<FormData>({
        soilType: '',
        cropStage: '',
        areaAcres: '',
        lastFertilized: '',
        fertilizerType: ''
    });

    const handleSubmit = () => {
        if (!formData.soilType || !formData.cropStage || !formData.areaAcres) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        // In a real app, this would navigate to a results screen
        navigation.navigate('FertilizerAdvisorResults' as never);
    };

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
                    {/* Icon Circle */}
                    <View style={styles.iconCircle}>
                        <View style={styles.iconInner}>
                            <Leaf color="#16A34A" size={40} />
                        </View>
                        <View style={styles.pulseRing} />
                    </View>

                    <Text style={styles.title}>Fertilizer Advisor</Text>
                    <Text style={styles.subtitle}>Smart Farming</Text>

                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Sprout color="#16A34A" size={16} />
                                <Text style={styles.inputLabel}>Soil Type</Text>
                            </View>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.soilType}
                                    onValueChange={(itemValue) => setFormData({ ...formData, soilType: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Soil Type" value="" />
                                    <Picker.Item label="Clay" value="clay" />
                                    <Picker.Item label="Sandy" value="sandy" />
                                    <Picker.Item label="Loamy" value="loamy" />
                                    <Picker.Item label="Silty" value="silty" />
                                    <Picker.Item label="Peaty" value="peaty" />
                                    <Picker.Item label="Chalky" value="chalky" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Leaf color="#16A34A" size={16} />
                                <Text style={styles.inputLabel}>Crop Growth Stage</Text>
                            </View>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.cropStage}
                                    onValueChange={(itemValue) => setFormData({ ...formData, cropStage: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Growth Stage" value="" />
                                    <Picker.Item label="Germination" value="germination" />
                                    <Picker.Item label="Vegetative" value="vegetative" />
                                    <Picker.Item label="Reproductive" value="reproductive" />
                                    <Picker.Item label="Maturity" value="maturity" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Scale color="#16A34A" size={16} />
                                <Text style={styles.inputLabel}>Area (Acres)</Text>
                            </View>
                            <TextInput
                                value={formData.areaAcres}
                                onChangeText={(text) => setFormData({ ...formData, areaAcres: text })}
                                keyboardType="numeric"
                                style={styles.input}
                                mode="outlined"
                                outlineStyle={styles.inputOutline}
                                placeholder="Enter area in acres"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Calendar color="#16A34A" size={16} />
                                <Text style={styles.inputLabel}>Last Fertilized</Text>
                            </View>
                            <TextInput
                                value={formData.lastFertilized}
                                onChangeText={(text) => setFormData({ ...formData, lastFertilized: text })}
                                style={styles.input}
                                mode="outlined"
                                outlineStyle={styles.inputOutline}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Leaf color="#16A34A" size={16} />
                                <Text style={styles.inputLabel}>Current Fertilizer Type</Text>
                            </View>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.fertilizerType}
                                    onValueChange={(itemValue) => setFormData({ ...formData, fertilizerType: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Fertilizer Type" value="" />
                                    <Picker.Item label="NPK" value="npk" />
                                    <Picker.Item label="Urea" value="urea" />
                                    <Picker.Item label="DAP" value="dap" />
                                    <Picker.Item label="MOP" value="mop" />
                                    <Picker.Item label="SSP" value="ssp" />
                                </Picker>
                            </View>
                        </View>

                        <Button 
                            mode="contained" 
                            onPress={handleSubmit} 
                            style={styles.button}
                            labelStyle={styles.buttonText}
                        >
                            Get Recommendation
                        </Button>
                    </View>

                    {/* Recommendations Section */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>Fertilizer Tips</Text>
                        <View style={styles.tipItem}>
                            <Leaf color="#16A34A" size={16} />
                            <Text style={styles.tipText}>Apply nitrogen fertilizers during vegetative growth stage</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Leaf color="#16A34A" size={16} />
                            <Text style={styles.tipText}>Phosphorus is crucial during reproductive stage</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Leaf color="#16A34A" size={16} />
                            <Text style={styles.tipText}>Potassium helps in disease resistance and grain filling</Text>
                        </View>
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
        marginBottom: 24,
        textTransform: 'uppercase',
        letterSpacing: 1,
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
    },
    pickerContainer: {
        borderWidth: 2,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F0FDF4',
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
    button: {
        marginTop: 10,
        backgroundColor: '#16A34A',
        borderRadius: 50,
        paddingVertical: 8,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoCard: {
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
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 16,
        textAlign: 'center',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
});