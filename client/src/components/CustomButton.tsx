import { Text, TouchableOpacity } from "react-native";

export default function CustomButton({
  label,
  onPress,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "outline";
}) {
  const base = "min-w-[140px] items-center justify-center rounded-xl px-4 py-3";
  const styles =
    variant === "danger"
      ? `${base} bg-red-500`
      : variant === "outline"
      ? `${base} border border-brand bg-transparent`
      : `${base} bg-brand`;

  const text =
    variant === "outline" ? "font-bold text-[var(--color-brand-dark)]" : "font-bold text-white";

  return (
    <TouchableOpacity className={styles} onPress={onPress}>
      <Text className={text}>{label}</Text>
    </TouchableOpacity>
  );
}
