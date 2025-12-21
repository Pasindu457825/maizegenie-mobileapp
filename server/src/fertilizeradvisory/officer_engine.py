"""
Officer-specific rule-based engine for fertilizer advisory
Provides structured analysis with detailed recommendations
"""
from typing import Dict, List
from .rulebased_engine import FertilizerRuleBasedEngine


class OfficerAdvisoryEngine:
    """Enhanced rule-based engine for agricultural officers with structured inputs"""
    
    def __init__(self):
        self.base_engine = FertilizerRuleBasedEngine()
        
        # Fertilizer recommendations by growth stage and soil type
        self.stage_fertilizers = {
            "land_prep": {
                "primary": "MP Basal",
                "npk": "6-17-10++",
                "amount_per_acre": "50 kg",
                "timing": "Before planting",
                "si": "MP බේසල් පොහොර"
            },
            "planting": {
                "primary": "MP Basal",
                "npk": "6-17-10++",
                "amount_per_acre": "50 kg",
                "timing": "At planting",
                "si": "MP බේසල් පොහොර"
            },
            "early_growth": {
                "primary": "CIC 522",
                "npk": "Balanced N-P-K",
                "amount_per_acre": "40-50 kg",
                "timing": "0-20 days after planting",
                "si": "CIC 522"
            },
            "vegetative": {
                "primary": "Yara Grower",
                "npk": "21-7-14",
                "amount_per_acre": "60-70 kg",
                "timing": "20-60 days after planting",
                "si": "යාරා ග්‍රෝවර්"
            },
            "reproductive": {
                "primary": "YaraMila WINPLEX",
                "npk": "17:8:17 + MgO + S + TE",
                "amount_per_acre": "50-60 kg",
                "timing": "60-90 days after planting",
                "si": "යාරාමිලා වින්ප්ලෙක්ස්"
            },
            "maturity": {
                "primary": "None",
                "npk": "N/A",
                "amount_per_acre": "0 kg",
                "timing": "No fertilizer needed",
                "si": "අවශ්‍ය නැත"
            }
        }
        
        # Soil type adjustments
        self.soil_adjustments = {
            "sandy": {
                "adjustment": "Increase frequency, reduce amount per application",
                "risk": "High leaching risk",
                "si_adjustment": "වාර ගණන වැඩි කරන්න, එක් වරකට යොදන ප්‍රමාණය අඩු කරන්න",
                "si_risk": "සෝදා බැස යාමේ ඉහළ අවදානමක්"
            },
            "clay": {
                "adjustment": "Apply in split doses, ensure good drainage",
                "risk": "Waterlogging risk",
                "si_adjustment": "කොටස් වශයෙන් යොදන්න, ජලය බැස යාම හොඳ බව සහතික කරන්න",
                "si_risk": "ජලය රැඳී සිටීමේ අවදානම"
            },
            "loamy": {
                "adjustment": "Optimal conditions, follow standard recommendations",
                "risk": "Low risk",
                "si_adjustment": "හොඳම තත්ත්වය, සම්මත නිර්දේශ අනුගමනය කරන්න",
                "si_risk": "අඩු අවදානම"
            },
            "acidic": {
                "adjustment": "Consider lime application before fertilizing",
                "risk": "Nutrient availability issues",
                "si_adjustment": "පොහොර දැමීමට පෙර හුණු යෙදීම සලකා බලන්න",
                "si_risk": "පෝෂක ලබා ගැනීමේ ගැටළු"
            }
        }
    
    def process_officer_input(self, data: Dict) -> Dict:
        """Process structured officer input and generate detailed recommendations"""
        language = data.get("language", "en")
        growth_stage = data.get("growth_stage", "early_growth")
        soil_type = data.get("soil_type", "loamy")
        field_size = data.get("field_size", 1.0)  # in acres
        symptoms = data.get("symptoms", [])
        weather_condition = data.get("weather_condition", "normal")
        
        # Get base fertilizer recommendation for growth stage
        stage_rec = self.stage_fertilizers.get(growth_stage, self.stage_fertilizers["early_growth"])
        
        # Calculate amounts based on field size
        base_amount = float(stage_rec["amount_per_acre"].split()[0]) if stage_rec["amount_per_acre"] != "0 kg" else 0
        total_amount = base_amount * field_size
        
        recommendations = []
        
        # Primary recommendation
        if base_amount > 0:
            recommendations.append({
                "type": "primary",
                "fertilizer": stage_rec["si"] if language == "si" else stage_rec["primary"],
                "npk": stage_rec["npk"],
                "amount": f"{total_amount:.1f} kg" if language == "en" else f"කිලෝ {total_amount:.1f}",
                "amount_per_acre": stage_rec["amount_per_acre"],
                "timing": stage_rec["timing"],
                "priority": "high",
                "cost_estimate": self._estimate_cost(stage_rec["primary"], total_amount, language)
            })
        
        # Additional recommendations based on symptoms
        symptom_recs = self._analyze_symptoms(symptoms, language)
        recommendations.extend(symptom_recs)
        
        # Soil-specific adjustments
        soil_adjustment = self.soil_adjustments.get(soil_type, self.soil_adjustments["loamy"])
        
        # Weather-based warnings
        warnings = self._generate_warnings(weather_condition, soil_type, language)
        
        # Application schedule
        application_schedule = self._generate_schedule(growth_stage, field_size, language)
        
        # Cost analysis
        cost_analysis = self._generate_cost_analysis(recommendations, language)
        
        # Generate detailed advice
        advice = self._generate_officer_advice(
            growth_stage, soil_type, weather_condition, recommendations, language
        )
        
        # Generate reasoning
        reasoning = self._generate_officer_reasoning(
            growth_stage, symptoms, soil_type, weather_condition, language
        )
        
        return {
            "success": True,
            "language": language,
            "growth_stage": growth_stage,
            "soil_type": soil_type,
            "field_size": field_size,
            "recommendations": recommendations,
            "warnings": warnings,
            "soil_adjustment": {
                "adjustment": soil_adjustment["si_adjustment"] if language == "si" else soil_adjustment["adjustment"],
                "risk": soil_adjustment["si_risk"] if language == "si" else soil_adjustment["risk"]
            },
            "application_schedule": application_schedule,
            "cost_analysis": cost_analysis,
            "advice": advice,
            "observation": reasoning["observation"],
            "cause": reasoning["cause"],
            "reasoning": reasoning["reasoning"],
            "apply_today": weather_condition not in ["heavy_rain", "flooding"]
        }
    
    def _analyze_symptoms(self, symptoms: List[str], language: str) -> List[Dict]:
        """Analyze symptoms and provide additional recommendations"""
        recs = []
        
        if "yellow_leaves" in symptoms or "nitrogen_deficiency" in symptoms:
            recs.append({
                "type": "corrective",
                "fertilizer": "යුරියා" if language == "si" else "Urea",
                "npk": "46-0-0",
                "amount": "කිලෝ 30-40 අක්කරයකට" if language == "si" else "30-40 kg per acre",
                "timing": "Apply immediately in split doses",
                "priority": "high",
                "cost_estimate": "LKR 2,500-3,500 per acre" if language == "en" else "අක්කරයකට රු. 2,500-3,500"
            })
        
        if "weak_plants" in symptoms or "potassium_deficiency" in symptoms:
            recs.append({
                "type": "corrective",
                "fertilizer": "එම්.ඕ.පී" if language == "si" else "MOP (Muriate of Potash)",
                "npk": "0-0-60",
                "amount": "කිලෝ 25-35 අක්කරයකට" if language == "si" else "25-35 kg per acre",
                "timing": "Apply during vegetative stage",
                "priority": "medium",
                "cost_estimate": "LKR 2,000-3,000 per acre" if language == "en" else "අක්කරයකට රු. 2,000-3,000"
            })
        
        if "stunted_growth" in symptoms or "phosphorus_deficiency" in symptoms:
            recs.append({
                "type": "corrective",
                "fertilizer": "ටී.එස්.පී" if language == "si" else "TSP (Triple Super Phosphate)",
                "npk": "0-46-0",
                "amount": "කිලෝ 20-30 අක්කරයකට" if language == "si" else "20-30 kg per acre",
                "timing": "Apply at root zone",
                "priority": "high",
                "cost_estimate": "LKR 1,800-2,500 per acre" if language == "en" else "අක්කරයකට රු. 1,800-2,500"
            })
        
        return recs
    
    def _generate_warnings(self, weather: str, soil: str, language: str) -> List[Dict]:
        """Generate weather and soil-based warnings"""
        warnings = []
        
        if weather == "heavy_rain":
            warnings.append({
                "type": "weather",
                "severity": "high",
                "message_en": "Heavy rain detected. Delay fertilizer application by 2-3 days to avoid nutrient loss.",
                "message_si": "අධික වර්ෂාපතනයක් හඳුනාගෙන ඇත. පෝෂක අහිමි වීම වැළැක්වීමට දින 2-3 කින් පොහොර යෙදීම ප්‍රමාද කරන්න."
            })
        
        if weather == "drought":
            warnings.append({
                "type": "weather",
                "severity": "high",
                "message_en": "Drought conditions. Irrigate before fertilizer application for better absorption.",
                "message_si": "නියඟ තත්ත්වය. වඩා හොඳ අවශෝෂණයක් සඳහා පොහොර යෙදීමට පෙර වාරි මාර්ග සපයන්න."
            })
        
        if soil == "sandy":
            warnings.append({
                "type": "soil",
                "severity": "medium",
                "message_en": "Sandy soil detected. Use split applications to reduce leaching losses.",
                "message_si": "වැලි පස හඳුනාගෙන ඇත. සෝදා යාමේ අලාභ අඩු කිරීමට කොටස් වශයෙන් යෙදීම් භාවිතා කරන්න."
            })
        
        if soil == "clay":
            warnings.append({
                "type": "soil",
                "severity": "medium",
                "message_en": "Clay soil detected. Ensure proper drainage to prevent waterlogging.",
                "message_si": "මැටි පස හඳුනාගෙන ඇත. ජලය රැඳී සිටීම වැළැක්වීමට නිසි ජලාපවහනය සහතික කරන්න."
            })
        
        return warnings
    
    def _generate_schedule(self, growth_stage: str, field_size: float, language: str) -> List[Dict]:
        """Generate application schedule"""
        schedule = []
        
        if growth_stage in ["land_prep", "planting"]:
            schedule.append({
                "day": "0",
                "activity": "බේසල් පොහොර යෙදීම" if language == "si" else "Basal fertilizer application",
                "fertilizer": "MP Basal",
                "amount": f"{50 * field_size:.1f} kg"
            })
        
        if growth_stage in ["early_growth", "vegetative"]:
            schedule.append({
                "day": "15-20",
                "activity": "පළමු උඩින් පොහොර යෙදීම" if language == "si" else "First top dressing",
                "fertilizer": "Urea / Yara Grower",
                "amount": f"{30 * field_size:.1f} kg"
            })
            schedule.append({
                "day": "35-40",
                "activity": "දෙවන උඩින් පොහොර යෙදීම" if language == "si" else "Second top dressing",
                "fertilizer": "Yara Grower",
                "amount": f"{30 * field_size:.1f} kg"
            })
        
        if growth_stage == "reproductive":
            schedule.append({
                "day": "60-65",
                "activity": "මල් හා කොබ් සඳහා පොහොර" if language == "si" else "Flowering and cob fertilizer",
                "fertilizer": "YaraMila WINPLEX",
                "amount": f"{50 * field_size:.1f} kg"
            })
        
        return schedule
    
    def _generate_cost_analysis(self, recommendations: List[Dict], language: str) -> Dict:
        """Generate cost analysis"""
        total_cost = 0
        breakdown = []
        
        for rec in recommendations:
            cost_str = rec.get("cost_estimate", "")
            if "LKR" in cost_str or "රු" in cost_str:
                # Extract numeric value
                import re
                numbers = re.findall(r'\d+', cost_str.replace(',', ''))
                if numbers:
                    avg_cost = sum(int(n) for n in numbers) / len(numbers)
                    total_cost += avg_cost
                    breakdown.append({
                        "item": rec["fertilizer"],
                        "cost": f"LKR {avg_cost:.0f}" if language == "en" else f"රු. {avg_cost:.0f}"
                    })
        
        return {
            "total_estimated_cost": f"LKR {total_cost:.0f}" if language == "en" else f"රු. {total_cost:.0f}",
            "breakdown": breakdown,
            "note": "Prices are approximate and may vary by location" if language == "en" else "මිල ආසන්න වශයෙන් වන අතර ස්ථානය අනුව වෙනස් විය හැක"
        }
    
    def _estimate_cost(self, fertilizer: str, amount: float, language: str) -> str:
        """Estimate fertilizer cost"""
        # Approximate prices per kg in LKR
        prices = {
            "MP Basal": 85,
            "Urea": 90,
            "Yara Grower": 120,
            "YaraMila WINPLEX": 130,
            "CIC 522": 95,
            "TSP": 75,
            "MOP": 80
        }
        
        price_per_kg = prices.get(fertilizer, 100)
        total = price_per_kg * amount
        
        if language == "si":
            return f"රු. {total:,.0f}"
        return f"LKR {total:,.0f}"
    
    def _generate_officer_advice(self, stage: str, soil: str, weather: str, recs: List[Dict], language: str) -> str:
        """Generate comprehensive advice for officers"""
        if language == "si":
            advice = f"වර්ධන අවධිය: {stage}\n"
            advice += f"පස වර්ගය: {soil}\n"
            advice += f"කාලගුණ තත්ත්වය: {weather}\n\n"
            advice += "නිර්දේශිත පොහොර:\n"
            for rec in recs:
                advice += f"• {rec['fertilizer']} ({rec['npk']}) - {rec['amount']}\n"
            return advice
        else:
            advice = f"Growth Stage: {stage}\n"
            advice += f"Soil Type: {soil}\n"
            advice += f"Weather Condition: {weather}\n\n"
            advice += "Recommended Fertilizers:\n"
            for rec in recs:
                advice += f"• {rec['fertilizer']} ({rec['npk']}) - {rec['amount']}\n"
            return advice
    
    def _generate_officer_reasoning(self, stage: str, symptoms: List[str], soil: str, weather: str, language: str) -> Dict:
        """Generate detailed reasoning for officers"""
        if language == "si":
            obs = f"වර්ධන අවධිය: {stage}, පස: {soil}, කාලගුණය: {weather}"
            if symptoms:
                obs += f", රෝග ලක්ෂණ: {', '.join(symptoms)}"
            
            cause = "DOA සහ CIC නිර්දේශ අනුව, මෙම වර්ධන අවධිය සඳහා විශේෂිත පෝෂක අවශ්‍යතා ඇත."
            if symptoms:
                cause += " හඳුනාගත් රෝග ලක්ෂණ නිවැරදි කිරීමේ පියවර අවශ්‍ය වේ."
            
            reasoning = "ව්‍යුහගත විශ්ලේෂණය මත පදනම්ව, නිර්දේශිත පොහොර මිශ්‍රණය ප්‍රශස්ත වර්ධනය සහ අස්වැන්න සඳහා සහාය වේ."
        else:
            obs = f"Growth stage: {stage}, Soil: {soil}, Weather: {weather}"
            if symptoms:
                obs += f", Symptoms: {', '.join(symptoms)}"
            
            cause = "Based on DOA and CIC guidelines, this growth stage requires specific nutrient inputs."
            if symptoms:
                cause += " Detected symptoms require corrective measures."
            
            reasoning = "Based on structured analysis, the recommended fertilizer mix supports optimal growth and yield."
        
        return {
            "observation": obs,
            "cause": cause,
            "reasoning": reasoning
        }
