import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";

interface HybridDateInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
}

const HybridDateInput: React.FC<HybridDateInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder = "YYYY-MM-DD",
    required = false,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Validate date format (YYYY-MM-DD)
    const validateDateFormat = (dateString: string): boolean => {
        if (!dateString) return true; // Empty is valid if not required

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) {
            setValidationError("Format should be YYYY-MM-DD");
            return false;
        }

        // Check if it's a valid date
        const parts = dateString.split("-");
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (year < 1900 || year > 2100) {
            setValidationError("Year must be between 1900-2100");
            return false;
        }

        if (month < 1 || month > 12) {
            setValidationError("Month must be between 01-12");
            return false;
        }

        if (day < 1 || day > 31) {
            setValidationError("Day must be between 01-31");
            return false;
        }

        // Check for valid day in month
        const date = new Date(year, month - 1, day);
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            setValidationError("Invalid date");
            return false;
        }

        setValidationError("");
        return true;
    };

    const handleTextChange = (text: string) => {
        onChangeText(text);
        if (text.length >= 10) {
            validateDateFormat(text);
        } else {
            setValidationError("");
        }
    };

    const handleDatePickerChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowPicker(false);
        }

        if (event.type === "dismissed") {
            setShowPicker(false);
            return;
        }

        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;
            onChangeText(formattedDate);
            setValidationError("");
            
            if (Platform.OS === "ios") {
                setShowPicker(false);
            }
        }
    };

    const openDatePicker = () => {
        setShowPicker(true);
    };

    const getDateValue = (): Date => {
        if (value) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(value)) {
                try {
                    // Parse date components to avoid timezone issues
                    const parts = value.split('-');
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                    const day = parseInt(parts[2], 10);
                    
                    const parsedDate = new Date(year, month, day);
                    
                    // Validate the parsed date
                    if (!isNaN(parsedDate.getTime()) && 
                        parsedDate.getFullYear() === year &&
                        parsedDate.getMonth() === month &&
                        parsedDate.getDate() === day) {
                        return parsedDate;
                    }
                } catch (error) {
                    // Invalid date, return current date
                    console.warn('Error parsing date:', error);
                }
            }
        }
        return new Date();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, validationError ? styles.inputError : null]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={handleTextChange}
                    placeholderTextColor="#9CA3AF"
                    maxLength={10}
                />
                <TouchableOpacity style={styles.calendarButton} onPress={openDatePicker}>
                    <Calendar color="#10b981" size={20} />
                </TouchableOpacity>
            </View>

            {validationError ? (
                <Text style={styles.errorText}>{validationError}</Text>
            ) : (
                <Text style={styles.helperText}>
                    Type manually or tap calendar icon
                </Text>
            )}

            {showPicker && (
                <DateTimePicker
                    value={getDateValue()}
                    mode="date"
                    display={Platform.OS === "ios" ? "compact" : "default"}
                    onChange={handleDatePickerChange}
                    maximumDate={new Date(2100, 11, 31)}
                    minimumDate={new Date(1900, 0, 1)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    input: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        paddingRight: 45,
        fontSize: 15,
        color: "#1F2937",
    },
    inputError: {
        borderColor: "#EF4444",
    },
    calendarButton: {
        position: "absolute",
        right: 12,
        padding: 8,
    },
    helperText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 4,
    },
    doneButton: {
        backgroundColor: "#10b981",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    doneButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default HybridDateInput;
