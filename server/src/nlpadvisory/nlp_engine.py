"""
Simple keyword-based NLP engine for fertilizer advisory
Supports Sinhala and English
"""
from typing import Dict, List, Tuple
import re


class FertilizerNLPEngine:
    """Lightweight NLP engine using keyword matching"""
    
    def __init__(self):
        # Sinhala keyword mappings
        self.sinhala_keywords = {
            "nitrogen_deficiency": ["කහ", "කහපාට", "කොළ කහ", "කහවෙලා", "කහවුනා"],
            "phosphorus_deficiency": ["දම්", "දම්පාට", "දම්වෙලා", "තද කොළ"],
            "potassium_deficiency": ["දුර්වල", "දුබල", "අඩු වර්ධනය", "මෙඩ"],
            "rain_high": ["වර්ෂාව", "වැස්ස", "වැහි", "වැහි වැඩි", "වර්ෂාව වැඩි"],
            "rain_low": ["වියළි", "වැස්ස නැහැ", "වර්ෂාව අඩු"],
            "soil_dry": ["පස වියළි", "වියළි පස", "පස වියළී"],
            "soil_wet": ["පස තෙත", "තෙත පස", "පස තෙමී"],
            "weak_plants": ["දුර්වල", "දුබල", "බලය නැහැ", "වර්ධනය අඩු"],
            "yellow_leaves": ["කහ කොළ", "කොළ කහ", "කහපාට කොළ"],
            "small_plants": ["පොඩි", "කුඩා", "වර්ධනය අඩු"],
        }
        
        # English keyword mappings
        self.english_keywords = {
            "nitrogen_deficiency": ["yellow", "pale", "yellowing", "chlorosis"],
            "phosphorus_deficiency": ["purple", "dark green", "stunted", "slow growth"],
            "potassium_deficiency": ["weak", "brown edges", "burnt tips", "weak stems"],
            "rain_high": ["rain", "heavy rain", "rainfall", "wet", "flooding"],
            "rain_low": ["dry", "no rain", "drought", "low rainfall"],
            "soil_dry": ["dry soil", "soil dry", "hard soil"],
            "soil_wet": ["wet soil", "waterlogged", "soggy"],
            "weak_plants": ["weak", "weak plants", "poor growth"],
            "yellow_leaves": ["yellow leaves", "pale leaves"],
            "small_plants": ["small", "stunted", "slow growth"],
        }
        
        # Fertilizer recommendations based on detected issues
        self.recommendations = {
            "nitrogen_deficiency": {
                "fertilizer": "Urea",
                "amount_per_acre": "50-60 kg",
                "npk": "N",
                "timing": "Apply in split doses",
                "si": "යුරියා",
                "si_amount": "අක්කරයකට කිලෝ 50-60",
            },
            "phosphorus_deficiency": {
                "fertilizer": "TSP (Triple Super Phosphate)",
                "amount_per_acre": "30-40 kg",
                "npk": "P",
                "timing": "Apply at planting",
                "si": "ටී.එස්.පී",
                "si_amount": "අක්කරයකට කිලෝ 30-40",
            },
            "potassium_deficiency": {
                "fertilizer": "MOP (Muriate of Potash)",
                "amount_per_acre": "40-50 kg",
                "npk": "K",
                "timing": "Apply during vegetative stage",
                "si": "එම්.ඕ.පී",
                "si_amount": "අක්කරයකට කිලෝ 40-50",
            },
        }
    
    def detect_language(self, text: str) -> str:
        """Detect if text is Sinhala or English"""
        sinhala_chars = re.findall(r'[\u0D80-\u0DFF]', text)
        return "si" if len(sinhala_chars) > 5 else "en"
    
    def extract_issues(self, text: str, language: str) -> Dict[str, bool]:
        """Extract agricultural issues from text using keyword matching"""
        text_lower = text.lower()
        issues = {}
        
        keywords = self.sinhala_keywords if language == "si" else self.english_keywords
        
        for issue_type, keywords_list in keywords.items():
            issues[issue_type] = any(keyword in text_lower for keyword in keywords_list)
        
        return issues
    
    def generate_recommendations(
        self, issues: Dict[str, bool], language: str
    ) -> Dict:
        """Generate fertilizer recommendations based on detected issues"""
        recommendations = []
        warnings = []
        
        # Check for nutrient deficiencies
        if issues.get("nitrogen_deficiency") or issues.get("yellow_leaves"):
            rec = self.recommendations["nitrogen_deficiency"]
            recommendations.append({
                "type": "nitrogen",
                "fertilizer": rec["si"] if language == "si" else rec["fertilizer"],
                "amount": rec["si_amount"] if language == "si" else rec["amount_per_acre"],
                "timing": rec["timing"],
                "priority": "high"
            })
        
        if issues.get("phosphorus_deficiency"):
            rec = self.recommendations["phosphorus_deficiency"]
            recommendations.append({
                "type": "phosphorus",
                "fertilizer": rec["si"] if language == "si" else rec["fertilizer"],
                "amount": rec["si_amount"] if language == "si" else rec["amount_per_acre"],
                "timing": rec["timing"],
                "priority": "medium"
            })
        
        if issues.get("potassium_deficiency") or issues.get("weak_plants"):
            rec = self.recommendations["potassium_deficiency"]
            recommendations.append({
                "type": "potassium",
                "fertilizer": rec["si"] if language == "si" else rec["fertilizer"],
                "amount": rec["si_amount"] if language == "si" else rec["amount_per_acre"],
                "timing": rec["timing"],
                "priority": "medium"
            })
        
        # Weather-based warnings
        if issues.get("rain_high"):
            warnings.append({
                "type": "rain_delay",
                "severity": "high",
                "message_en": "Heavy rain detected. Delay fertilizer application to avoid nutrient loss.",
                "message_si": "අධික වර්ෂාපතනයක් හඳුනාගෙන ඇත. පෝෂක අහිමි වීම වැළැක්වීමට පොහොර යෙදීම ප්‍රමාද කරන්න."
            })
        
        if issues.get("soil_dry"):
            warnings.append({
                "type": "split_application",
                "severity": "medium",
                "message_en": "Dry soil detected. Consider split application and water after fertilizing.",
                "message_si": "වියළි පස හඳුනාගෙන ඇත. බෙදා යෙදීම සලකා බලන්න සහ පොහොර දැමීමෙන් පසු ජලය දෙන්න."
            })
        
        # Apply today decision
        apply_today = not issues.get("rain_high")
        
        return {
            "recommendations": recommendations,
            "warnings": warnings,
            "apply_today": apply_today,
            "detected_issues": [k for k, v in issues.items() if v]
        }
    
    def process_farmer_input(self, text: str) -> Dict:
        """Main processing function"""
        # Detect language
        language = self.detect_language(text)
        
        # Extract issues
        issues = self.extract_issues(text, language)
        
        # Generate recommendations
        result = self.generate_recommendations(issues, language)
        result["language"] = language
        result["input_text"] = text
        
        # Generate natural language advice
        advice = self._generate_advice(result, language)
        result["advice"] = advice
        
        return result
    
    def _generate_advice(self, result: Dict, language: str) -> str:
        """Generate human-friendly advice text"""
        recommendations = result["recommendations"]
        warnings = result["warnings"]
        
        if language == "si":
            if not recommendations:
                return "ඔබගේ වගාව සෞඛ්‍ය සම්පන්න බව පෙනේ. නිත්‍ය නිරීක්ෂණය දිගටම කරගෙන යන්න."
            
            advice_parts = ["ඔබගේ වගාව සඳහා පහත නිර්දේශ:"]
            
            for rec in recommendations:
                advice_parts.append(
                    f"\n• {rec['fertilizer']} - {rec['amount']} ({rec['timing']})"
                )
            
            if warnings:
                advice_parts.append("\n\n⚠️ අවවාද:")
                for warn in warnings:
                    advice_parts.append(f"\n• {warn['message_si']}")
            
            if result["apply_today"]:
                advice_parts.append("\n\n✅ අද පොහොර යෙදීම සුදුසුයි.")
            else:
                advice_parts.append("\n\n❌ අද පොහොර යෙදීම නිර්දේශ නොකරයි.")
            
            return "".join(advice_parts)
        else:
            if not recommendations:
                return "Your crop appears healthy. Continue regular monitoring."
            
            advice_parts = ["Recommendations for your crop:"]
            
            for rec in recommendations:
                advice_parts.append(
                    f"\n• {rec['fertilizer']} - {rec['amount']} ({rec['timing']})"
                )
            
            if warnings:
                advice_parts.append("\n\n⚠️ Warnings:")
                for warn in warnings:
                    advice_parts.append(f"\n• {warn['message_en']}")
            
            if result["apply_today"]:
                advice_parts.append("\n\n✅ Safe to apply fertilizer today.")
            else:
                advice_parts.append("\n\n❌ Not recommended to apply fertilizer today.")
            
            return "".join(advice_parts)
