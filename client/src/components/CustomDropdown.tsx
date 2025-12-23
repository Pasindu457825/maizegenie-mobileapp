import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    FlatList,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

interface DropdownOption {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onSelect: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    label,
    value,
    options,
    onSelect,
    placeholder = "Select",
    required = false,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
            >
                <Text
                    style={[
                        styles.selectorText,
                        !selectedOption && styles.placeholderText,
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <ChevronDown color="#6B7280" size={20} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onSelect(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        width: "85%",
        maxHeight: "70%",
        padding: 8,
    },
    option: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    optionText: {
        fontSize: 15,
        color: "#065F46",
    },
    cancelButton: {
        marginTop: 8,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        marginHorizontal: 8,
        marginBottom: 8,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#6B7280",
    },
});

export default CustomDropdown;
