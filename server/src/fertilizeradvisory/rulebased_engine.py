"""
Improved keyword-based rule engine for fertilizer advisory
- Supports Sinhala and English
- Single Source of Truth (backend)
- Handles overlaps with scoring + priority
"""

from typing import Dict, List, Tuple, Optional
import re

class FertilizerRuleBasedEngine:
    def __init__(self):
        # -----------------------
        # Keyword lexicons
        # -----------------------
        # Keep these focused to reduce false positives.
        # Avoid super-generic words that match everything.
        self.sinhala_keywords = {
            # nutrient deficiency signals
            "yellow_leaves": ["කොළ කහ", "කහ කොළ", "කහපාට කොළ", "කොළ කහයි", "කහවෙලා"],
            "pale_leaves": ["පැහැති", "වර්ණ අඩු", "වර්ණය අඩු"],
            "purple_leaves": ["දම්", "දම්පාට", "දම්වෙලා"],
            "edge_burn": ["කොළ අග පිළිස්ස", "කොළ අග දහන", "කොළ අග වියළ"],
            "weak_plants": ["පැළ දුර්වල", "ශාක දුර්වල", "දුර්වලයි", "දුබලයි"],
            "stunted_growth": ["වර්ධනය අඩු", "වර්ධනය නෑ", "පොඩි පැළ", "කුඩා පැළ"],

            # weather/soil signals
            "rain_high": ["වැහි වැඩි", "වර්ෂාව වැඩි", "අධික වර්ෂාව", "ගංවතුර", "ජලයෙන් පිරී"],
            "rain_low": ["වැස්ස අඩු", "වැස්ස නැහැ", "වර්ෂාව අඩු", "වියළි කාලය"],
            "soil_dry": ["වියලි පස", "පස වියළි", "බිම වියලි", "වියළි පස"],
            "soil_wet": ["පස තෙත", "තෙත පස", "පස තෙමී", "ජලයෙන් පිරුණු පස"],
        }

        self.english_keywords = {
            # nutrient deficiency signals
            "yellow_leaves": ["yellow leaves", "yellowing leaves", "leaves yellow", "chlorosis"],
            "pale_leaves": ["pale leaves", "light green leaves", "loss of greenness"],
            "purple_leaves": ["purple leaves", "purple", "dark green with purple"],
            "edge_burn": ["leaf tips burning", "burnt tips", "brown edges", "leaf edge burn"],
            "weak_plants": ["plants weak", "weak plants", "weak stem", "weak"],
            "stunted_growth": ["stunted", "slow growth", "small plants", "poor growth"],

            # weather/soil signals
            "rain_high": ["heavy rain", "flooding", "waterlogged", "too much rain"],
            "rain_low": ["dry", "no rain", "drought", "low rainfall"],
            "soil_dry": ["dry soil", "soil is dry", "hard soil"],
            "soil_wet": ["wet soil", "waterlogged soil", "soggy soil"],
        }

        # -----------------------
        # Fertilizer recommendations (farmer-friendly)
        # -----------------------
        self.recommendation_templates = {
            "nitrogen": {
                "en": {"fertilizer": "Urea", "amount": "50-60 kg per acre", "timing": "Apply in split doses"},
                "si": {"fertilizer": "යුරියා", "amount": "අක්කරයකට කිලෝ 50-60", "timing": "කොටස් වශයෙන් යොදන්න"},
                "priority": "high",
                "reason_en": "Helps recover leaf greenness and vegetative growth",
                "reason_si": "කොළ වල හරිත වර්ණය සහ ශාක වර්ධනය නැවත සකස් කරයි",
            },
            "phosphorus": {
                "en": {"fertilizer": "TSP (Triple Super Phosphate)", "amount": "30-40 kg per acre", "timing": "Prefer at planting or early stage"},
                "si": {"fertilizer": "ටී.එස්.පී", "amount": "අක්කරයකට කිලෝ 30-40", "timing": "රෝපණ අවධියේ/මුල් අවධියේදී වඩාත් සුදුසුයි"},
                "priority": "medium",
                "reason_en": "Supports roots and early establishment",
                "reason_si": "මුල් ශක්තිමත් කරයි සහ මුල් වර්ධනයට උදව් කරයි",
            },
            "potassium": {
                "en": {"fertilizer": "MOP (Muriate of Potash)", "amount": "40-50 kg per acre", "timing": "Apply during vegetative stage"},
                "si": {"fertilizer": "එම්.ඕ.පී", "amount": "අක්කරයකට කිලෝ 40-50", "timing": "ශාක වර්ධන අවධියේදී යොදන්න"},
                "priority": "medium",
                "reason_en": "Improves plant strength and reduces edge burn risk",
                "reason_si": "ශාක ශක්තිමත් කරයි සහ කොළ අග පිළිස්සීම අඩු කරයි",
            },
        }

    # -----------------------
    # Language
    # -----------------------
    def detect_language(self, text: str) -> str:
        sinhala_chars = re.findall(r"[\u0D80-\u0DFF]", text)
        return "si" if len(sinhala_chars) > 5 else "en"

    # -----------------------
    # Match keywords -> signals
    # -----------------------
    def _match_signals(self, text: str, language: str) -> Dict[str, bool]:
        tl = text.lower()
        lex = self.sinhala_keywords if language == "si" else self.english_keywords
        out: Dict[str, bool] = {}
        for signal, kws in lex.items():
            out[signal] = any(kw.lower() in tl for kw in kws)
        return out

    # -----------------------
    # Score + Decide issues
    # -----------------------
    def _score_deficiencies(self, signals: Dict[str, bool]) -> Dict[str, int]:
        """
        Map signals into deficiency scores with simple weights
        This reduces overlap issues (Root Cause #3).
        """
        score = {"nitrogen": 0, "phosphorus": 0, "potassium": 0}

        # Nitrogen
        if signals.get("yellow_leaves"):
            score["nitrogen"] += 3
        if signals.get("pale_leaves"):
            score["nitrogen"] += 2
        if signals.get("stunted_growth"):
            score["nitrogen"] += 1

        # Phosphorus
        if signals.get("purple_leaves"):
            score["phosphorus"] += 3
        if signals.get("stunted_growth"):
            score["phosphorus"] += 2

        # Potassium
        if signals.get("edge_burn"):
            score["potassium"] += 3
        if signals.get("weak_plants"):
            score["potassium"] += 2

        return score

    def _pick_primary_deficiency(self, scores: Dict[str, int]) -> Optional[str]:
        best = max(scores.items(), key=lambda x: x[1])
        if best[1] <= 0:
            return None
        return best[0]

    # -----------------------
    # Build response fields
    # -----------------------
    def _build_warnings(self, signals: Dict[str, bool]) -> Tuple[List[dict], bool]:
        warnings: List[dict] = []
        apply_today = True

        if signals.get("rain_high") or signals.get("soil_wet"):
            apply_today = False
            warnings.append(
                {
                    "type": "rain_delay",
                    "severity": "high",
                    "message_en": "Heavy rain / waterlogged soil detected. Delay fertilizer application to avoid nutrient loss.",
                    "message_si": "අධික වැසි / ජලයෙන් පිරුණු පස හඳුනාගෙන ඇත. පෝෂක අහිමි වීම වැළැක්වීමට පොහොර යෙදීම ප්‍රමාද කරන්න.",
                }
            )

        if signals.get("soil_dry") or signals.get("rain_low"):
            warnings.append(
                {
                    "type": "dry_soil",
                    "severity": "medium",
                    "message_en": "Dry conditions detected. Consider split application and water after fertilizing.",
                    "message_si": "වියළි තත්ත්ව හඳුනාගෙන ඇත. පොහොර කොටස් වශයෙන් යෙදීම සලකා බලන්න සහ පොහොර දැමීමෙන් පසු ජලය දෙන්න.",
                }
            )

        return warnings, apply_today

    def _build_reasoning(self, language: str, primary: Optional[str], signals: Dict[str, bool]) -> Dict[str, Optional[str]]:
        if not primary and not any(signals.values()):
            return {"observation": None, "cause": None, "reasoning": None}

        # Observation
        obs_parts_si = []
        obs_parts_en = []
        if signals.get("yellow_leaves") or signals.get("pale_leaves"):
            obs_parts_si.append("කොළ කහ/පැහැති වීම")
            obs_parts_en.append("yellow/pale leaves")
        if signals.get("edge_burn"):
            obs_parts_si.append("කොළ අග පිළිස්සීම/වියළීම")
            obs_parts_en.append("leaf tip/edge burn")
        if signals.get("weak_plants"):
            obs_parts_si.append("පැළ දුර්වල වීම")
            obs_parts_en.append("weak plants")
        if signals.get("stunted_growth"):
            obs_parts_si.append("වර්ධනය අඩු වීම")
            obs_parts_en.append("stunted/slow growth")
        if signals.get("rain_high"):
            obs_parts_si.append("අධික වැසි")
            obs_parts_en.append("heavy rain")
        if signals.get("soil_dry"):
            obs_parts_si.append("වියලි පස")
            obs_parts_en.append("dry soil")

        observation = (
            ("ඔබ විස්තර කළ ලක්ෂණ: " + ", ".join(obs_parts_si)) if language == "si" else ("Symptoms described: " + ", ".join(obs_parts_en))
        )

        # Cause
        if not primary:
            cause = "—" if language == "si" else "—"
        else:
            if language == "si":
                cause_map = {
                    "nitrogen": "නයිට්‍රජන් (N) ඌනතාවය නිසා කොළ කහ/පැහැති විය හැක.",
                    "phosphorus": "පොස්පරස් (P) ඌනතාවය නිසා මුල්/මුල් වර්ධනය සහ වර්ධනය අඩු විය හැක.",
                    "potassium": "පොටෑසියම් (K) ඌනතාවය නිසා කොළ අග පිළිස්සීම සහ ශාක දුර්වල වීම විය හැක.",
                }
            else:
                cause_map = {
                    "nitrogen": "Nitrogen (N) deficiency can cause yellow/pale leaves.",
                    "phosphorus": "Phosphorus (P) deficiency can reduce early growth and root development.",
                    "potassium": "Potassium (K) deficiency can cause edge burn and weak plants.",
                }
            cause = cause_map.get(primary, "—")

        reasoning = (
            "DOA සහ CIC නිල උපදෙස් අනුව, හඳුනාගත් ලක්ෂණ වලට ගැළපෙන පොහොර අනුපිළිවෙලක් යෝජනා කර ඇත."
            if language == "si"
            else "Based on DOA & CIC guidance, a suitable fertilizer plan is suggested for the detected symptoms."
        )

        return {"observation": observation, "cause": cause, "reasoning": reasoning}

    def _build_advice_text(self, language: str, recommendations: List[dict], warnings: List[dict], apply_today: bool) -> str:
        if language == "si":
            if not recommendations:
                base = "දැනට ප්‍රධාන පොහොර ඌනතාවයක් පැහැදිලි ලෙස හඳුනාගත නොහැක. නිරීක්ෂණය දිගටම කරගෙන යන්න."
            else:
                base = "ඔබගේ වගාව සඳහා නිර්දේශ:"
            lines = [base]
            for r in recommendations:
                lines.append(f"• {r['fertilizer']} - {r['amount']} ({r['timing']})")

            if warnings:
                lines.append("⚠️ අවවාද:")
                for w in warnings:
                    lines.append(f"• {w['message_si']}")

            lines.append("✅ අද පොහොර යෙදීම සුදුසුයි." if apply_today else "❌ අද පොහොර යෙදීම නිර්දේශ නොකරයි.")
            return "\n".join(lines)

        # EN
        if not recommendations:
            base = "No major fertilizer deficiency clearly detected. Continue monitoring."
        else:
            base = "Recommendations for your crop:"
        lines = [base]
        for r in recommendations:
            lines.append(f"• {r['fertilizer']} - {r['amount']} ({r['timing']})")

        if warnings:
            lines.append("⚠️ Warnings:")
            for w in warnings:
                lines.append(f"• {w['message_en']}")

        lines.append("✅ Safe to apply fertilizer today." if apply_today else "❌ Not recommended to apply fertilizer today.")
        return "\n".join(lines)

    # -----------------------
    # Public entry
    # -----------------------
    def process_farmer_input(self, text: str, language: Optional[str] = None) -> Dict:
        # Language = explicit > fallback detection (Root Cause #4 fix)
        lang = language if language in ("si", "en") else self.detect_language(text)

        signals = self._match_signals(text, lang)
        scores = self._score_deficiencies(signals)
        primary = self._pick_primary_deficiency(scores)

        recommendations: List[dict] = []
        detected_issues: List[str] = []

        if primary:
            tpl = self.recommendation_templates[primary]
            recommendations.append(
                {
                    "type": primary,
                    "fertilizer": tpl[lang]["fertilizer"],
                    "amount": tpl[lang]["amount"],
                    "timing": tpl[lang]["timing"],
                    "priority": tpl["priority"],
                    "reason": tpl["reason_si"] if lang == "si" else tpl["reason_en"],
                }
            )
            detected_issues.append(f"{primary}_deficiency")

        # Weather/soil warnings + apply_today gate
        warnings, apply_today = self._build_warnings(signals)

        # WHY fields
        why = self._build_reasoning(lang, primary, signals)

        advice = self._build_advice_text(lang, recommendations, warnings, apply_today)

        # # Add detected environment issues (for transparency)
            # if signals.get("rain_high"):
            #     detected_issues.append("rain_high")
            # if signals.get("soil_dry"):
            #     detected_issues.append("soil_dry")
            # if signals.get("soil_wet"):
            #     detected_issues.append("soil_wet")
            # if signals.get("rain_low"):
            #     detected_issues.append("rain_low")

        # Note:
        # Environment signals are intentionally NOT added to detected_issues
        # for farmer responses to avoid confusion.
        # (They are still reflected via warnings & apply_today flag.)

        return {
            "language": lang,
            "input_text": text,
            "advice": advice,
            "recommendations": recommendations,
            "warnings": warnings,
            "apply_today": apply_today,
            "detected_issues": detected_issues,
            "observation": why.get("observation"),
            "cause": why.get("cause"),
            "reasoning": why.get("reasoning"),
        }
