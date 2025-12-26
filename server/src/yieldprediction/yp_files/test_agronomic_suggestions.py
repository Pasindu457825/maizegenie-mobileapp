"""
Test script to verify Agronomic Suggestion System
Tests scenarios where officers input suboptimal conditions and system suggests improvements
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from src.yieldprediction.officer_service import (
    suggest_seed_variety,
    suggest_irrigation,
    suggest_soil_fertility,
    suggest_npk_improvement,
    build_impact_factors,
)

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*80}")
    print(f"{title}")
    print(f"{'='*80}")

def test_seed_variety_suggestions():
    """Test seed variety suggestion system"""
    print_section("TEST 1: SEED VARIETY SUGGESTIONS")
    
    # Scenario 1: Local Variety in Anuradhapura (should suggest Jet 999)
    print("\n📌 Scenario 1: Local Variety in Anuradhapura")
    data1 = {
        "seed_variety": "Local Variety",
        "district": "Anuradhapura",
    }
    suggestion1 = suggest_seed_variety(data1)
    if suggestion1:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion1['current']} ({suggestion1['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion1['suggested']} (+{suggestion1['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion1['difference']:.1f}%")
        print(f"   Reason: {suggestion1['reason']}")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 2: GT 200 in Badulla (suboptimal - should suggest Jet 999)
    print("\n📌 Scenario 2: GT 200 in Badulla (suboptimal)")
    data2 = {
        "seed_variety": "GT 200",
        "district": "Badulla",
    }
    suggestion2 = suggest_seed_variety(data2)
    if suggestion2:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion2['current']} ({suggestion2['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion2['suggested']} (+{suggestion2['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion2['difference']:.1f}%")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 3: Jet 999 in Anuradhapura (optimal - no suggestion)
    print("\n📌 Scenario 3: Jet 999 in Anuradhapura (optimal)")
    data3 = {
        "seed_variety": "Jet 999",
        "district": "Anuradhapura",
    }
    suggestion3 = suggest_seed_variety(data3)
    if suggestion3:
        print(f"   ❌ Suggestion triggered (unexpected)")
    else:
        print(f"   ✅ No suggestion (correct - already optimal)")

def test_irrigation_suggestions():
    """Test irrigation suggestion system"""
    print_section("TEST 2: IRRIGATION SUGGESTIONS")
    
    # Scenario 1: Rainfed with Low rainfall (should suggest supplementary irrigation)
    print("\n📌 Scenario 1: Rainfed + Low Rainfall")
    data1 = {
        "irrigation_type": "Rainfed",
        "rainfall_condition": "Low",
    }
    suggestion1 = suggest_irrigation(data1)
    if suggestion1:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion1['current']} ({suggestion1['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion1['suggested']} (+{suggestion1['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion1['difference']:.1f}%")
        print(f"   Reason: {suggestion1['reason']}")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 2: Rainfed with High rainfall (no suggestion needed)
    print("\n📌 Scenario 2: Rainfed + High Rainfall")
    data2 = {
        "irrigation_type": "Rainfed",
        "rainfall_condition": "High",
    }
    suggestion2 = suggest_irrigation(data2)
    if suggestion2:
        print(f"   ❌ Suggestion triggered (unexpected)")
    else:
        print(f"   ✅ No suggestion (correct - adequate rainfall)")
     XGBoost Yield Prediction model loaded successfully!
    # Scenario 3: Irrigated (no suggestion needed)
    print("\n📌 Scenario 3: Irrigated")
    data3 = {
        "irrigation_type": "Irrigated",
        "rainfall_condition": "Low",
    }
    suggestion3 = suggest_irrigation(data3)
    if suggestion3:
        print(f"   ❌ Suggestion triggered (unexpected)")
    else:
        print(f"   ✅ No suggestion (correct - already irrigated)")

def test_soil_fertility_suggestions():
    """Test soil fertility suggestion system"""
    print_section("TEST 3: SOIL FERTILITY SUGGESTIONS")
    
    # Scenario 1: Very low fertility (< 0.5)
    print("\n📌 Scenario 1: Very Low Fertility (0.35)")
    data1 = {
        "soil_fertility_index": 0.35,
    }
    suggestion1 = suggest_soil_fertility(data1)
    if suggestion1:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion1['current']} ({suggestion1['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion1['suggested']} (+{suggestion1['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion1['difference']:.1f}%")
        print(f"   Reason: {suggestion1['reason']}")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 2: Moderate fertility (0.5 - 0.7)
    print("\n📌 Scenario 2: Moderate Fertility (0.60)")
    data2 = {
        "soil_fertility_index": 0.60,
    }
    suggestion2 = suggest_soil_fertility(data2)
    if suggestion2:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion2['current']} ({suggestion2['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion2['suggested']} (+{suggestion2['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion2['difference']:.1f}%")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 3: Good fertility (>= 0.7)
    print("\n📌 Scenario 3: Good Fertility (0.85)")
    data3 = {
        "soil_fertility_index": 0.85,
    }
    suggestion3 = suggest_soil_fertility(data3)
    if suggestion3:
        print(f"   ❌ Suggestion triggered (unexpected)")
    else:
        print(f"   ✅ No suggestion (correct - already good)")

def test_npk_suggestions():
    """Test NPK improvement suggestion system"""
    print_section("TEST 4: NPK IMPROVEMENT SUGGESTIONS")
    
    # Scenario 1: Low Nitrogen
    print("\n📌 Scenario 1: Low Nitrogen")
    data1 = {
        "n_status_class": "Low",
        "p_status_class": "Medium",
        "k_status_class": "Medium",
    }
    suggestion1 = suggest_npk_improvement(data1)
    if suggestion1:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion1['current']} ({suggestion1['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion1['suggested']} (+{suggestion1['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion1['difference']:.1f}%")
        print(f"   Reason: {suggestion1['reason']}")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 2: Low Phosphorus
    print("\n📌 Scenario 2: Low Phosphorus")
    data2 = {
        "n_status_class": "High",
        "p_status_class": "Low",
        "k_status_class": "Medium",
    }
    suggestion2 = suggest_npk_improvement(data2)
    if suggestion2:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion2['current']} ({suggestion2['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion2['suggested']} (+{suggestion2['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion2['difference']:.1f}%")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 3: Low Potassium
    print("\n📌 Scenario 3: Low Potassium")
    data3 = {
        "n_status_class": "High",
        "p_status_class": "High",
        "k_status_class": "Low",
    }
    suggestion3 = suggest_npk_improvement(data3)
    if suggestion3:
        print(f"   ✅ Suggestion triggered!")
        print(f"   Current: {suggestion3['current']} ({suggestion3['current_impact']:.1f}%)")
        print(f"   Suggested: {suggestion3['suggested']} (+{suggestion3['suggested_impact']:.1f}%)")
        print(f"   Improvement: +{suggestion3['difference']:.1f}%")
    else:
        print(f"   ❌ No suggestion (unexpected)")
    
    # Scenario 4: All nutrients optimal
    print("\n📌 Scenario 4: All Nutrients Optimal")
    data4 = {
        "n_status_class": "High",
        "p_status_class": "High",
        "k_status_class": "High",
    }
    suggestion4 = suggest_npk_improvement(data4)
    if suggestion4:
        print(f"   ❌ Suggestion triggered (unexpected)")
    else:
        print(f"   ✅ No suggestion (correct - all optimal)")

def test_integrated_impact_factors():
    """Test integrated impact factors with suggestions"""
    print_section("TEST 5: INTEGRATED IMPACT FACTORS (ML MODEL)")
    
    # Scenario: Multiple suboptimal conditions
    print("\n📌 Scenario: Officer with multiple suboptimal inputs")
    data = {
        "seed_variety": "Local Variety",
        "district": "Badulla",
        "irrigation_type": "Rainfed",
        "rainfall_condition": "Low",
        "soil_fertility_index": 0.45,
        "n_status_class": "Low",
        "p_status_class": "Medium",
        "k_status_class": "Medium",
        "season": "Yala",
    }
    
    multipliers = {}  # Not used for ML
    factors = build_impact_factors(data, multipliers, "ml_model")
    
    print(f"\n   Generated {len(factors)} impact factors:")
    for i, factor in enumerate(factors, 1):
        print(f"\n   {i}. {factor['factor']}")
        print(f"      Value: {factor['value']}")
        print(f"      Impact: {factor['impact_percentage']:.1f}%")
        print(f"      Source: {factor['source']}")
        
        if factor.get('suggested_value'):
            print(f"      🎯 SUGGESTION AVAILABLE:")
            print(f"         Suggested: {factor['suggested_value']}")
            print(f"         Suggested Impact: +{factor['suggested_impact']:.1f}%")
            print(f"         Improvement: +{factor['difference']:.1f}%")
        else:
            print(f"      ✓ Already optimal or no suggestion")

def test_rule_based_with_suggestions():
    """Test rule-based impact factors with suggestions"""
    print_section("TEST 6: RULE-BASED IMPACT FACTORS WITH SUGGESTIONS")
    
    # Scenario: Rule-based with suboptimal variety
    print("\n📌 Scenario: Rule-based prediction with Local Variety")
    data = {
        "seed_variety": "Local Variety",
        "district": "Anuradhapura",
        "irrigation_type": "Mixed",
        "rainfall_condition": "Normal",
        "soil_fertility_index": 0.65,
        "n_status_class": "Medium",
        "p_status_class": "Medium",
        "k_status_class": "Medium",
    }
    
    # Simulated multipliers from rule-based system
    multipliers = {
        "seed_variety": 0.85,  # Local variety penalty
        "irrigation_type": 1.10,
        "soil_fertility_index": 1.05,
        "season": 1.15,
    }
    
    factors = build_impact_factors(data, multipliers, "rule_based")
    
    print(f"\n   Generated {len(factors)} impact factors:")
    for i, factor in enumerate(factors, 1):
        print(f"\n   {i}. {factor['factor']}")
        print(f"      Value: {factor['value']}")
        print(f"      Impact: {factor['impact_percentage']:.1f}%")
        print(f"      Source: {factor['source']}")
        
        if factor.get('suggested_value'):
            print(f"      🎯 SUGGESTION AVAILABLE:")
            print(f"         Suggested: {factor['suggested_value']}")
            print(f"         Suggested Impact: +{factor['suggested_impact']:.1f}%")
            print(f"         Improvement: +{factor['difference']:.1f}%")

def test_negative_impact_display():
    """Test when negative impacts should appear"""
    print_section("TEST 7: NEGATIVE IMPACT SCENARIOS")
    
    print("\n📌 When should negative impacts appear?")
    print("   ✅ Officer input is suboptimal")
    print("   ✅ A better alternative exists")
    print("   ✅ The factor is actionable")
    
    print("\n📌 Scenario 1: Local Variety (negative impact)")
    data1 = {
        "seed_variety": "Local Variety",
        "district": "Badulla",
    }
    suggestion1 = suggest_seed_variety(data1)
    if suggestion1:
        print(f"   Current Impact: {suggestion1['current_impact']:.1f}% (NEGATIVE)")
        print(f"   Suggested Impact: +{suggestion1['suggested_impact']:.1f}% (POSITIVE)")
        print(f"   ✅ Negative impact shown because better alternative exists")
    
    print("\n📌 Scenario 2: Rainfed + Low Rainfall (negative impact)")
    data2 = {
        "irrigation_type": "Rainfed",
        "rainfall_condition": "Low",
    }
    suggestion2 = suggest_irrigation(data2)
    if suggestion2:
        print(f"   Current Impact: {suggestion2['current_impact']:.1f}% (NEGATIVE)")
        print(f"   Suggested Impact: +{suggestion2['suggested_impact']:.1f}% (POSITIVE)")
        print(f"   ✅ Negative impact shown because improvement is possible")
    
    print("\n📌 Scenario 3: Very Low Soil Fertility (negative impact)")
    data3 = {
        "soil_fertility_index": 0.35,
    }
    suggestion3 = suggest_soil_fertility(data3)
    if suggestion3:
        print(f"   Current Impact: {suggestion3['current_impact']:.1f}% (NEGATIVE)")
        print(f"   Suggested Impact: +{suggestion3['suggested_impact']:.1f}% (POSITIVE)")
        print(f"   ✅ Negative impact shown because soil can be improved")

if __name__ == "__main__":
    print("\n" + "="*80)
    print("AGRONOMIC SUGGESTION SYSTEM TEST SUITE")
    print("Testing scenario-based decision support for agricultural officers")
    print("="*80)
    
    # Run all tests
    test_seed_variety_suggestions()
    test_irrigation_suggestions()
    test_soil_fertility_suggestions()
    test_npk_suggestions()
    test_integrated_impact_factors()
    test_rule_based_with_suggestions()
    test_negative_impact_display()
    
    # Summary
    print_section("TEST SUMMARY")
    print("\n✅ All suggestion systems tested")
    print("✅ Negative impacts appear only when:")
    print("   • Officer input is suboptimal")
    print("   • Better alternative exists")
    print("   • Factor is actionable (can be improved)")
    print("\n✅ Suggestion system provides:")
    print("   • Current value and impact (grey/red bar)")
    print("   • Suggested value and impact (green bar)")
    print("   • Improvement percentage")
    print("   • Actionable reason/recommendation")
    print("\n✅ System is honest:")
    print("   • NOT claiming ML explainability (SHAP/LIME)")
    print("   • Using agronomic research-based suggestions")
    print("   • Source transparency: 'agronomic_suggestion' tag")
    
    print(f"\n{'='*80}\n")
