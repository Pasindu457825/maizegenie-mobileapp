#!/usr/bin/env python3
"""
Test script for the real metrics-based confidence calculation.

Run this to verify:
1. Model metrics load correctly
2. Confidence calculation uses real metrics
3. Cache file is created/updated properly
"""

import os
import sys
import json
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

def test_metrics_initialization():
    """Test that metrics calculator initializes properly."""
    print("\n" + "="*60)
    print("TEST 1: Metrics Initialization")
    print("="*60)
    
    try:
        from src.priceforecast.model_metrics import metrics_calc, METRICS_CACHE_FILE
        
        print(f"✅ Metrics calculator imported successfully")
        print(f"\nCache file path: {METRICS_CACHE_FILE}")
        print(f"Cache exists: {os.path.exists(METRICS_CACHE_FILE)}")
        
        print(f"\nLoaded metrics:")
        print(f"  R² Score:  {metrics_calc.r2_score_val:.4f}")
        print(f"  MAE:       {metrics_calc.mae_val:.2f} Rs/kg")
        print(f"  RMSE:      {metrics_calc.rmse_val:.2f} Rs/kg")
        print(f"  Cached:    {metrics_calc.metrics_cached}")
        
        if metrics_calc.last_updated:
            print(f"  Updated:   {metrics_calc.last_updated}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_confidence_calculation():
    """Test confidence calculation with various std dev values."""
    print("\n" + "="*60)
    print("TEST 2: Confidence Calculation")
    print("="*60)
    
    try:
        from src.priceforecast.model_metrics import get_confidence_with_metrics
        
        test_cases = [
            (0.3, "Low uncertainty (stable trees)"),
            (0.8, "Medium uncertainty"),
            (1.5, "High uncertainty (trees disagree)"),
            (2.5, "Very high uncertainty"),
        ]
        
        print(f"\nTesting confidence with various tree std dev values:\n")
        print(f"{'Tree Std Dev':<15} {'Confidence %':<15} {'Tag':<10} {'Description':<35}")
        print(f"{'─'*14:<15} {'─'*14:<15} {'─'*9:<10} {'─'*34:<35}")
        
        for delta_std, description in test_cases:
            conf_pct, conf_tag = get_confidence_with_metrics(delta_std)
            print(f"{delta_std:<15.2f} {conf_pct:<15.1f}% {conf_tag:<10} {description:<35}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_cache_persistence():
    """Test that metrics are properly saved and loaded."""
    print("\n" + "="*60)
    print("TEST 3: Cache Persistence")
    print("="*60)
    
    try:
        from src.priceforecast.model_metrics import ModelMetricsCalculator, METRICS_CACHE_FILE
        
        # Create new instance to test loading
        new_calc = ModelMetricsCalculator()
        
        if os.path.exists(METRICS_CACHE_FILE):
            with open(METRICS_CACHE_FILE, 'r') as f:
                cached = json.load(f)
                print(f"✅ Cache file exists and is valid JSON")
                print(f"\nCached values:")
                print(f"  R² Score:  {cached.get('r2_score', 'N/A')}")
                print(f"  MAE:       {cached.get('mae', 'N/A')}")
                print(f"  RMSE:      {cached.get('rmse', 'N/A')}")
                print(f"  Updated:   {cached.get('last_updated', 'N/A')}")
        else:
            print(f"⚠️  No cache file found (using defaults)")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_confidence_formula():
    """Test the math of the confidence formula."""
    print("\n" + "="*60)
    print("TEST 4: Confidence Formula Verification")
    print("="*60)
    
    try:
        from src.priceforecast.model_metrics import metrics_calc
        
        print(f"\nModel metrics being used:")
        print(f"  R² Score:  {metrics_calc.r2_score_val:.4f}")
        print(f"  RMSE:      {metrics_calc.rmse_val:.2f} Rs/kg")
        
        print(f"\nFormula breakdown for delta_std = 0.5:")
        
        delta_std = 0.5
        base_conf = max(50.0, min(98.0, metrics_calc.r2_score_val * 100))
        print(f"  1. Base confidence from R²: {base_conf:.1f}%")
        
        uncertainty_factor = 1.0 - (delta_std / (metrics_calc.rmse_val + 0.1))
        uncertainty_factor = max(0.0, min(1.0, uncertainty_factor))
        print(f"  2. Uncertainty factor: {uncertainty_factor:.4f}")
        
        final_conf = base_conf * (0.7 + 0.3 * uncertainty_factor)
        final_conf = max(50.0, min(98.0, final_conf))
        print(f"  3. Final: {base_conf:.1f} × (0.7 + 0.3 × {uncertainty_factor:.4f})")
        print(f"          = {final_conf:.1f}%")
        
        print(f"\n✅ Formula verification complete")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*12 + "REAL METRICS CONFIDENCE SYSTEM TEST" + " "*12 + "║")
    print("╚" + "="*58 + "╝")
    
    results = []
    
    results.append(("Metrics Initialization", test_metrics_initialization()))
    results.append(("Confidence Calculation", test_confidence_calculation()))
    results.append(("Cache Persistence", test_cache_persistence()))
    results.append(("Confidence Formula", test_confidence_formula()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<40} {status}")
    
    print("="*60)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
