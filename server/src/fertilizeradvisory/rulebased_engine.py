"""
Improved keyword-based rule engine for fertilizer advisory
- Supports Sinhala and English
- Single Source of Truth (backend)
- Handles overlaps with scoring + priority
- Context-aware: considers growth stage and planting days
"""

from typing import Dict, List, Tuple, Optional
import re
from datetime import datetime, date

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
    # Calculate days after planting
    # -----------------------
    def _calculate_days_after_planting(self, planting_date_str: Optional[str]) -> Optional[int]:
        """
        Calculate days since planting from YYYY-MM-DD string
        Returns None if invalid or missing
        """
        if not planting_date_str:
            return None
        
        try:
            planting_date = datetime.strptime(planting_date_str, "%Y-%m-%d").date()
            today = date.today()
            days_diff = (today - planting_date).days
            return days_diff if days_diff >= 0 else None
        except (ValueError, TypeError):
            return None

    # -----------------------
    # Determine growth stage from days
    # -----------------------
    def _get_growth_stage_from_days(self, days: Optional[int]) -> Optional[str]:
        """
        Map days after planting to growth stage ID
        Based on DOA guidelines and cornKnowledgeBase.ts
        """
        if days is None:
            return None
        
        if days < 0:
            return "future"
        elif days <= 10:
            return "seedling"  # Days 0-10: Seedling stage
        elif days <= 25:
            return "early_vegetative"  # Days 10-25: Early vegetative
        elif days <= 52:
            return "vegetative"  # Days 25-52: Vegetative/knee-height
        elif days <= 75:
            return "flowering"  # Days 52-75: Tasseling/flowering
        elif days <= 110:
            return "grain_filling"  # Days 75-110: Grain filling
        else:
            return "maturity"  # Days 110+: Maturity/harvest

    # -----------------------
    # Score + Decide issues (CONTEXT-AWARE)
    # -----------------------
    def _score_deficiencies(self, signals: Dict[str, bool], days_after_planting: Optional[int] = None) -> Dict[str, int]:
        """
        Map signals into deficiency scores with context-aware weights
        Growth stage influences nutrient priority:
        - Days 0-10 (Seedling): P > K > N (roots priority)
        - Days 10-25 (Early Veg): N = P > K (balanced growth)
        - Days 25-52 (Vegetative): N > K > P (leaf growth critical)
        - Days 52-75 (Flowering): N > K > P (last N window, K for strength)
        - Days 75+ (Grain Filling): K > N (no more N needed)
        """
        score = {"nitrogen": 0, "phosphorus": 0, "potassium": 0}
        
        # Determine growth stage
        stage = self._get_growth_stage_from_days(days_after_planting)

        # Base scoring from symptoms
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

        # CONTEXT-AWARE ADJUSTMENTS based on growth stage
        # Applies to ALL detected symptoms, not just yellow leaves
        has_any_symptom = any([
            signals.get("yellow_leaves"), signals.get("pale_leaves"), 
            signals.get("purple_leaves"), signals.get("edge_burn"),
            signals.get("weak_plants"), signals.get("stunted_growth")
        ])
        
        if stage == "seedling":  # Days 0-10
            # At seedling stage, root development is priority
            # Any symptom at this stage → recommend Phosphorus for roots
            if has_any_symptom:
                score["phosphorus"] = max(score["phosphorus"], 3)
            # Phosphorus is critical for root establishment
            score["phosphorus"] = int(score["phosphorus"] * 1.5)
            # Nitrogen/Potassium deficiency symptoms are often NORMAL at this stage
            score["nitrogen"] = int(score["nitrogen"] * 0.3)
            score["potassium"] = int(score["potassium"] * 0.5)
            
        elif stage == "early_vegetative":  # Days 10-25
            # Balanced growth - all nutrients important
            # If any symptom detected, ensure a recommendation is made
            if has_any_symptom:
                # Boost the highest scoring nutrient to ensure recommendation
                max_nutrient = max(score, key=score.get)
                score[max_nutrient] = max(score[max_nutrient], 2)
            score["nitrogen"] = int(score["nitrogen"] * 1.2)
            score["phosphorus"] = int(score["phosphorus"] * 1.1)
            score["potassium"] = int(score["potassium"] * 1.0)
            
        elif stage == "vegetative":  # Days 25-52
            # CRITICAL NITROGEN WINDOW - Top Dress 1 timing
            # If any symptom detected, ensure a recommendation
            if has_any_symptom:
                max_nutrient = max(score, key=score.get)
                score[max_nutrient] = max(score[max_nutrient], 2)
            score["nitrogen"] = int(score["nitrogen"] * 1.8)
            score["potassium"] = int(score["potassium"] * 1.2)
            score["phosphorus"] = int(score["phosphorus"] * 0.7)
            
        elif stage == "flowering":  # Days 52-75
            # LAST NITROGEN WINDOW - Top Dress 2 timing
            if has_any_symptom:
                max_nutrient = max(score, key=score.get)
                score[max_nutrient] = max(score[max_nutrient], 2)
            score["nitrogen"] = int(score["nitrogen"] * 1.6)
            score["potassium"] = int(score["potassium"] * 1.4)
            score["phosphorus"] = int(score["phosphorus"] * 0.5)
            
        elif stage == "grain_filling":  # Days 75-110
            # TOO LATE for nitrogen - focus on K only
            if has_any_symptom:
                # Only potassium can help at this stage
                score["potassium"] = max(score["potassium"], 2)
            score["nitrogen"] = int(score["nitrogen"] * 0.2)
            score["potassium"] = int(score["potassium"] * 1.5)
            score["phosphorus"] = int(score["phosphorus"] * 0.3)
            
        elif stage == "maturity":  # Days 110+
            # Harvest time - no fertilizer needed regardless of symptoms
            score["nitrogen"] = 0
            score["phosphorus"] = 0
            score["potassium"] = 0

        return score

    def _pick_primary_deficiency(self, scores: Dict[str, int]) -> Optional[str]:
        best = max(scores.items(), key=lambda x: x[1])
        if best[1] <= 0:
            return None
        return best[0]

    # -----------------------
    # Build response fields
    # -----------------------
    def _build_warnings(self, signals: Dict[str, bool], days_after_planting: Optional[int] = None, rainfall_condition: Optional[str] = None, soil_condition: Optional[str] = None) -> Tuple[List[dict], bool]:
        warnings: List[dict] = []
        apply_today = True
        stage = self._get_growth_stage_from_days(days_after_planting)

        # Weather/soil warnings - dropdown selections take priority, mutually exclusive
        has_wet_conditions = False
        has_dry_conditions = False
        detected_conditions = []  # Track what was actually detected
        
        # Priority 1: Check dropdown selections (user's explicit choice)
        if rainfall_condition == "high":
            has_wet_conditions = True
            detected_conditions.append("heavy_rain")
        elif rainfall_condition == "low":
            has_dry_conditions = True
            detected_conditions.append("low_rain")
            
        if soil_condition == "wet":
            has_wet_conditions = True
            detected_conditions.append("wet_soil")
        elif soil_condition == "dry":
            has_dry_conditions = True
            detected_conditions.append("dry_soil")
        
        # Priority 2: Check text-based signals only if no dropdown selection made
        if not rainfall_condition and not soil_condition:
            if signals.get("rain_high") or signals.get("soil_wet"):
                has_wet_conditions = True
                if signals.get("rain_high"):
                    detected_conditions.append("heavy_rain")
                if signals.get("soil_wet"):
                    detected_conditions.append("wet_soil")
            elif signals.get("soil_dry") or signals.get("rain_low"):
                has_dry_conditions = True
                if signals.get("rain_low"):
                    detected_conditions.append("low_rain")
                if signals.get("soil_dry"):
                    detected_conditions.append("dry_soil")
        
        # Build warning messages based on what was actually detected (mutually exclusive)
        if has_wet_conditions:
            apply_today = False
            # Build specific message based on detected conditions
            if "heavy_rain" in detected_conditions and "wet_soil" in detected_conditions:
                msg_en = "Heavy rain / waterlogged soil detected. Delay fertilizer application to avoid nutrient loss."
                msg_si = "අධික වැසි / ජලයෙන් පිරුණු පස හඳුනාගෙන ඇත. පෝෂක අහිමි වීම වැළැක්වීමට පොහොර යෙදීම ප්‍රමාද කරන්න."
            elif "heavy_rain" in detected_conditions:
                msg_en = "Heavy rain detected. Delay fertilizer application to avoid nutrient loss."
                msg_si = "අධික වැසි හඳුනාගෙන ඇත. පෝෂක අහිමි වීම වැළැක්වීමට පොහොර යෙදීම ප්‍රමාද කරන්න."
            else:  # wet_soil only
                msg_en = "Waterlogged soil detected. Delay fertilizer application to avoid nutrient loss."
                msg_si = "ජලයෙන් පිරුණු පස හඳුනාගෙන ඇත. පෝෂක අහිමි වීම වැළැක්වීමට පොහොර යෙදීම ප්‍රමාද කරන්න."
            
            warnings.append(
                {
                    "type": "rain_delay",
                    "severity": "high",
                    "message_en": msg_en,
                    "message_si": msg_si,
                }
            )
        elif has_dry_conditions:
            # Build specific message based on detected conditions
            if "low_rain" in detected_conditions and "dry_soil" in detected_conditions:
                msg_en = "Dry conditions detected. Consider split application and water after fertilizing."
                msg_si = "වියළි තත්ත්ව හඳුනාගෙන ඇත. පොහොර කොටස් වශයෙන් යෙදීම සලකා බලන්න සහ පොහොර දැමීමෙන් පසු ජලය දෙන්න."
            elif "low_rain" in detected_conditions:
                msg_en = "Low rainfall detected. Consider split application and water after fertilizing."
                msg_si = "අඩු වර්ෂාපතනය හඳුනාගෙන ඇත. පොහොර කොටස් වශයෙන් යෙදීම සලකා බලන්න සහ පොහොර දැමීමෙන් පසු ජලය දෙන්න."
            else:  # dry_soil only
                msg_en = "Dry soil detected. Consider split application and water after fertilizing."
                msg_si = "වියළි පස හඳුනාගෙන ඇත. පොහොර කොටස් වශයෙන් යෙදීම සලකා බලන්න සහ පොහොර දැමීමෙන් පසු ජලය දෙන්න."
            
            warnings.append(
                {
                    "type": "dry_soil",
                    "severity": "medium",
                    "message_en": msg_en,
                    "message_si": msg_si,
                }
            )

        # Growth stage warnings
        if stage == "maturity":
            apply_today = False
            warnings.append(
                {
                    "type": "too_late",
                    "severity": "high",
                    "message_en": "Crop is at maturity/harvest stage (110+ days). Fertilizer application is no longer beneficial.",
                    "message_si": "වගාව අස්වනු අවධියේ (දින 110+). පොහොර යෙදීම තවදුරටත් ප්‍රයෝජනවත් නොවේ.",
                }
            )
        elif stage == "grain_filling":
            warnings.append(
                {
                    "type": "late_stage",
                    "severity": "medium",
                    "message_en": "Crop is in grain filling stage (75-110 days). Nitrogen application is too late. Only Potassium may help.",
                    "message_si": "වගාව ධාන්‍ය පිරවීමේ අවධියේ (දින 75-110). නයිට්‍රජන් යෙදීම ප්‍රමාද වී ඇත. පොටෑසියම් පමණක් උපකාර විය හැක.",
                }
            )
        elif stage == "seedling":
            warnings.append(
                {
                    "type": "early_stage",
                    "severity": "low",
                    "message_en": "Crop is in early seedling stage (0-10 days). Some yellowing is normal. Focus on root development (Phosphorus).",
                    "message_si": "වගාව මුල් අවධියේ (දින 0-10). යම් කහ පැහැයක් සාමාන්‍යයි. මුල් වර්ධනය කෙරෙහි අවධානය යොමු කරන්න (පොස්පරස්).",
                }
            )

        return warnings, apply_today

    def _build_reasoning(self, language: str, primary: Optional[str], signals: Dict[str, bool], days_after_planting: Optional[int] = None) -> Dict[str, Optional[str]]:
        if not primary and not any(signals.values()):
            return {"observation": None, "cause": None, "reasoning": None}
        
        stage = self._get_growth_stage_from_days(days_after_planting)
        stage_context = ""

        # Observation - include ALL detected signals
        obs_parts_si = []
        obs_parts_en = []
        if signals.get("yellow_leaves") or signals.get("pale_leaves"):
            obs_parts_si.append("කොළ කහ/පැහැති වීම")
            obs_parts_en.append("yellow/pale leaves")
        if signals.get("purple_leaves"):
            obs_parts_si.append("දම් පාට කොළ")
            obs_parts_en.append("purple leaves")
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
        if signals.get("rain_low"):
            obs_parts_si.append("වැස්ස අඩු")
            obs_parts_en.append("low rainfall")
        if signals.get("soil_dry"):
            obs_parts_si.append("වියලි පස")
            obs_parts_en.append("dry soil")
        if signals.get("soil_wet"):
            obs_parts_si.append("තෙත්/ජලයෙන් පිරුණු පස")
            obs_parts_en.append("wet/waterlogged soil")

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

        # Add growth stage context to reasoning
        if stage and days_after_planting is not None:
            if language == "si":
                stage_map = {
                    "seedling": f"වගාව මුල් අවධියේ (දින {days_after_planting}). මුල් වර්ධනය ප්‍රමුඛතාවයයි.",
                    "early_vegetative": f"වගාව මුල් ශාක වර්ධන අවධියේ (දින {days_after_planting}). සමබර පෝෂක සැපයුම වැදගත්.",
                    "vegetative": f"වගාව ශාක වර්ධන අවධියේ (දින {days_after_planting}). නයිට්‍රජන් ඉතා වැදගත් කාලයයි.",
                    "flowering": f"වගාව මල් පිපීමේ අවධියේ (දින {days_after_planting}). නයිට්‍රජන් සඳහා අවසාන කාලයයි.",
                    "grain_filling": f"වගාව ධාන්‍ය පිරවීමේ අවධියේ (දින {days_after_planting}). නයිට්‍රජන් සඳහා ප්‍රමාද වී ඇත.",
                    "maturity": f"වගාව අස්වනු අවධියේ (දින {days_after_planting}). පොහොර අවශ්‍ය නැත.",
                }
                stage_context = stage_map.get(stage, "")
            else:
                stage_map = {
                    "seedling": f"Crop is in seedling stage (Day {days_after_planting}). Root development is priority.",
                    "early_vegetative": f"Crop is in early vegetative stage (Day {days_after_planting}). Balanced nutrients important.",
                    "vegetative": f"Crop is in vegetative stage (Day {days_after_planting}). Critical nitrogen window.",
                    "flowering": f"Crop is in flowering stage (Day {days_after_planting}). Last window for nitrogen.",
                    "grain_filling": f"Crop is in grain filling stage (Day {days_after_planting}). Too late for nitrogen.",
                    "maturity": f"Crop is at maturity (Day {days_after_planting}). No fertilizer needed.",
                }
                stage_context = stage_map.get(stage, "")
        
        base_reasoning = (
            "DOA සහ CIC නිල උපදෙස් අනුව, හඳුනාගත් ලක්ෂණ වලට ගැළපෙන පොහොර අනුපිළිවෙලක් යෝජනා කර ඇත."
            if language == "si"
            else "Based on DOA & CIC guidance, a suitable fertilizer plan is suggested for the detected symptoms."
        )
        
        reasoning = f"{stage_context} {base_reasoning}" if stage_context else base_reasoning

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
    def process_farmer_input(
        self, 
        text: str, 
        language: Optional[str] = None,
        planting_date: Optional[str] = None,
        planting_stage: Optional[str] = None,
        rainfall_condition: Optional[str] = None,
        soil_condition: Optional[str] = None
    ) -> Dict:
        # Language = explicit > fallback detection (Root Cause #4 fix)
        lang = language if language in ("si", "en") else self.detect_language(text)
        
        # Calculate days after planting for context-aware scoring
        days_after_planting = self._calculate_days_after_planting(planting_date)

        signals = self._match_signals(text, lang)
        scores = self._score_deficiencies(signals, days_after_planting)
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

        # Weather/soil warnings + apply_today gate (context-aware)
        warnings, apply_today = self._build_warnings(signals, days_after_planting, rainfall_condition, soil_condition)

        # WHY fields (context-aware)
        why = self._build_reasoning(lang, primary, signals, days_after_planting)

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
