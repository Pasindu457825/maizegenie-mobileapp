import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Platform,
} from "react-native";
import { Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface CustomDatePickerProps {
    label: string;
    value: Date | null;
    onSelect: (date: Date) => void;
    placeholder?: string;
    required?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    label,
    value,
    onSelect,
    placeholder = "YYYY-MM-DD",
    required = false,
}) => {
    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date());

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleConfirm = () => {
        onSelect(tempDate);
        setShow(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            <TouchableOpacity
                style={styles.selector}
                onPress={() => setShow(true)}
            >
                <Text style={[styles.selectorText, !value && styles.placeholderText]}>
                    {value ? formatDate(value) : placeholder}
                </Text>
                <Calendar color="#6B7280" size={20} />
            </TouchableOpacity>

            {Platform.OS === "android" && show && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShow(false);
                        if (selectedDate) {
                            onSelect(selectedDate);
                        }
                    }}
                />
            )}

            {Platform.OS === "ios" && (
                <Modal
                    visible={show}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShow(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShow(false)}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShow(false)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={styles.confirmText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTempDate(selectedDate);
                                    }
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
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
        color: "#065F46",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    selector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    selectorText: {
        fontSize: 15,
        color: "#065F46",
    },
    placeholderText: {
        color: "#9CA3AF",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    cancelText: {
        fontSize: 16,
        color: "#6B7280",
    },
    confirmText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#10B981",
    },
});

export default CustomDatePicker;
