import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

interface FormData {
    district: string;
    season: string;
    variety: string;
    areaAcres: string;
    plantDate: string;
    irrigation: string;
}

export default function PredictYieldFormScreen() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState<FormData>({
        district: '',
        season: '',
        variety: '',
        areaAcres: '',
        plantDate: '',
        irrigation: ''
    });

    const handleSubmit = () => {
        if (!formData.district || !formData.season || !formData.variety) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        navigation.navigate('PredictYieldLoading' as never);
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Predict Yield</Title>
                    <Paragraph>Enter your farm details to predict crop yield</Paragraph>

                    <View style={styles.inputGroup}>
                        <Text>District</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.district}
                                onValueChange={(itemValue) => setFormData({ ...formData, district: itemValue })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select District" value="" />
                                <Picker.Item label="Ampara" value="Ampara" />
                                <Picker.Item label="Anuradhapura" value="Anuradhapura" />
                                <Picker.Item label="Badulla" value="Badulla" />
                                <Picker.Item label="Batticaloa" value="Batticaloa" />
                                <Picker.Item label="Colombo" value="Colombo" />
                                <Picker.Item label="Galle" value="Galle" />
                                <Picker.Item label="Gampaha" value="Gampaha" />
                                <Picker.Item label="Hambantota" value="Hambantota" />
                                <Picker.Item label="Jaffna" value="Jaffna" />
                                <Picker.Item label="Kalutara" value="Kalutara" />
                                <Picker.Item label="Kandy" value="Kandy" />
                                <Picker.Item label="Kegalle" value="Kegalle" />
                                <Picker.Item label="Kilinochchi" value="Kilinochchi" />
                                <Picker.Item label="Kurunegala" value="Kurunegala" />
                                <Picker.Item label="Mannar" value="Mannar" />
                                <Picker.Item label="Matale" value="Matale" />
                                <Picker.Item label="Matara" value="Matara" />
                                <Picker.Item label="Monaragala" value="Monaragala" />
                                <Picker.Item label="Mullaitivu" value="Mullaitivu" />
                                <Picker.Item label="Nuwara Eliya" value="Nuwara Eliya" />
                                <Picker.Item label="Polonnaruwa" value="Polonnaruwa" />
                                <Picker.Item label="Puttalam" value="Puttalam" />
                                <Picker.Item label="Ratnapura" value="Ratnapura" />
                                <Picker.Item label="Trincomalee" value="Trincomalee" />
                                <Picker.Item label="Vavuniya" value="Vavuniya" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text>Season</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.season}
                                onValueChange={(itemValue) => setFormData({ ...formData, season: itemValue })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Season" value="" />
                                <Picker.Item label="Yala" value="Yala" />
                                <Picker.Item label="Maha" value="Maha" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text>Variety</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.variety}
                                onValueChange={(itemValue) => setFormData({ ...formData, variety: itemValue })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Variety" value="" />
                                <Picker.Item label="Assupini" value="Assupini" />
                                <Picker.Item label="SC 627" value="SC 627" />
                                <Picker.Item label="Pacific 999" value="Pacific 999" />
                                <Picker.Item label="Hybrid" value="Hybrid" />
                            </Picker>
                        </View>
                    </View>

                    <TextInput
                        label="Area (Acres)"
                        value={formData.areaAcres}
                        onChangeText={(text) => setFormData({ ...formData, areaAcres: text })}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <TextInput
                        label="Plant Date"
                        value={formData.plantDate}
                        onChangeText={(text) => setFormData({ ...formData, plantDate: text })}
                        style={styles.input}
                    />

                    <View style={styles.inputGroup}>
                        <Text>Irrigation Method</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.irrigation}
                                onValueChange={(itemValue) => setFormData({ ...formData, irrigation: itemValue })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Irrigation" value="" />
                                <Picker.Item label="Rainfed" value="Rainfed" />
                                <Picker.Item label="Irrigated" value="Irrigated" />
                                <Picker.Item label="Mixed" value="Mixed" />
                            </Picker>
                        </View>
                    </View>

                    <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                        Predict Yield
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
    inputGroup: {
        marginBottom: 16
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginTop: 8
    },
    picker: {
        height: 50
    },
    input: {
        marginBottom: 16
    },
    button: {
        marginTop: 16
    }
});
