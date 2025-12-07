-- ============================================================================
-- 0. ENABLE REQUIRED EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FARMER_INPUTS - All prediction request data from farmers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farmer_inputs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    -- Location & Timing
    district TEXT NOT NULL,
    season TEXT NOT NULL CHECK (season IN ('Maha', 'Yala')),
    planting_date DATE NOT NULL,
    land_size_hectares DECIMAL(8,2) NOT NULL CHECK (land_size_hectares > 0),
    
    -- Crop Information
    maize_variety TEXT DEFAULT 'Unknown',
    
    -- Field Conditions
    soil_condition TEXT NOT NULL CHECK (soil_condition IN ('Good', 'Medium', 'Poor')),
    irrigation_type TEXT NOT NULL CHECK (irrigation_type IN ('Rainfed', 'Irrigated', 'Mixed')),
    rainfall_situation TEXT NOT NULL CHECK (rainfall_situation IN ('Low', 'Normal', 'High')),
    
    -- Issues & Additional Context
    pest_disease_issue BOOLEAN DEFAULT FALSE,
    organic_fertilizer_used BOOLEAN DEFAULT FALSE,
    farmer_message TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. DISTRICT_BASELINES - Agronomic settings per district (officer configurable)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.district_baselines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district TEXT UNIQUE NOT NULL,
    
    -- Soil Nutrient Baselines (typical levels)
    avg_soil_nitrogen_ppm DECIMAL(8,2) DEFAULT 25.0,
    avg_soil_phosphorus_ppm DECIMAL(8,2) DEFAULT 15.0,
    avg_soil_potassium_ppm DECIMAL(8,2) DEFAULT 120.0,
    soil_ph_range TEXT DEFAULT '6.0-7.0',
    
    -- Fertilizer Recommendations (kg/hectare)
    recommended_n_kg_per_ha DECIMAL(8,2) DEFAULT 120.0,
    recommended_p_kg_per_ha DECIMAL(8,2) DEFAULT 60.0,
    recommended_k_kg_per_ha DECIMAL(8,2) DEFAULT 100.0,
    
    -- Safety Limits
    max_n_kg_per_ha DECIMAL(8,2) DEFAULT 180.0,
    max_p_kg_per_ha DECIMAL(8,2) DEFAULT 90.0,
    max_k_kg_per_ha DECIMAL(8,2) DEFAULT 150.0,
    
    -- Who & When Updated
    last_updated_by UUID REFERENCES public.profiles(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PREDICTIONS - ML model outputs for yield estimation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_input_id UUID REFERENCES public.farmer_inputs(id) NOT NULL,
    
    predicted_yield_kg_per_ha DECIMAL(10,2) NOT NULL,
    yield_lower_bound DECIMAL(10,2),
    yield_upper_bound DECIMAL(10,2),
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('High', 'Medium', 'Low')),
    confidence_score DECIMAL(5,2),
    
    model_version TEXT DEFAULT 'v1.0',
    primary_limiting_factors TEXT[],
    feature_importance JSONB,
    
    prediction_method TEXT DEFAULT 'rule_based' CHECK (prediction_method IN ('ml_model', 'rule_based', 'hybrid')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. FERTILIZER_ADVICE - Final recommendations delivered to farmers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fertilizer_advice (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_id UUID REFERENCES public.predictions(id) NOT NULL,
    farmer_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    -- Fertilizer Schedule (3 stages)
    basal_urea_kg DECIMAL(8,2) DEFAULT 0,
    basal_tsp_kg DECIMAL(8,2) DEFAULT 0,
    basal_mop_kg DECIMAL(8,2) DEFAULT 0,
    basal_application_date DATE,
    basal_status TEXT DEFAULT 'pending' CHECK (basal_status IN ('pending', 'applied', 'skipped')),
    
    first_topdress_urea_kg DECIMAL(8,2) DEFAULT 0,
    first_topdress_date DATE,
    first_topdress_status TEXT DEFAULT 'pending' CHECK (first_topdress_status IN ('pending', 'applied', 'skipped')),
    
    second_topdress_urea_kg DECIMAL(8,2) DEFAULT 0,
    second_topdress_mop_kg DECIMAL(8,2) DEFAULT 0,
    second_topdress_date DATE,
    second_topdress_status TEXT DEFAULT 'pending' CHECK (second_topdress_status IN ('pending', 'applied', 'skipped')),
    
    -- FIXED → Nullable totals
    total_n_applied_kg DECIMAL(8,2),
    total_p_applied_kg DECIMAL(8,2),
    total_k_applied_kg DECIMAL(8,2),
    
    advisory_text_english TEXT,
    advisory_text_sinhala TEXT,
    
    officer_reviewed BOOLEAN DEFAULT FALSE,
    officer_approved BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES public.profiles(id),
    review_notes TEXT,
    
    calendar_events_created BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. OFFICER_REVIEWS - Human-in-the-loop oversight
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.officer_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    fertilizer_advice_id UUID REFERENCES public.fertilizer_advice(id) ON DELETE CASCADE NOT NULL,
    officer_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    review_type TEXT NOT NULL CHECK (review_type IN ('approved', 'modified', 'rejected')),
    
    original_values JSONB,
    modified_values JSONB,
    
    review_notes TEXT NOT NULL,
    farmer_notification_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_farmer_inputs_farmer_id ON public.farmer_inputs(farmer_id);
CREATE INDEX idx_farmer_inputs_district ON public.farmer_inputs(district);
CREATE INDEX idx_farmer_inputs_season ON public.farmer_inputs(season);
CREATE INDEX idx_farmer_inputs_status ON public.farmer_inputs(status);

CREATE INDEX idx_predictions_farmer_input ON public.predictions(farmer_input_id);

CREATE INDEX idx_fertilizer_advice_prediction ON public.fertilizer_advice(prediction_id);
CREATE INDEX idx_fertilizer_advice_farmer ON public.fertilizer_advice(farmer_id);

CREATE INDEX idx_officer_reviews_advice ON public.officer_reviews(fertilizer_advice_id);
CREATE INDEX idx_officer_reviews_officer ON public.officer_reviews(officer_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (FIXED)
-- ============================================================================

ALTER TABLE public.farmer_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- FARMER_INPUTS
CREATE POLICY "Farmers can view own inputs" ON public.farmer_inputs
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own inputs" ON public.farmer_inputs
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Officers can view district inputs" ON public.farmer_inputs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'officer'
            AND p.district = farmer_inputs.district
        )
    );

-- DISTRICT_BASELINES
CREATE POLICY "Everyone can view baselines" ON public.district_baselines
    FOR SELECT USING (true);

CREATE POLICY "Officers can update baselines" ON public.district_baselines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('officer','admin')
        )
    );

-- PREDICTIONS
CREATE POLICY "Farmers view own predictions" ON public.predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.farmer_inputs fi
            WHERE fi.id = predictions.farmer_input_id
            AND fi.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Officers view district predictions" ON public.predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.farmer_inputs fi
            JOIN public.profiles p ON p.id = auth.uid()
            WHERE fi.id = predictions.farmer_input_id
            AND p.role = 'officer'
            AND p.district = fi.district
        )
    );

-- FERTILIZER_ADVICE
CREATE POLICY "Farmers view own advice" ON public.fertilizer_advice
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers update status" ON public.fertilizer_advice
    FOR UPDATE USING (auth.uid() = farmer_id)
    WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Officers review advice" ON public.fertilizer_advice
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('officer','admin')
        )
    );

-- OFFICER_REVIEWS
CREATE POLICY "Officers create reviews" ON public.officer_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = officer_id
        AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('officer','admin'))
    );

CREATE POLICY "Farmers & Officers view reviews" ON public.officer_reviews
    FOR SELECT USING (
        auth.uid() = officer_id OR
        EXISTS (
            SELECT 1 FROM public.fertilizer_advice fa
            WHERE fa.id = officer_reviews.fertilizer_advice_id
            AND fa.farmer_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END; $$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_farmer_inputs_updated BEFORE UPDATE ON public.farmer_inputs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_district_baselines_updated BEFORE UPDATE ON public.district_baselines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_predictions_updated BEFORE UPDATE ON public.predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fertilizer_advice_updated BEFORE UPDATE ON public.fertilizer_advice
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE SRI LANKAN BASELINES
-- ============================================================================

INSERT INTO public.district_baselines (
    district, 
    recommended_n_kg_per_ha, 
    recommended_p_kg_per_ha, 
    recommended_k_kg_per_ha,
    max_n_kg_per_ha,
    max_p_kg_per_ha,
    max_k_kg_per_ha
) VALUES
    ('Anuradhapura', 130.0, 65.0, 110.0, 180.0, 90.0, 150.0),
    ('Monaragala', 120.0, 60.0, 100.0, 170.0, 85.0, 140.0),
    ('Badulla', 125.0, 62.0, 105.0, 175.0, 87.0, 145.0),
    ('Ampara', 135.0, 68.0, 115.0, 185.0, 95.0, 160.0),
    ('Polonnaruwa', 128.0, 64.0, 108.0, 178.0, 88.0, 148.0),
    ('Kurunegala', 122.0, 61.0, 102.0, 172.0, 86.0, 142.0),
    ('Puttalam', 118.0, 59.0, 98.0, 168.0, 84.0, 138.0),
    ('Hambantota', 115.0, 58.0, 95.0, 165.0, 82.0, 135.0)
ON CONFLICT (district) DO UPDATE SET
    recommended_n_kg_per_ha = EXCLUDED.recommended_n_kg_per_ha,
    recommended_p_kg_per_ha = EXCLUDED.recommended_p_kg_per_ha,
    recommended_k_kg_per_ha = EXCLUDED.recommended_k_kg_per_ha,
    updated_at = NOW();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN 
    RAISE NOTICE '🎉 MaizeGenie Schema Installed Successfully!';
END $$;
