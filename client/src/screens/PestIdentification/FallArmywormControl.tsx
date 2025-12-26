import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  Bug,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  CalendarCheck,
  Info,
  CheckCircle2,
  Bell,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

type Language = "si" | "en";

type TodoItem = {
  id: number;
  title: { si: string; en: string };
  desc: { si: string; en: string };
  done: boolean;
  date: Date | null;

  // ✅ NEW (Push notifications tracking)
  notificationId?: string | null;
};

type PreventionStep = {
  key: string;
  icon: React.ReactNode;
  title: { si: string; en: string };
  description: { si: string; en: string };
  why: { si: string; en: string };
};

// ✅ NEW: Storage key (increment version if schema changes later)
const TODO_STORAGE_KEY = "FAW_TODO_STATE_V1";

// ✅ FIXED: Local notification handler with explicit type casting
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    } as Notifications.NotificationBehavior;
  },
});

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ NEW: Google Calendar URL builder (all-day event)
function buildGoogleCalendarURL(title: string, details: string, date: Date) {
  const start = formatDate(date).replace(/-/g, "");
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  const end = formatDate(endDate).replace(/-/g, "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&details=${encodeURIComponent(details)}&dates=${start}/${end}`;
}

// ✅ NEW: request notification permissions (local reminders)
async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === "granted") return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

// ✅ UPDATED: build custom time for a given day
function atCustomTime(dateOnly: Date, timeOfDay: Date) {
  const d = new Date(dateOnly);
  d.setHours(timeOfDay.getHours(), timeOfDay.getMinutes(), 0, 0);
  return d;
}

export default function FallArmywormControl() {
  // ✅ UPDATED: Use global language context
  const { language: appLang } = useLanguage();
  const language: Language = appLang === "sinhala" ? "si" : "en";

  const [todoMode, setTodoMode] = useState<boolean>(false);
  const [expandedInfo, setExpandedInfo] = useState<boolean>(true);

  const [pickerTodoId, setPickerTodoId] = useState<number | null>(null);

  // ✅ NEW: State for reminder time picker
  const [reminderTime, setReminderTime] = useState<Date>(
    new Date(0, 0, 0, 9, 0)
  ); // Default 9:00 AM
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const preventionSteps: PreventionStep[] = useMemo(
    () => [
      {
        key: "step1",
        icon: <Bug size={26} color="#166534" />,
        title: {
          si: "ඉක්මන් ක්ෂේත්‍ර ක්‍රියා (පළමු පැය 24)",
          en: "Immediate Field Actions (First 24 Hours)",
        },
        description: {
          si: "පත්‍ර මධ්‍යයේ (whorl) පරීක්ෂා කර දැකිය හැකි Fall Armyworm larva සහ බිත්තර කණ්ඩායම් අතින් ඉවත් කරන්න. සවස හෝ උදේ වේලාවන්හි පරීක්ෂා කිරීම වඩාත් සුදුසුය.",
          en: "Inspect the leaf whorl and manually remove visible Fall Armyworm larvae and egg masses. Early morning or late evening scouting is recommended.",
        },
        why: {
          si: "Larva stage එකේදී ඉක්මනින් ගණන අඩු කරගත්තොත් පසුකාලීනව බෝගයට වෙන හානිය අඩුවේ. Whorl තුළට ගැඹුරු වීමෙන් පසු පාලනය අමාරුයි.",
          en: "Early intervention reduces later crop damage. Once larvae move deeper into the whorl/stem, control becomes difficult.",
        },
      },
      {
        key: "step2",
        icon: <Leaf size={26} color="#15803d" />,
        title: {
          si: "ජෛව හා යාන්ත්‍රික පාලනය (දින කිහිපය තුළ)",
          en: "Mechanical & Biological Control (Next Few Days)",
        },
        description: {
          si: "Neem-based ජෛව පාලන ක්‍රම භාවිතා කරන්න. පාලන සහාය ලෙස pheromone traps භාවිතා කර මදුරු (moths) ගණන අඩු කිරීමට කටයුතු කරන්න.",
          en: "Use neem-based biopesticides as biological control. Support control with pheromone traps to reduce adult moth populations.",
        },
        why: {
          si: "IPM ක්‍රමයේදී රසායනික පාලනයට පෙර ජෛව/යාන්ත්‍රික ක්‍රම භාවිතා කිරීම පරිසරයට හානි අඩු කරයි සහ ප්‍රතිරෝධීත්ව අවදානම අඩු කරයි.",
          en: "IPM prioritizes biological/mechanical methods before chemicals, reducing environmental harm and lowering resistance risk.",
        },
      },
      {
        key: "step3",
        icon: <ShieldCheck size={26} color="#0f766e" />,
        title: {
          si: "බෝග පිරිසිදුකම සහ ආරක්ෂාව",
          en: "Crop Sanitation & Protection",
        },
        description: {
          si: "ආසාදිත පත්‍ර සහ ශාක කොටස් ඉවත් කර නිසි ලෙස විනාශ කරන්න. කුඹුර පිරිසිදු තත්ත්වයේ තබා ගන්න. ආසාදිත ඉතිරි කොටස් කුඹුරේ තැබීමෙන් වළකින්න.",
          en: "Remove and properly destroy infected leaves and plant residues. Maintain field sanitation and avoid leaving infested residues in the field.",
        },
        why: {
          si: "ශාක ඉතිරි කොටස් තුළ කෘමීන් රැඳී සිටිය හැක. පිරිසිදුකම මඟින් නැවත ආසාදනය අවම වේ.",
          en: "Pests can persist in residues. Sanitation reduces reinfestation and disease/pest carryover.",
        },
      },
      {
        key: "step4",
        icon: <AlertTriangle size={26} color="#b45309" />,
        title: {
          si: "රසායනික පාලනය (දැනුවත් කිරීම පමණි)",
          en: "Chemical Control (Awareness Only)",
        },
        description: {
          si: "දැඩි හානියක් පවතින බව පෙනී යන අවස්ථාවලදී පමණක් කෘෂි උපදේශකයෙකුගෙන්/නිල ආයතනයකින් උපදේශනය ලබා ගන්න. අධික රසායනික භාවිතයෙන් වළකින්න.",
          en: "Only if severe damage is observed, seek official guidance from agricultural officers/authorities. Avoid excessive chemical use.",
        },
        why: {
          si: "අධික රසායනික භාවිතය පරිසරයට හානි කරයි සහ කෘමීන්ට resistance ඇති විය හැක. ඒ නිසා මෙය awareness ලෙස පමණයි.",
          en: "Overuse can harm the environment and lead to pesticide resistance. Hence this is provided as awareness only.",
        },
      },
      {
        key: "step5",
        icon: <Leaf size={26} color="#065f46" />,
        title: {
          si: "අනාගත වැළැක්වීම (ඊළඟ වගා කාලය)",
          en: "Future Prevention (Next Season)",
        },
        description: {
          si: "වගා කාලය අවසානයේ ආසාදිත ශාක කොටස් ඉවත් කර විනාශ කරන්න. වගා මාරු කිරීම සහ ක්ෂේත්‍ර කළමනාකරණය මඟින් ආසාදන අවම කළ හැක.",
          en: "Destroy infected crop residues after harvest. Crop rotation and good field management reduce future infestations.",
        },
        why: {
          si: "අනාගත ආසාදන අඩු කළහොත් පාලන වියදම් අඩුවේ. Preventive practices long-term solution එකක්.",
          en: "Reducing future infestations lowers control costs. Preventive practices provide long-term protection.",
        },
      },
    ],
    []
  );

  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: 1,
      title: {
        si: "පත්‍ර මධ්‍යයේ (whorl) පරීක්ෂා කරන්න",
        en: "Inspect the leaf whorl",
      },
      desc: {
        si: "Larva බොහෝවිට whorl තුළ සඟවා සිටී. අදම පරීක්ෂා කරන්න.",
        en: "Larvae often hide inside the whorl. Inspect today.",
      },
      done: false,
      date: null,
      notificationId: null,
    },
    {
      id: 2,
      title: {
        si: "දැකිය හැකි larva සහ බිත්තර ඉවත් කරන්න",
        en: "Remove visible larvae and egg masses",
      },
      desc: {
        si: "අතින් ඉවත් කිරීම සරල හා ආරක්ෂිත පළමු පියවරක්.",
        en: "Manual removal is a safe and effective first step.",
      },
      done: false,
      date: null,
      notificationId: null,
    },
    {
      id: 3,
      title: {
        si: "ජෛව පාලන ක්‍රම (Neem/Traps) සකස් කරන්න",
        en: "Set up biological control (Neem/Traps)",
      },
      desc: {
        si: "Neem-based ජෛව පාලනය සහ pheromone traps භාවිතා කිරීමෙන් ව්‍යාප්තිය අඩු වේ.",
        en: "Neem-based control and pheromone traps reduce spread and adult moths.",
      },
      done: false,
      date: null,
      notificationId: null,
    },
    {
      id: 4,
      title: {
        si: "දින 3කින් නැවත පරීක්ෂා කරන්න",
        en: "Re-check after 3 days",
      },
      desc: {
        si: "Rapid spread නිසා නැවත පරීක්ෂාව අත්‍යවශ්‍යයි.",
        en: "Re-checking is essential due to rapid spread.",
      },
      done: false,
      date: null,
      notificationId: null,
    },
  ]);

  // ✅ NEW: Load To-Do from AsyncStorage at start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(TODO_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as any[];
        setTodos(
          parsed.map((t) => ({
            ...t,
            date: t.date ? new Date(t.date) : null,
            notificationId: t.notificationId ?? null,
          }))
        );
      } catch {
        // If storage is corrupted, ignore and continue with defaults
      }
    })();
  }, []);

  // ✅ NEW: Save To-Do changes to AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const serial = todos.map((t) => ({
          ...t,
          date: t.date ? t.date.toISOString() : null,
        }));
        await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(serial));
      } catch {
        // ignore
      }
    })();
  }, [todos]);

  const completedCount = useMemo(
    () => todos.filter((t) => t.done).length,
    [todos]
  );

  // ✅ NEW: cancel a scheduled notification for a task
  const cancelTaskNotification = async (todoId: number) => {
    const t = todos.find((x) => x.id === todoId);
    if (!t?.notificationId) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(t.notificationId);
    } catch {
      // ignore
    }

    setTodos((prev) =>
      prev.map((x) => (x.id === todoId ? { ...x, notificationId: null } : x))
    );
  };

  const toggleDone = async (id: number) => {
    const current = todos.find((t) => t.id === id);

    // If marking as done -> cancel reminder
    if (current && !current.done) {
      await cancelTaskNotification(id);
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const setTodoDate = async (id: number, date: Date) => {
    // When date changes, cancel existing reminder so it can be rescheduled
    await cancelTaskNotification(id);

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, date } : t)));
    setPickerTodoId(null);
  };

  const resetTodos = () => {
    Alert.alert(
      language === "si" ? "Reset කරන්නද?" : "Reset?",
      language === "si"
        ? "To-Do ලැයිස්තුව නැවත ආරම්භ කරන්නද?"
        : "Reset the To-Do planner?",
      [
        { text: language === "si" ? "නැහැ" : "No", style: "cancel" },
        {
          text: language === "si" ? "ඔව්" : "Yes",
          style: "destructive",
          onPress: async () => {
            // cancel all scheduled reminders
            const ids = todos
              .map((t) => t.notificationId)
              .filter(Boolean) as string[];
            for (const nid of ids) {
              try {
                await Notifications.cancelScheduledNotificationAsync(nid);
              } catch {}
            }

            setTodos((prev) =>
              prev.map((t) => ({
                ...t,
                done: false,
                date: null,
                notificationId: null,
              }))
            );
          },
        },
      ]
    );
  };

  // ✅ NEW FEATURE (1): Add all tasks to Google Calendar
  const addAllTasksToGoogleCalendar = async () => {
    const withDates = todos.filter((t) => t.date);
    if (withDates.length === 0) {
      Alert.alert(
        language === "si" ? "දිනයක් නැහැ" : "No dates",
        language === "si"
          ? "Calendar එකට එක් කිරීමට පෙර To-Do වලට දිනයක් තෝරන්න."
          : "Please select dates for tasks before adding to Google Calendar."
      );
      return;
    }

    // Open one-by-one (Google Calendar template pages)
    for (const t of withDates) {
      const url = buildGoogleCalendarURL(
        t.title[language],
        t.desc[language],
        t.date as Date
      );
      await Linking.openURL(url);
    }
  };

  // ✅ UPDATED FEATURE: Push notifications with custom time
  const scheduleAllReminders = async () => {
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(
        language === "si" ? "Permission නැහැ" : "Permission denied",
        language === "si"
          ? "Reminders සක්‍රීය කිරීමට Notification permission අවශ්‍යයි."
          : "Notification permission is required to enable reminders."
      );
      return;
    }

    // schedule reminders only for tasks that have date and not done
    const schedulable = todos.filter((t) => t.date && !t.done);

    if (schedulable.length === 0) {
      Alert.alert(
        language === "si" ? "Reminders නැහැ" : "Nothing to schedule",
        language === "si"
          ? "Date දාපු tasks නැතිවෙන්නත් පුළුවන්, නැත්නම් tasks Done වෙලා තියෙන්නත් පුළුවන්."
          : "No dated tasks found, or tasks are already completed."
      );
      return;
    }

    // Cancel existing notifications for those tasks first
    for (const t of schedulable) {
      if (t.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            t.notificationId
          );
        } catch {}
      }
    }

    // Schedule new reminders with custom time
    const updated: TodoItem[] = [];
    for (const t of schedulable) {
      const triggerAt = atCustomTime(t.date as Date, reminderTime);

      // If selected date is in the past, skip scheduling
      if (triggerAt.getTime() <= Date.now()) {
        updated.push({ ...t, notificationId: null });
        continue;
      }

      // ✅ FIXED: Use DateTriggerInput format
      const nid = await Notifications.scheduleNotificationAsync({
        content: {
          title:
            language === "si" ? "MaizeGenie Reminder" : "MaizeGenie Reminder",
          body: t.title[language],
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerAt,
        },
      });

      updated.push({ ...t, notificationId: nid });
    }

    // Merge updated notificationId values back to todos
    setTodos((prev) =>
      prev.map((x) => {
        const u = updated.find((z) => z.id === x.id);
        return u ? { ...x, notificationId: u.notificationId } : x;
      })
    );

    const timeStr = `${reminderTime.getHours()}:${String(
      reminderTime.getMinutes()
    ).padStart(2, "0")}`;
    Alert.alert(
      language === "si" ? "Reminders සකස් වුනා" : "Reminders scheduled",
      language === "si"
        ? `Date දාපු tasks වලට ${timeStr} reminder එකක් set කළා.`
        : `Scheduled ${timeStr} reminders for dated tasks.`
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === "si"
            ? "Fall Armyworm පාලන හා වැළැක්වීම"
            : "Fall Armyworm Control & Prevention"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {language === "si"
            ? "YOLO හඳුනාගැනීමෙන් පසු IPM මත පදනම් වූ ක්‍රියාමාර්ග"
            : "IPM-based actions after YOLO detection"}
        </Text>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, !todoMode && styles.modeActive]}
          onPress={() => setTodoMode(false)}
        >
          <Info size={16} color={!todoMode ? "#ffffff" : "#065f46"} />
          <Text style={[styles.modeText, !todoMode && styles.modeTextActive]}>
            {language === "si" ? "මඟ පෙන්වීම" : "Guidance"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, todoMode && styles.modeActive]}
          onPress={() => setTodoMode(true)}
        >
          <CalendarCheck size={16} color={todoMode ? "#ffffff" : "#065f46"} />
          <Text style={[styles.modeText, todoMode && styles.modeTextActive]}>
            {language === "si" ? "To-Do සැලසුම" : "To-Do Planner"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Expanded Info (Guidance mode only) */}
        {!todoMode && (
          <>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setExpandedInfo((s) => !s)}
            >
              <Text style={styles.sectionTitle}>
                {language === "si"
                  ? "විස්තර / තොරතුරු"
                  : "Information & Context"}
              </Text>
              <Text style={styles.sectionHint}>
                {expandedInfo ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>

            {expandedInfo && (
              <View style={styles.infoBox}>
                <Text style={styles.infoHeading}>
                  {language === "si" ? "කෘමි හැඳින්වීම" : "Pest Overview"}
                </Text>
                <Text style={styles.infoText}>
                  {language === "si"
                    ? "Fall Armyworm (Spodoptera frugiperda) යනු බඩ ඉරිඟු වගාවට දැඩි හානි කරන ආක්‍රමණශීලී කෘමියකි. මෙය පත්‍ර කුහර, whorl damage සහ වේගවත් ව්‍යාප්තිය හේතුවෙන් බෝගයට දැඩි හානි සිදු කරයි."
                    : "Fall Armyworm (Spodoptera frugiperda) is an invasive pest that severely damages maize through leaf defoliation, whorl damage, and rapid spread."}
                </Text>

                <Text style={styles.infoHeading}>
                  {language === "si"
                    ? "ඉක්මන් ක්‍රියා අවශ්‍ය ඇයි?"
                    : "Why early action matters"}
                </Text>
                <Text style={styles.infoText}>
                  {language === "si"
                    ? "Larva අවස්ථාවේදී ඉක්මනින් පාලනය නොකළහොත් කෘමිය whorl/කඳ තුළ ගැඹුරු විය හැකි අතර පසුව පාලනය කිරීම අමාරු වේ."
                    : "If larvae are not controlled early, they move deeper into the whorl/stem, making control difficult and costly later."}
                </Text>

                <Text style={styles.infoHeading}>
                  {language === "si" ? "IPM සංකල්පය" : "IPM concept"}
                </Text>
                <Text style={styles.infoText}>
                  {language === "si"
                    ? "මෙය Integrated Pest Management (IPM) මත පදනම් වේ: යාන්ත්‍රික + ජෛව + සංස්කෘතික ක්‍රම මුල් කරගෙන, අවශ්‍ය වූ විට පමණක් රසායනික උපදේශනය ලබා ගැනීම."
                    : "This follows Integrated Pest Management (IPM): prioritize mechanical, biological, and cultural control, while seeking chemical guidance only when necessary."}
                </Text>

                <Text style={styles.infoHeading}>
                  {language === "si"
                    ? "රසායනික දැනුවත් කිරීම"
                    : "Chemical awareness"}
                </Text>
                <Text style={styles.infoText}>
                  {language === "si"
                    ? "අධික රසායනික භාවිතය පරිසරයට හානි කළ හැකි අතර කෘමීන්ට resistance ඇති විය හැක. ඒ නිසා මෙය awareness ලෙස පමණයි."
                    : "Overuse of chemicals can harm the environment and cause pesticide resistance. Therefore, this module provides awareness only."}
                </Text>
              </View>
            )}

            {/* IPM Steps */}
            <Text style={styles.sectionTitlePlain}>
              {language === "si"
                ? "IPM පියවර (Step-by-step)"
                : "IPM Steps (Step-by-step)"}
            </Text>

            {preventionSteps.map((step) => (
              <View key={step.key} style={styles.card}>
                <View style={styles.cardIcon}>{step.icon}</View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{step.title[language]}</Text>
                  <Text style={styles.cardDescription}>
                    {step.description[language]}
                  </Text>

                  <View style={styles.whyBox}>
                    <Text style={styles.whyTitle}>
                      {language === "si" ? "හේතුව" : "Why"}
                    </Text>
                    <Text style={styles.whyText}>{step.why[language]}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* To-Do Planner */}
        {todoMode && (
          <>
            <View style={styles.todoHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitlePlain}>
                  {language === "si" ? "To-Do සැලසුම" : "To-Do Planner"}
                </Text>
                <Text style={styles.todoSubtitle}>
                  {language === "si"
                    ? "Date දාගෙන Done ලෙස ලකුණු කරන්න"
                    : "Assign dates and mark tasks as done"}
                </Text>
              </View>

              <View style={styles.todoProgress}>
                <CheckCircle2 size={16} color="#065f46" />
                <Text style={styles.todoProgressText}>
                  {completedCount}/{todos.length}
                </Text>
              </View>
            </View>

            {/* ✅ NEW: Time Picker for Reminders */}
            <View style={styles.timePickerSection}>
              <Text style={styles.timePickerLabel}>
                {language === "si" ? "Reminder වේලාව" : "Reminder Time"}
              </Text>
              <TouchableOpacity
                style={styles.timePickerBtn}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timePickerText}>
                  {`${reminderTime.getHours()}:${String(
                    reminderTime.getMinutes()
                  ).padStart(2, "0")}`}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={reminderTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, selectedTime) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (selectedTime) {
                      setReminderTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            {/* ✅ NEW: Buttons row (Calendar + Reminders) */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.calendarBtn}
                onPress={addAllTasksToGoogleCalendar}
              >
                <Text style={styles.calendarBtnText}>
                  {language === "si"
                    ? "Tasks Google Calendar එකට"
                    : "Add tasks to Google Calendar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notifyBtn}
                onPress={scheduleAllReminders}
              >
                <Bell size={16} color="#fff" />
                <Text style={styles.notifyBtnText}>
                  {language === "si"
                    ? "Reminders සකස් කරන්න"
                    : "Schedule reminders"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={resetTodos}>
              <Text style={styles.resetBtnText}>
                {language === "si" ? "Reset To-Do" : "Reset To-Do"}
              </Text>
            </TouchableOpacity>

            {todos.map((todo) => (
              <View key={todo.id} style={styles.todoCard}>
                <TouchableOpacity onPress={() => toggleDone(todo.id)}>
                  <Text style={styles.checkbox}>{todo.done ? "✅" : "⬜"}</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.todoTitle, todo.done && styles.todoDone]}
                  >
                    {todo.title[language]}
                  </Text>

                  <Text style={styles.todoDesc}>{todo.desc[language]}</Text>

                  <TouchableOpacity onPress={() => setPickerTodoId(todo.id)}>
                    <Text style={styles.todoDate}>
                      {todo.date
                        ? `${
                            language === "si" ? "දිනය" : "Date"
                          }: ${formatDate(todo.date)}`
                        : language === "si"
                        ? "දිනය තෝරන්න"
                        : "Select date"}
                    </Text>
                  </TouchableOpacity>

                  {pickerTodoId === todo.id && (
                    <DateTimePicker
                      value={todo.date || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      onChange={(_, selectedDate) => {
                        if (selectedDate) setTodoDate(todo.id, selectedDate);
                        else setPickerTodoId(null);
                      }}
                    />
                  )}
                </View>
              </View>
            ))}

            <View style={styles.todoNote}>
              <Text style={styles.todoNoteTitle}>
                {language === "si" ? "සටහන" : "Note"}
              </Text>
              <Text style={styles.todoNoteText}>
                {language === "si"
                  ? "Calendar එකට add කරන්නේ date දාපු tasks පමණයි. Reminders ඔබ තෝරපු වේලාවට set වෙනවා (date future එකක් නම්)."
                  : "Only dated tasks are added to Calendar. Reminders are scheduled at your chosen time (only for future dates)."}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },

  header: {
    padding: 45,
    backgroundColor: "#dcfce7",
    borderBottomWidth: 1,
    borderColor: "#bbf7d0",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#14532d" },
  headerSubtitle: { fontSize: 13, color: "#166534", marginTop: 4 },

  modeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  modeActive: { backgroundColor: "#065f46" },
  modeText: { fontSize: 13, color: "#065f46", fontWeight: "600" },
  modeTextActive: { color: "#ffffff" },

  content: { padding: 16, paddingBottom: 30 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#064e3b" },
  sectionHint: { fontSize: 12, color: "#2563eb", fontWeight: "600" },

  infoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ecfdf5",
  },
  infoHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#064e3b",
    marginTop: 6,
    marginBottom: 4,
  },
  infoText: { fontSize: 13, color: "#374151", lineHeight: 18 },

  sectionTitlePlain: {
    fontSize: 16,
    fontWeight: "700",
    color: "#064e3b",
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: { marginRight: 12, marginTop: 4 },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#064e3b",
    marginBottom: 4,
  },
  cardDescription: { fontSize: 13, color: "#374151", lineHeight: 18 },

  whyBox: {
    marginTop: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  whyTitle: { fontSize: 12, fontWeight: "800", color: "#166534" },
  whyText: { fontSize: 12, color: "#374151", marginTop: 4, lineHeight: 17 },

  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  todoSubtitle: { fontSize: 12, color: "#374151", marginTop: 2 },
  todoProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  todoProgressText: { fontSize: 12, fontWeight: "700", color: "#065f46" },

  resetBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    marginBottom: 10,
  },
  resetBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  todoCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  checkbox: { fontSize: 20, marginTop: 2 },
  todoTitle: { fontSize: 14, fontWeight: "700", color: "#064e3b" },
  todoDesc: { fontSize: 12, color: "#374151", marginTop: 4, lineHeight: 17 },
  todoDone: { textDecorationLine: "line-through", color: "#6b7280" },
  todoDate: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 6,
    fontWeight: "700",
  },

  todoNote: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ecfdf5",
  },
  todoNoteTitle: { fontSize: 13, fontWeight: "800", color: "#064e3b" },
  todoNoteText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 6,
    lineHeight: 17,
  },

  /* ========== ✅ NEW STYLES (ONLY for new features) ========== */

  timePickerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#064e3b",
  },
  timePickerBtn: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  timePickerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  calendarBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  calendarBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
  },

  notifyBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f766e",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  notifyBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
  },
});