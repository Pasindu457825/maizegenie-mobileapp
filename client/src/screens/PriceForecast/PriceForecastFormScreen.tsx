import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { Leaf, Calendar } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

type Language = 'si' | 'en';

const PriceForcastFormScreen = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState<Language>('si');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    district: 'අඹන්ගොඩ',
    season: 'යල',
    variety: 'අස්සුපිණ',
    plantDate: new Date(2025, 9, 1), // October 2025
    areaAcres: '3.0',
    costAcre: '45,000',
    storage: true,
    mode: 'බසා',
  });

  const content = {
    si: {
      title: 'ගොවිපල විස්තර ඇතුළත් කරන්න',
      subtitle: 'මිල හා වගා උපදේශකය',
      district: 'දිස්ත්‍රික්කය',
      selectDistrict: 'දිස්ත්‍රික්කය තෝරන්න',
      season: 'වාරය',
      plantDate: 'වගා දිනය',
      selectDate: 'දිනය තෝරන්න',
      variety: 'ප්‍රභේදය',
      areaAcres: 'ප්‍රමාණය (අක්කර)',
      costAcre: 'අක්කරයකට වියදම',
      storage: 'ගබඩාව',
      mode: 'ප්‍රවේශය',
      predictPrice: 'මිල පුරෝකථනය',
      districts: [
        'අඹන්ගොඩ', 'අනුරාධපුර', 'බදුල්ල', 'බත්තිකලෝ', 'කොළඹ', 
        'ගාල්ල', 'ගම්පහ', 'හම්බන්තොට', 'යාපනය', 'කළුතර', 
        'කැන්ඩි', 'කෑගල්ල', 'කිලිනොච්චි', 'කුරුණෑගල', 'මන්නාරම',
        'මාතලේ', 'මාතර', 'මොණරාගල', 'මුලතිව්', 'නුවරඑළිය',
        'පොලොන්නරුව', 'පුත්තලම', 'රත්නපුර', 'ත්‍රිකුණාමලය', 'වවුනියාව'
      ],
      seasons: ['යල', 'මහ'],
      varieties: ['අස්සුපිණ', 'SC 627', 'පැසිෆික් 999', 'හයිබ්‍රිඩ්'],
      modes: ['බසා', 'ජලාශ්‍රිත', 'මිශ්‍ර']
    },
    en: {
      title: 'Enter Farm Details',
      subtitle: 'Price & Cultivation Advisor',
      district: 'District',
      selectDistrict: 'Select District',
      season: 'Season',
      plantDate: 'Plant Date',
      selectDate: 'Select Date',
      variety: 'Variety',
      areaAcres: 'Area (Acres)',
      costAcre: 'Cost/Acre',
      storage: 'Storage',
      mode: 'Mode',
      predictPrice: 'Predict Price',
      districts: [
        'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
        'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
        'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
        'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'NuwaraEliya',
        'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
      ],
      seasons: ['Yala', 'Maha'],
      varieties: ['Asuupina', 'SC 627', 'Pacific 999', 'Hybrid'],
      modes: ['Rainfed', 'Irrigated', 'Mixed']
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('plantDate', selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleSubmit = () => {
    const payload = {
      fullName: "A. Perera",
      phone: "0712345678",
      language: language,
      district: formData.district,
      dsDivision: "Bibile",
      village: "Pelwatta",
      farmSizeAcre: parseFloat(formData.areaAcres),
      irrigation: formData.mode,
      variety: formData.variety,
      plantingMonth: formData.plantDate.toISOString().slice(0, 7),
      cropDurationDays: 105,
      costSeed: 6000,
      costFertilizer: 18000,
      costLabour: 22000,
      costTransport: 5000,
      costOther: 3000,
      expectedYieldKg: 1800,
      nearestMarket: "Monaragala",
      buyerType: "Collector",
      hasStorage: formData.storage,
      storageCapacityKg: 1500,
      storageMaxDays: 30,
      notify: "Push",
      consent: true
    };
    
    console.log('Form submitted:', payload);
    // Navigate to results or next screen
    // navigation.navigate('PriceForecastResults', { data: payload });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Leaf color="#FFFFFF" size={20} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{content[language].subtitle}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguage(prev => (prev === 'si' ? 'en' : 'si'))}
        >
          <Text style={styles.languageButtonText}>
            {language === 'si' ? 'EN' : 'සිං'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{content[language].title}</Text>

          {/* District and Season Row */}
          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].district}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.district}
                  onValueChange={(value) => updateField('district', value)}
                  style={styles.picker}
                >
                  {content[language].districts.map((dist, idx) => (
                    <Picker.Item key={idx} label={dist} value={dist} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].season}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.season}
                  onValueChange={(value) => updateField('season', value)}
                  style={styles.picker}
                >
                  {content[language].seasons.map((season, idx) => (
                    <Picker.Item key={idx} label={season} value={season} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Variety and Plant Date Row */}
          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].variety}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.variety}
                  onValueChange={(value) => updateField('variety', value)}
                  style={styles.picker}
                >
                  {content[language].varieties.map((variety, idx) => (
                    <Picker.Item key={idx} label={variety} value={variety} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].plantDate}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar color="#059669" size={18} />
                <Text style={styles.dateText}>{formatDate(formData.plantDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Area and Cost Row */}
          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].areaAcres}</Text>
              <TextInput
                style={styles.input}
                value={formData.areaAcres}
                onChangeText={(text) => updateField('areaAcres', text)}
                keyboardType="decimal-pad"
                placeholder="3.0"
              />
            </View>

            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].costAcre}</Text>
              <TextInput
                style={styles.input}
                value={formData.costAcre}
                onChangeText={(text) => updateField('costAcre', text)}
                keyboardType="numeric"
                placeholder="45,000"
              />
            </View>
          </View>

          {/* Storage and Mode Row */}
          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].storage}</Text>
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.storage}
                  onValueChange={(value) => updateField('storage', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6EE7B7' }}
                  thumbColor={formData.storage ? '#059669' : '#F3F4F6'}
                />
                <Leaf color="#059669" size={20} style={{ marginLeft: 8 }} />
              </View>
            </View>

            <View style={styles.halfColumn}>
              <Text style={styles.label}>{content[language].mode}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.mode}
                  onValueChange={(value) => updateField('mode', value)}
                  style={styles.picker}
                >
                  {content[language].modes.map((mode, idx) => (
                    <Picker.Item key={idx} label={mode} value={mode} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {content[language].predictPrice} • {language === 'si' ? 'බිත් පුරෝකථනය' : 'Rice Forecast'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.plantDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  languageButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  languageButtonText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 15,
    color: '#1F2937',
  },
  switchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PriceForcastFormScreen;