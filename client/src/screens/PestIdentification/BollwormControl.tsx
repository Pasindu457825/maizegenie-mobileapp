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
import { LinearGradient } from "expo-linear-gradient";
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
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

type Language = "si" | "en" | "ta";
type LocalizedText = { si: string; en: string; ta?: string };

type TodoItem = {
  id: number;
  title: LocalizedText;
  desc: LocalizedText;
  done: boolean;
  date: Date | null;
  notificationId?: string | null;
};

type PreventionStep = {
  key: string;
  icon: React.ReactNode;
  title: LocalizedText;
  description: LocalizedText;
  why: LocalizedText;
};

const TODO_STORAGE_KEY = "BOLLWORM_TODO_STATE_V1";

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

function buildGoogleCalendarURL(title: string, details: string, date: Date) {
  const start = formatDate(date).replace(/-/g, "");
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  const end = formatDate(endDate).replace(/-/g, "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&details=${encodeURIComponent(details)}&dates=${start}/${end}`;
}

async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === "granted") return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

function atCustomTime(dateOnly: Date, timeOfDay: Date) {
  const d = new Date(dateOnly);
  d.setHours(timeOfDay.getHours(), timeOfDay.getMinutes(), 0, 0);
  return d;
}

export default function BollwormControl() {
  const { language: appLang } = useLanguage();
  const language: Language =
    appLang === "sinhala" ? "si" : appLang === "tamil" ? "ta" : "en";
  const tr = (si: string, en: string, ta: string) =>
    language === "si" ? si : language === "ta" ? ta : en;
  const localize = (value: LocalizedText) => value[language] ?? value.en;

  const [todoMode, setTodoMode] = useState<boolean>(false);
  const [expandedInfo, setExpandedInfo] = useState<boolean>(true);
  const [pickerTodoId, setPickerTodoId] = useState<number | null>(null);
  const [reminderTime, setReminderTime] = useState<Date>(
    new Date(0, 0, 0, 9, 0)
  );
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const preventionSteps: PreventionStep[] = useMemo(
    () => [
      {
        key: "step1",
        icon: <Bug size={24} color="#10ad79" />,
        title: {
          si: "මුල් අවස්ථාවේ ක්ෂේත්‍ර පරීක්ෂාව (පළමු දින)",
          en: "Early Field Inspection (First Days)",
        ta: "ஆரம்ப வயல் பரிசோதனை (முதல் நாட்கள்)",
        },
        description: {
          si: "බෝල්, කොළ සහ මල් කඳන් දිනපතා පරීක්ෂා කර Bollworm larva සහ බිත්තර කණ්ඩායම් හඳුනාගන්න. උදේ හෝ සවස් වේලාවන්හි පරීක්ෂා කිරීම වඩාත් සුදුසුය.",
          en: "Inspect bolls, leaves, and flower buds daily to detect bollworm larvae and egg masses. Early morning or late evening scouting is most effective.",
        ta: "boll, இலைகள் மற்றும் மலர்கொத்துகளை தினமும் பரிசோதித்து போல்வோர்ம் இருவில் மற்றும் முட்டைக் குழுக்களை கண்டறியவும். அதிகாலை அல்லது மாலை கண்காணிப்பு சிறந்தது.",
        },
        why: {
          si: "Larva බෝල් තුළට ඇතුළු වීමට පෙර හඳුනාගැනීම බෝල් හානි සහ අස්වැන්න අඩුවීම වළක්වයි.",
          en: "Early detection before larvae bore into bolls prevents direct boll damage and yield loss.",
        ta: "இருவில் boll-க்குள் செல்வதற்கு முன் ஆரம்ப கண்டறிதல் நேரடி சேதத்தையும் விளைச்சல் இழப்பையும் தவிர்க்கும்.",
        },
      },
      {
        key: "step2",
        icon: <Leaf size={24} color="#10ad79" />,
        title: {
          si: "යාන්ත්‍රික හා ජෛව පාලනය (දින කිහිපය තුළ)",
          en: "Mechanical & Biological Control (Next Few Days)",
        ta: "இயந்திர மற்றும் உயிரியல் கட்டுப்பாடு (அடுத்த சில நாட்கள்)",
        },
        description: {
          si: "දැකිය හැකි larva අතින් ඉවත් කර විනාශ කරන්න. Neem-based ජෛව පාලන ක්‍රම සහ pheromone traps භාවිතා කර මදුරු (moths) ගණන අඩු කරන්න.",
          en: "Manually remove and destroy visible larvae. Use neem-based biopesticides and pheromone traps to reduce adult moth populations.",
        ta: "காணப்படும் இருவில்களை கையால் அகற்றி அழிக்கவும். முழுவயது வண்டுகளை குறைக்க நீம் அடிப்படையிலான உயிரியல் மருந்துகள் மற்றும் pheromone traps பயன்படுத்தவும்.",
        },
        why: {
          si: "අතින් ඉවත් කිරීම සහ ජෛව පාලනය IPM ක්‍රමයට අනුකූල වන අතර පරිසර හානි අඩු කරයි.",
          en: "Manual removal and biological control are IPM-compliant and reduce environmental harm.",
        ta: "கையால் அகற்றுதல் மற்றும் உயிரியல் கட்டுப்பாடு IPM முறைக்கு ஏற்ப 있으며 சுற்றுச்சூழல் சேதத்தை குறைக்கும்.",
        },
      },
      {
        key: "step3",
        icon: <ShieldCheck size={24} color="#10ad79" />,
        title: {
          si: "බෝග පිරිසිදුකම සහ ආරක්ෂාව",
          en: "Crop Sanitation & Protection",
        ta: "பயிர் சுத்தம் மற்றும் பாதுகாப்பு",
        },
        description: {
          si: "ආසාදිත බෝල්, කොළ සහ ශාක කොටස් ඉවත් කර නිසි ලෙස විනාශ කරන්න. කුඹුර පිරිසිදු තත්ත්වයේ තබා ගන්න.",
          en: "Remove and properly destroy infected bolls, leaves, and plant residues. Maintain field sanitation.",
        ta: "தொற்றிய bolls, இலைகள் மற்றும் தாவர எச்சங்களை அகற்றி முறையாக அழிக்கவும். வயல் சுத்தத்தைப் பேணவும்.",
        },
        why: {
          si: "ශාක ඉතිරි කොටස් තුළ කෘමීන් රැඳී සිටිය හැක. පිරිසිදුකම නැවත ආසාදනය අඩු කරයි.",
          en: "Pests can persist in crop residues. Sanitation reduces reinfestation.",
        ta: "பயிர் எச்சங்களில் பூச்சிகள் நீடிக்கலாம். சுத்தம் மீண்டும் தாக்குதலைக் குறைக்கும்.",
        },
      },
      {
        key: "step4",
        icon: <AlertTriangle size={24} color="#f59e0b" />,
        title: {
          si: "රසායනික පාලනය (දැනුවත් කිරීම පමණි)",
          en: "Chemical Control (Awareness Only)",
        ta: "இரசாயன கட்டுப்பாடு (விழிப்புணர்வுக்கு மட்டும்)",
        },
        description: {
          si: "දැඩි හානියක් පවතින බව පෙනී යන අවස්ථාවලදී පමණක් කෘෂි උපදේශකයෙකුගෙන්/නිල ආයතනයකින් උපදේශනය ලබා ගන්න. අධික රසායනික භාවිතයෙන් වළකින්න.",
          en: "Only if severe damage is observed, seek official guidance from agricultural officers/authorities. Avoid excessive chemical use.",
        ta: "கடுமையான சேதம் இருந்தால் மட்டுமே வேளாண் அதிகாரிகளின் ஆலோசனையைப் பெறவும். அதிக இரசாயனப் பயன்பாட்டைத் தவிர்க்கவும்.",
        },
        why: {
          si: "අධික රසායනික භාවිතය පරිසරයට හානි කරයි සහ කෘමීන්ට resistance ඇති විය හැක. ඒ නිසා මෙය awareness ලෙස පමණයි.",
          en: "Overuse can harm the environment and lead to pesticide resistance. Hence this is provided as awareness only.",
        ta: "அதிகப்படியான பயன்பாடு சுற்றுச்சூழலுக்கு சேதம் செய்து பூச்சிக்கொல்லி எதிர்ப்பை ஏற்படுத்தலாம். ஆகவே இது விழிப்புணர்வுக்காக மட்டுமே வழங்கப்படுகிறது.",
        },
      },
      {
        key: "step5",
        icon: <Leaf size={24} color="#10ad79" />,
        title: {
          si: "අනාගත වැළැක්වීම (ඊළඟ වගා කාලය)",
          en: "Future Prevention (Next Season)",
        ta: "எதிர்காலத் தடுப்பு (அடுத்த பருவம்)",
        },
        description: {
          si: "වගා කාලය අවසානයේ ආසාදිත ශාක කොටස් ඉවත් කර විනාශ කරන්න. වගා මාරු කිරීම සහ ක්ෂේත්‍ර කළමනාකරණය මඟින් ආසාදන අවම කළ හැක.",
          en: "Destroy infected crop residues after harvest. Crop rotation and good field management reduce future infestations.",
        ta: "அறுவடை பின் பாதிக்கப்பட்ட பயிர் எச்சங்களை அழிக்கவும். பயிர் மாறுதல் மற்றும் நல்ல வயல் மேலாண்மை எதிர்கால தாக்குதலைக் குறைக்கும்.",
        },
        why: {
          si: "අනාගත ආසාදන අඩු කළහොත් පාලන වියදම් අඩුවේ. Preventive practices long-term solution එකක්.",
          en: "Reducing future infestations lowers control costs. Preventive practices provide long-term protection.",
        ta: "எதிர்கால தாக்குதலைக் குறைப்பது கட்டுப்பாட்டு செலவை குறைக்கும். தடுப்பு நடைமுறைகள் நீண்டகால பாதுகாப்பை வழங்கும்.",
        },
      },
    ],
    []
  );

  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: 1,
      title: {
        si: "බෝල් සහ මල් කඳන් පරීක්ෂා කරන්න",
        en: "Inspect bolls and flower buds",
        ta: "boll மற்றும் மலர்கொத்துகளை பரிசோதிக்கவும்",
      },
      desc: {
        si: "Bollworm larva බෝල් තුළ සඟවා සිටී. අදම පරීක්ෂා කරන්න.",
        en: "Bollworm larvae hide inside bolls. Inspect today.",
        ta: "போல்வோர்ம் இருவில் boll-களின் உள்ளே மறையும். இன்று பரிசோதிக்கவும்.",
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
        ta: "காணப்படும் இருவில் மற்றும் முட்டைக் குழுக்களை அகற்றவும்",
      },
      desc: {
        si: "අතින් ඉවත් කිරීම සරල හා ආරක්ෂිත පළමු පියවරක්.",
        en: "Manual removal is a safe and effective first step.",
        ta: "கையால் அகற்றுவது பாதுகாப்பான மற்றும் பயனுள்ள முதல் படி.",
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
        ta: "உயிரியல் கட்டுப்பாடு அமைக்கவும் (நீம்/கண்ணிகள்)",
      },
      desc: {
        si: "Neem-based ජෛව පාලනය සහ pheromone traps භාවිතා කිරීමෙන් ව්‍යාප්තිය අඩු වේ.",
        en: "Neem-based control and pheromone traps reduce spread and adult moths.",
        ta: "நீம் அடிப்படையிலான கட்டுப்பாடு மற்றும் pheromone traps பரவலையும் முழுவயது வண்டுகளையும் குறைக்கும்.",
      },
      done: false,
      date: null,
      notificationId: null,
    },
    {
      id: 4,
      title: {
        si: "දින 3-4කින් නැවත පරීක්ෂා කරන්න",
        en: "Re-check after 3-4 days",
        ta: "3-4 நாட்களில் மீண்டும் பரிசோதிக்கவும்",
      },
      desc: {
        si: "නැවත ආසාදනය පරීක්ෂා කිරීම අත්‍යවශ්‍යයි.",
        en: "Follow-up inspection is essential.",
        ta: "தொடர்ச்சி பரிசோதனை அவசியம்.",
      },
      done: false,
      date: null,
      notificationId: null,
    },
  ]);

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

    if (current && !current.done) {
      await cancelTaskNotification(id);
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const setTodoDate = async (id: number, date: Date) => {
    await cancelTaskNotification(id);

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, date } : t)));
    setPickerTodoId(null);
  };

  const resetTodos = () => {
    Alert.alert(
      tr("Reset කරන්නද?", "Reset?", "மீட்டமைக்கவா?"),
      tr(
        "To-Do ලැයිස්තුව නැවත ආරම්භ කරන්නද?",
        "Reset the To-Do planner?",
        "To-Do திட்டத்தை மீட்டமைக்கவா?"
      ),
      [
        { text: tr("නැහැ", "No", "இல்லை"), style: "cancel" },
        {
          text: tr("ඔව්", "Yes", "ஆம்"),
          style: "destructive",
          onPress: async () => {
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

  const addAllTasksToGoogleCalendar = async () => {
    const withDates = todos.filter((t) => t.date);
    if (withDates.length === 0) {
      Alert.alert(
        tr("දිනයක් නැහැ", "No dates", "தேதி இல்லை"),
        tr(
          "Calendar එකට එක් කිරීමට පෙර To-Do වලට දිනයක් තෝරන්න.",
          "Please select dates for tasks before adding to Google Calendar.",
          "Google Calendar-க்கு சேர்ப்பதற்கு முன் பணிகளுக்கான தேதியை தேர்வு செய்யவும்."
        )
      );
      return;
    }

    for (const t of withDates) {
      const url = buildGoogleCalendarURL(
        localize(t.title),
        localize(t.desc),
        t.date as Date
      );
      await Linking.openURL(url);
    }
  };

  const scheduleAllReminders = async () => {
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(
        tr("Permission නැහැ", "Permission denied", "அனுமதி இல்லை"),
        tr(
          "Reminders සක්‍රීය කිරීමට Notification permission අවශ්‍යයි.",
          "Notification permission is required to enable reminders.",
          "நினைவூட்டல்களை செயல்படுத்த அறிவிப்பு அனுமதி தேவை."
        )
      );
      return;
    }

    const schedulable = todos.filter((t) => t.date && !t.done);

    if (schedulable.length === 0) {
      Alert.alert(
        tr("Reminders නැහැ", "Nothing to schedule", "நினைவூட்ட ஒன்றுமில்லை"),
        tr(
          "Date දාපු tasks නැතිවෙන්නත් පුළුවන්, නැත්නම් tasks Done වෙලා තියෙන්නත් පුළුවන්.",
          "No dated tasks found, or tasks are already completed.",
          "தேதி உள்ள பணிகள் இல்லை, அல்லது பணிகள் ஏற்கனவே முடிக்கப்பட்டுள்ளன."
        )
      );
      return;
    }

    for (const t of schedulable) {
      if (t.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            t.notificationId
          );
        } catch {}
      }
    }

    const updated: TodoItem[] = [];
    for (const t of schedulable) {
      const triggerAt = atCustomTime(t.date as Date, reminderTime);

      if (triggerAt.getTime() <= Date.now()) {
        updated.push({ ...t, notificationId: null });
        continue;
      }

      const nid = await Notifications.scheduleNotificationAsync({
        content: {
          title: "MaizeGenie Reminder",
          body: localize(t.title),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerAt,
        },
      });

      updated.push({ ...t, notificationId: nid });
    }

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
      tr("Reminders සකස් වුනා", "Reminders scheduled", "நினைவூட்டல்கள் அமைக்கப்பட்டன"),
      tr(
        `Date දාපු tasks වලට ${timeStr} reminder එකක් set කළා.`,
        `Scheduled ${timeStr} reminders for dated tasks.`,
        `தேதியிட்ட பணிகளுக்கு ${timeStr} நேர நினைவூட்டல் அமைக்கப்பட்டது.`
      )
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Modern Gradient Header */}
      <LinearGradient
        colors={["#10ad79", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Bug size={32} color="#ffffff" strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {tr("Bollworm පාලන හා වැළැක්වීම", "Bollworm Control & Prevention", "போல்வோர்ம் கட்டுப்பாடு மற்றும் தடுப்பு")}
            </Text>
            <Text style={styles.headerSubtitle}>
              {tr("YOLO හඳුනාගැනීමෙන් පසු IPM මත පදනම් වූ ක්‍රියාමාර්ග", "IPM-based actions after YOLO detection", "YOLO கண்டறிதலுக்குப் பிறகு IPM அடிப்படையிலான செயல்கள்")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Modern Mode Toggle */}
      <View style={styles.modeContainer}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, !todoMode && styles.modeBtnActive]}
            onPress={() => setTodoMode(false)}
            activeOpacity={0.7}
          >
            <Info size={18} color={!todoMode ? "#ffffff" : "#10ad79"} />
            <Text style={[styles.modeText, !todoMode && styles.modeTextActive]}>
              {tr("මඟ පෙන්වීම", "Guidance", "வழிகாட்டல்")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, todoMode && styles.modeBtnActive]}
            onPress={() => setTodoMode(true)}
            activeOpacity={0.7}
          >
            <CalendarCheck size={18} color={todoMode ? "#ffffff" : "#10ad79"} />
            <Text style={[styles.modeText, todoMode && styles.modeTextActive]}>
              {tr("To-Do සැලසුම", "To-Do Planner", "To-Do திட்டம்")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Guidance Mode */}
        {!todoMode && (
          <>
            {/* Information Section */}
            <TouchableOpacity
              style={styles.infoSection}
              onPress={() => setExpandedInfo((s) => !s)}
              activeOpacity={0.9}
            >
              <View style={styles.infoSectionHeader}>
                <View style={styles.infoHeaderLeft}>
                  <View style={styles.infoIconContainer}>
                    <Info size={20} color="#10ad79" />
                  </View>
                  <Text style={styles.infoSectionTitle}>
                    {tr("විස්තර / තොරතුරු", "Information & Context", "தகவல் மற்றும் பின்னணி")}
                  </Text>
                </View>
                {expandedInfo ? (
                  <ChevronUp size={20} color="#6b7280" />
                ) : (
                  <ChevronDown size={20} color="#6b7280" />
                )}
              </View>

              {expandedInfo && (
                <View style={styles.infoContent}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoHeading}>
                      {tr("කෘමි හැඳින්වීම", "Pest Overview", "பூச்சி அறிமுகம்")}
                    </Text>
                    <Text style={styles.infoText}>
                      {tr(
                        "Bollworm යනු කපු වගාවට දැඩි හානි කරන ආක්‍රමණශීලී කෘමියකි. මෙය බෝල් තුළට විවර වීම, මල් කඳන්වලට හානි සහ වේගවත් ව්‍යාප්තිය හේතුවෙන් අස්වැන්නට දැඩි හානි සිදු කරයි.",
                        "Bollworm is an invasive pest that severely damages cotton crops through boll boring, flower bud damage, and rapid spread.",
                        "போல்வோர்ம் என்பது பயிருக்கு கடுமையான சேதம் விளைவிக்கும் ஆக்கிரமிப்பு பூச்சி. இது boll துளைத்தல், மலர்கொத்து சேதம் மற்றும் வேகமான பரவலால் விளைச்சலை பாதிக்கிறது."
                      )}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoItem}>
                    <Text style={styles.infoHeading}>
                      {tr("ඉක්මන් ක්‍රියා අවශ්‍ය ඇයි?", "Why early action matters", "ஆரம்ப நடவடிக்கை ஏன் முக்கியம்?")}
                    </Text>
                    <Text style={styles.infoText}>
                      {tr(
                        "Larva බෝල් තුළට විවර වීමට පෙර පාලනය නොකළහොත් බෝල් හානිය වැඩි වන අතර පසුව පාලනය කිරීම අමාරු වේ.",
                        "If larvae are not controlled before boring into bolls, boll damage increases and control becomes difficult later.",
                        "இருவில் boll-க்குள் செல்வதற்கு முன் கட்டுப்படுத்தாவிட்டால் சேதம் அதிகரித்து பின்னர் கட்டுப்படுத்துவது கடினமாகும்."
                      )}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoItem}>
                    <Text style={styles.infoHeading}>
                      {tr("IPM සංකල්පය", "IPM concept", "IPM கருத்து")}
                    </Text>
                    <Text style={styles.infoText}>
                      {tr(
                        "මෙය Integrated Pest Management (IPM) මත පදනම් වේ: යාන්ත්‍රික + ජෛව + සංස්කෘතික ක්‍රම මුල් කරගෙන, අවශ්‍ය වූ විට පමණක් රසායනික උපදේශනය ලබා ගැනීම.",
                        "This follows Integrated Pest Management (IPM): prioritize mechanical, biological, and cultural control, while seeking chemical guidance only when necessary.",
                        "இது ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) முறையை பின்பற்றுகிறது: இயந்திர, உயிரியல் மற்றும் பயிர் மேலாண்மை முறைகளுக்கு முன்னுரிமை கொடுத்து, அவசியமானபோது மட்டுமே இரசாயன ஆலோசனை பெறவும்."
                      )}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoItem}>
                    <Text style={styles.infoHeading}>
                      {tr("රසායනික දැනුවත් කිරීම", "Chemical awareness", "இரசாயன விழிப்புணர்வு")}
                    </Text>
                    <Text style={styles.infoText}>
                      {tr(
                        "අධික රසායනික භාවිතය පරිසරයට හානි කළ හැකි අතර කෘමීන්ට resistance ඇති විය හැක. ඒ නිසා මෙය awareness ලෙස පමණයි.",
                        "Overuse of chemicals can harm the environment and cause pesticide resistance. Therefore, this module provides awareness only.",
                        "அதிக இரசாயன பயன்பாடு சுற்றுச்சூழலுக்கு சேதம் செய்து பூச்சிகளில் எதிர்ப்பு திறன் உருவாகக் கூடும். ஆகவே இது விழிப்புணர்விற்காக மட்டுமே வழங்கப்படுகிறது."
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* IPM Steps */}
            <View style={styles.stepsHeader}>
              <Text style={styles.stepsTitle}>
                {tr("IPM පියවර (Step-by-step)", "IPM Steps (Step-by-step)", "IPM படிகள் (படிப்படியாக)")}
              </Text>
              <Text style={styles.stepsSubtitle}>
                {tr("පියවරෙන් පියවර ක්‍රියාමාර්ග", "Follow these steps sequentially", "இந்த படிகளை வரிசையாக பின்பற்றவும்")}
              </Text>
            </View>

            {preventionSteps.map((step, index) => (
              <View key={step.key} style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepIconContainer}>{step.icon}</View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{localize(step.title)}</Text>
                  <Text style={styles.stepDescription}>
                    {localize(step.description)}
                  </Text>
                  <View style={styles.whyContainer}>
                    <View style={styles.whyBadge}>
                      <Text style={styles.whyBadgeText}>
                        {tr("හේතුව", "Why", "ஏன்")}
                      </Text>
                    </View>
                    <Text style={styles.whyText}>{localize(step.why)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* To-Do Planner Mode */}
        {todoMode && (
          <>
            {/* Todo Header with Progress */}
            <View style={styles.todoHeaderCard}>
              <View style={styles.todoHeaderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todoMainTitle}>
                    {tr("To-Do සැලසුම", "To-Do Planner", "To-Do திட்டம்")}
                  </Text>
                  <Text style={styles.todoMainSubtitle}>
                    {tr("Date දාගෙන Done ලෙස ලකුණු කරන්න", "Assign dates and mark tasks as done", "தேதிகளை சேர்த்து பணிகளை முடித்ததாக குறியிடவும்")}
                  </Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressNumber}>{completedCount}</Text>
                  <Text style={styles.progressTotal}>/{todos.length}</Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${(completedCount / todos.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Time Picker Card */}
            <View style={styles.timePickerCard}>
              <View style={styles.timePickerHeader}>
                <View style={styles.timePickerIconContainer}>
                  <Clock size={20} color="#10ad79" />
                </View>
                <Text style={styles.timePickerLabel}>
                  {tr("Reminder වේලාව", "Reminder Time", "நினைவூட்ட நேரம்")}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.timePickerBtn}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
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

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={addAllTasksToGoogleCalendar}
                activeOpacity={0.8}
              >
                <Calendar size={18} color="#ffffff" />
                <Text style={styles.calendarButtonText}>
                  {tr("Google Calendar", "Add to Calendar", "காலெண்டரில் சேர்க்க")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reminderButton}
                onPress={scheduleAllReminders}
                activeOpacity={0.8}
              >
                <Bell size={18} color="#ffffff" />
                <Text style={styles.reminderButtonText}>
                  {tr("Reminders", "Set Reminders", "நினைவூட்டல்கள் அமைக்க")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reset Button */}
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetTodos}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>
                {tr("Reset To-Do", "Reset To-Do", "To-Do மீட்டமை")}
              </Text>
            </TouchableOpacity>

            {/* Todo Items */}
            {todos.map((todo, index) => (
              <View key={todo.id} style={styles.todoCard}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => toggleDone(todo.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      todo.done && styles.checkboxChecked,
                    ]}
                  >
                    {todo.done && <CheckCircle2 size={20} color="#ffffff" />}
                  </View>
                </TouchableOpacity>

                <View style={styles.todoContent}>
                  <View style={styles.todoHeader}>
                    <Text style={styles.todoIndex}>#{index + 1}</Text>
                    <Text
                      style={[
                        styles.todoTitle,
                        todo.done && styles.todoTitleDone,
                      ]}
                    >
                      {localize(todo.title)}
                    </Text>
                  </View>

                  <Text style={[styles.todoDesc, todo.done && styles.todoDescDone]}>
                    {localize(todo.desc)}
                  </Text>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setPickerTodoId(todo.id)}
                    activeOpacity={0.7}
                  >
                    <Calendar size={14} color="#10ad79" />
                    <Text style={styles.dateButtonText}>
                      {todo.date
                        ? formatDate(todo.date)
                        : tr("දිනය තෝරන්න", "Select date", "தேதி தேர்வு செய்க")}
                    </Text>
                  </TouchableOpacity>

                  {pickerTodoId === todo.id && (
                    <View style={styles.datePickerContainer}>
                      <DateTimePicker
                        value={todo.date || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        onChange={(_, selectedDate) => {
                          if (selectedDate) setTodoDate(todo.id, selectedDate);
                          else setPickerTodoId(null);
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Info Note */}
            <View style={styles.infoNote}>
              <View style={styles.infoNoteHeader}>
                <Info size={16} color="#10ad79" />
                <Text style={styles.infoNoteTitle}>
                  {tr("සටහන", "Note", "குறிப்பு")}
                </Text>
              </View>
              <Text style={styles.infoNoteText}>
                {tr("Calendar එකට add කරන්නේ date දාපු tasks පමණයි. Reminders ඔබ තෝරපු වේලාවට set වෙනවා (date future එකක් නම්).", "Only dated tasks are added to Calendar. Reminders are scheduled at your chosen time (only for future dates).", "தேதி கொடுத்த பணிகளே காலெண்டரில் சேர்க்கப்படும். நினைவூட்டல்கள் நீங்கள் தேர்ந்த நேரத்தில் (எதிர்கால தேதிகளுக்கு மட்டும்) அமைக்கப்படும்.")}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ================= MODERN STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },

  // Header Styles
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },

  // Mode Toggle Styles
  modeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: "#10ad79",
    shadowColor: "#10ad79",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10ad79",
  },
  modeTextActive: {
    color: "#ffffff",
  },

  // Content Styles
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Information Section
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#e8f8f2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  infoContent: {
    marginTop: 20,
  },
  infoItem: {
    marginBottom: 4,
  },
  infoHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10ad79",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },

  // Steps Section
  stepsHeader: {
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  stepsSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },

  // Step Card
  stepCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#10ad79",
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: "#e8f8f2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10ad79",
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#e8f8f2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  stepDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  whyContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  whyBadge: {
    backgroundColor: "#10ad79",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  whyBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  whyText: {
    fontSize: 13,
    color: "#064e3b",
    lineHeight: 20,
  },

  // Todo Header Card
  todoHeaderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todoHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  todoMainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  todoMainSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  progressCircle: {
    width: 64,
    height: 64,
    backgroundColor: "#e8f8f2",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#10ad79",
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#10ad79",
  },
  progressTotal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10ad79",
    borderRadius: 4,
  },

  // Time Picker Card
  timePickerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timePickerIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#e8f8f2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },
  timePickerBtn: {
    backgroundColor: "#e8f8f2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10ad79",
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10ad79",
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  calendarButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  reminderButton: {
    flex: 1,
    backgroundColor: "#10ad79",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#10ad79",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reminderButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  // Reset Button
  resetButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: "flex-start",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  // Todo Card
  todoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#10ad79",
  },
  checkboxContainer: {
    paddingTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: "#10ad79",
    borderColor: "#10ad79",
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  todoIndex: {
    fontSize: 12,
    fontWeight: "800",
    color: "#10ad79",
    backgroundColor: "#e8f8f2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todoTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 22,
  },
  todoTitleDone: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
  todoDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  todoDescDone: {
    textDecorationLine: "line-through",
    color: "#d1d5db",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e8f8f2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#10ad79",
  },
  dateButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10ad79",
  },
  datePickerContainer: {
    marginTop: 12,
  },

  // Info Note
  infoNote: {
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  infoNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoNoteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9a3412",
  },
  infoNoteText: {
    fontSize: 13,
    color: "#7c2d12",
    lineHeight: 20,
  },
});


