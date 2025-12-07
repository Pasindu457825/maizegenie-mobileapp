/**
 * AgriOfficer Results Screen
 * Shows enhanced prediction results with fertilizer schedule OUTPUT
 * ONLY for officers - NOT shown to farmers
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { 
  TrendingUp, 
  Calendar, 
  Sprout, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Leaf,
  Home
} from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { translations } from '../../../translations/translationYieldPrediction';
import { OfficerPredictionResponse, FertilizerStatus } from '../../../types/officerPrediction';

const { width } = Dimensions.get('window');

type RouteParams = {
  OfficerResults: { 
    predictionData: OfficerPredictionResponse;
  };
};

export const OfficerResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'OfficerResults'>>();
  const { language, resetForm } = useYieldForm();
  
  // Get prediction data from route params
  const { predictionData } = route.params;
  const { prediction, fertilizer_schedule, impact_factors, recommendations, officer_insights } = predictionData;

  // Get translations
  const t = translations.results[language];

  // Helper function to get status color
  const getStatusColor = (status: FertilizerStatus): string => {
    switch (status) {
      case 'done':
        return '#16A34A'; // Green
      case 'partial':
        return '#F59E0B'; // Orange
      case 'pending':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: FertilizerStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={20} color="#16A34A" />;
      case 'partial':
        return <AlertCircle size={20} color="#F59E0B" />;
      case 'pending':
        return <Clock size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  // Helper function to get status text
  const getStatusText = (status: FertilizerStatus): string => {
    switch (status) {
      case 'done':
        return language === 'si' ? 'සම්පූර්ණයි' : 'Done';
      case 'partial':
        return language === 'si' ? 'අර්ධ වශයෙන්' : 'Partial';
      case 'pending':
        return language === 'si' ? 'අපේක්ෂිතයි' : 'Pending';
      default:
        return language === 'si' ? 'නොදනී' : 'Unknown';
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const handleNewPrediction = () => {
    resetForm();
    navigation.navigate('OfficerSoilProfile' as never);
  };

  const handleBackToHome = () => {
    resetForm();
    navigation.navigate('Home' as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TrendingUp size={28} color="#16A34A" />
        </View>
        <View>
          <Text style={styles.headerTitle}>
            {language === 'si' ? 'අස්වැන්න පුරෝකථනය' : 'Yield Prediction'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'si' ? 'කෘෂිකර්ම නිලධාරී වාර්තාව' : 'AgriOfficer Report'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prediction Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Leaf size={24} color="#16A34A" />
            <Text style={styles.summaryTitle}>
              {language === 'si' ? 'පුරෝකථන සාරාංශය' : 'Prediction Summary'}
            </Text>
          </View>

          <View style={styles.yieldContainer}>
            <Text style={styles.yieldLabel}>
              {language === 'si' ? 'අපේක්ෂිත අස්වැන්න' : 'Predicted Yield'}
            </Text>
            <Text style={styles.yieldValue}>
              {prediction.predicted_yield.toLocaleString()} {prediction.yield_unit}
            </Text>
            <Text style={[styles.yieldCategory, { color: '#16A34A' }]}>
              {prediction.yield_category} {language === 'si' ? 'අස්වැන්න' : 'Yield'}
            </Text>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>
              {language === 'si' ? 'විශ්වාසනීයත්වය' : 'Confidence'}
            </Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${prediction.confidence_score * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceValue}>
              {(prediction.confidence_score * 100).toFixed(0)}%
            </Text>
          </View>

          <View style={styles.harvestWindow}>
            <Calendar size={20} color="#16A34A" />
            <View style={styles.harvestDates}>
              <Text style={styles.harvestLabel}>
                {language === 'si' ? 'අස්වනු නෙළීමේ කාලය' : 'Harvest Window'}
              </Text>
              <Text style={styles.harvestValue}>
                {new Date(prediction.harvest_window.start_date).toLocaleDateString()} - {' '}
                {new Date(prediction.harvest_window.end_date).toLocaleDateString()}
              </Text>
              <Text style={styles.harvestDays}>
                {prediction.harvest_window.days_to_harvest} {language === 'si' ? 'දින' : 'days'}
              </Text>
            </View>
          </View>
        </View>

        {/* 🟥 FERTILIZER SCHEDULE (OUTPUT) - ONLY FOR OFFICERS */}
        <View style={styles.fertilizerCard}>
          <View style={styles.sectionHeader}>
            <Sprout size={24} color="#16A34A" />
            <Text style={styles.sectionTitle}>
              {language === 'si' ? 'පොහොර කාලසටහන' : 'Fertilizer Schedule'}
            </Text>
          </View>

          <View style={styles.fertilizerNote}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.noteText}>
              {language === 'si' 
                ? 'ගොවියා විසින් යෙදිය යුතු පොහොර ප්‍රමාණ' 
                : 'Fertilizer amounts farmer should apply'}
            </Text>
          </View>

          {/* NPK Requirements Summary */}
          <View style={styles.npkSummary}>
            <View style={styles.npkItem}>
              <Text style={styles.npkLabel}>N</Text>
              <Text style={styles.npkValue}>{fertilizer_schedule.total_n_requirement} kg/ha</Text>
            </View>
            <View style={styles.npkItem}>
              <Text style={styles.npkLabel}>P</Text>
              <Text style={styles.npkValue}>{fertilizer_schedule.total_p_requirement} kg/ha</Text>
            </View>
            <View style={styles.npkItem}>
              <Text style={styles.npkLabel}>K</Text>
              <Text style={styles.npkValue}>{fertilizer_schedule.total_k_requirement} kg/ha</Text>
            </View>
          </View>

          {/* Basal Fertilizer */}
          <View style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <View style={styles.applicationTitle}>
                <Text style={styles.applicationName}>
                  {language === 'si' ? 'මූලික පොහොර' : 'Basal Fertilizer'}
                </Text>
                <Text style={styles.applicationDay}>
                  {language === 'si' ? 'දින' : 'Day'} {fertilizer_schedule.basal.day_number}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fertilizer_schedule.basal.status) + '20' }]}>
                {getStatusIcon(fertilizer_schedule.basal.status)}
                <Text style={[styles.statusText, { color: getStatusColor(fertilizer_schedule.basal.status) }]}>
                  {getStatusText(fertilizer_schedule.basal.status)}
                </Text>
              </View>
            </View>

            <View style={styles.applicationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'නිර්දේශිත' : 'Recommended'}:
                </Text>
                <Text style={styles.detailValue}>{fertilizer_schedule.basal.npk_amount} kg NPK/ha</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'යෙදූ ප්‍රමාණය' : 'Applied'}:
                </Text>
                <Text style={styles.detailValue}>{fertilizer_schedule.basal.applied_amount} kg/ha</Text>
              </View>
              {fertilizer_schedule.basal.remaining_amount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: '#EF4444' }]}>
                    {language === 'si' ? 'ඉතිරි' : 'Remaining'}:
                  </Text>
                  <Text style={[styles.detailValue, { color: '#EF4444', fontWeight: '700' }]}>
                    {fertilizer_schedule.basal.remaining_amount} kg/ha
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                {language === 'si' 
                  ? fertilizer_schedule.basal.instructions_si 
                  : fertilizer_schedule.basal.instructions_en}
              </Text>
            </View>
          </View>

          {/* Top-Dressing 1 */}
          <View style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <View style={styles.applicationTitle}>
                <Text style={styles.applicationName}>
                  {language === 'si' ? 'පළමු ඉහළ පොහොර' : 'Top-Dressing 1'}
                </Text>
                <Text style={styles.applicationDay}>
                  {language === 'si' ? 'දින' : 'Day'} {fertilizer_schedule.top_dress_1.day_number}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fertilizer_schedule.top_dress_1.status) + '20' }]}>
                {getStatusIcon(fertilizer_schedule.top_dress_1.status)}
                <Text style={[styles.statusText, { color: getStatusColor(fertilizer_schedule.top_dress_1.status) }]}>
                  {getStatusText(fertilizer_schedule.top_dress_1.status)}
                </Text>
              </View>
            </View>

            <View style={styles.applicationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'දිනය' : 'Date'}:
                </Text>
                <Text style={styles.detailValue}>
                  {new Date(fertilizer_schedule.top_dress_1.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'නිර්දේශිත' : 'Recommended'}:
                </Text>
                <Text style={styles.detailValue}>{fertilizer_schedule.top_dress_1.recommended_amount} kg N/ha</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'යෙදූ ප්‍රමාණය' : 'Applied'}:
                </Text>
                <Text style={styles.detailValue}>{fertilizer_schedule.top_dress_1.applied_amount} kg N/ha</Text>
              </View>
              {fertilizer_schedule.top_dress_1.remaining_amount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: '#EF4444' }]}>
                    {language === 'si' ? 'අමතරව යෙදිය යුතු' : 'Additional Required'}:
                  </Text>
                  <Text style={[styles.detailValue, { color: '#EF4444', fontWeight: '700' }]}>
                    {fertilizer_schedule.top_dress_1.remaining_amount} kg N/ha
                  </Text>
                </View>
              )}
            </View>

            {fertilizer_schedule.top_dress_1.adjustment_reason && (
              <View style={styles.adjustmentNote}>
                <AlertCircle size={14} color="#F59E0B" />
                <Text style={styles.adjustmentText}>
                  {fertilizer_schedule.top_dress_1.adjustment_reason}
                </Text>
              </View>
            )}

            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                {language === 'si' 
                  ? fertilizer_schedule.top_dress_1.instructions_si 
                  : fertilizer_schedule.top_dress_1.instructions_en}
              </Text>
            </View>
          </View>

          {/* Top-Dressing 2 */}
          <View style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <View style={styles.applicationTitle}>
                <Text style={styles.applicationName}>
                  {language === 'si' ? 'දෙවන ඉහළ පොහොර' : 'Top-Dressing 2'}
                </Text>
                <Text style={styles.applicationDay}>
                  {language === 'si' ? 'දින' : 'Day'} {fertilizer_schedule.top_dress_2.day_number}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fertilizer_schedule.top_dress_2.status) + '20' }]}>
                {getStatusIcon(fertilizer_schedule.top_dress_2.status)}
                <Text style={[styles.statusText, { color: getStatusColor(fertilizer_schedule.top_dress_2.status) }]}>
                  {getStatusText(fertilizer_schedule.top_dress_2.status)}
                </Text>
              </View>
            </View>

            <View style={styles.applicationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'දිනය' : 'Date'}:
                </Text>
                <Text style={styles.detailValue}>
                  {new Date(fertilizer_schedule.top_dress_2.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'නිර්දේශිත' : 'Recommended'}:
                </Text>
                <Text style={styles.detailValue}>{fertilizer_schedule.top_dress_2.recommended_amount} kg N/ha</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'si' ? 'යෙදූ ප්‍රමාණය' : 'Applied'}:
                </Text>
                <Text style={styles.detailValue}>{fertilizer_schedule.top_dress_2.applied_amount} kg N/ha</Text>
              </View>
              {fertilizer_schedule.top_dress_2.remaining_amount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: '#EF4444' }]}>
                    {language === 'si' ? 'යෙදිය යුතු' : 'To Apply'}:
                  </Text>
                  <Text style={[styles.detailValue, { color: '#EF4444', fontWeight: '700' }]}>
                    {fertilizer_schedule.top_dress_2.remaining_amount} kg N/ha
                  </Text>
                </View>
              )}
            </View>

            {fertilizer_schedule.top_dress_2.adjustment_reason && (
              <View style={styles.adjustmentNote}>
                <AlertCircle size={14} color="#F59E0B" />
                <Text style={styles.adjustmentText}>
                  {fertilizer_schedule.top_dress_2.adjustment_reason}
                </Text>
              </View>
            )}

            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                {language === 'si' 
                  ? fertilizer_schedule.top_dress_2.instructions_si 
                  : fertilizer_schedule.top_dress_2.instructions_en}
              </Text>
            </View>
          </View>

          {/* Warnings */}
          {fertilizer_schedule.warnings && fertilizer_schedule.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              <Text style={styles.warningsTitle}>
                {language === 'si' ? 'අවවාද' : 'Warnings'}
              </Text>
              {fertilizer_schedule.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <AlertCircle size={16} color="#F59E0B" />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Impact Factors - SHAP graphs will be added here after ML integration */}
        <View style={styles.impactCard}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color="#16A34A" />
            <Text style={styles.sectionTitle}>
              {language === 'si' ? 'බලපෑම් සාධක' : 'Impact Factors'}
            </Text>
          </View>

          <View style={styles.impactNote}>
            <AlertCircle size={16} color="#3B82F6" />
            <Text style={styles.noteText}>
              {language === 'si' 
                ? 'SHAP ප්‍රස්ථාර ML ආකෘතිය ඒකාබද්ධ කිරීමෙන් පසුව එකතු වේ' 
                : 'SHAP graphs will be added after ML model integration'}
            </Text>
          </View>

          {impact_factors.map((factor, index) => (
            <View key={index} style={styles.impactItem}>
              <View style={styles.impactHeader}>
                <Text style={styles.impactFactor}>{factor.factor}</Text>
                <Text style={styles.impactPercentage}>+{factor.impact_percentage}%</Text>
              </View>
              <View style={styles.impactBar}>
                <View 
                  style={[
                    styles.impactFill, 
                    { width: `${factor.impact_percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.impactDescription}>{factor.description}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={24} color="#16A34A" />
            <Text style={styles.sectionTitle}>
              {language === 'si' ? 'නිර්දේශ' : 'Recommendations'}
            </Text>
          </View>

          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationHeader}>
                <View 
                  style={[
                    styles.priorityBadge, 
                    { backgroundColor: getPriorityColor(rec.priority) + '20' }
                  ]}
                >
                  <Text style={[styles.priorityText, { color: getPriorityColor(rec.priority) }]}>
                    {rec.priority.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.categoryText}>{rec.category}</Text>
              </View>
              <Text style={styles.recommendationTitle}>
                {language === 'si' ? rec.title_si : rec.title_en}
              </Text>
              <Text style={styles.recommendationDescription}>
                {language === 'si' ? rec.description_si : rec.description_en}
              </Text>
            </View>
          ))}
        </View>

        {/* Officer Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color="#16A34A" />
            <Text style={styles.sectionTitle}>
              {language === 'si' ? 'නිලධාරී විශ්ලේෂණය' : 'Officer Insights'}
            </Text>
          </View>

          <View style={styles.insightsGrid}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>
                {language === 'si' ? 'පස සෞඛ්‍ය ලකුණු' : 'Soil Health Score'}
              </Text>
              <Text style={styles.insightValue}>
                {officer_insights.soil_health_score.toFixed(1)}/10
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>
                {language === 'si' ? 'පොහොර කාර්යක්ෂමතාව' : 'Fertilizer Efficiency'}
              </Text>
              <Text style={styles.insightValue}>
                {(officer_insights.fertilizer_efficiency * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>
                {language === 'si' ? 'අපේක්ෂිත ROI' : 'Expected ROI'}
              </Text>
              <Text style={styles.insightValue}>
                {officer_insights.expected_roi.toFixed(1)}x
              </Text>
            </View>
          </View>

          {officer_insights.risk_factors && officer_insights.risk_factors.length > 0 && (
            <View style={styles.riskFactors}>
              <Text style={styles.riskTitle}>
                {language === 'si' ? 'අවදානම් සාධක' : 'Risk Factors'}
              </Text>
              {officer_insights.risk_factors.map((risk, index) => (
                <View key={index} style={styles.riskItem}>
                  <AlertCircle size={14} color="#EF4444" />
                  <Text style={styles.riskText}>{risk}</Text>
                </View>
              ))}
            </View>
          )}

          {officer_insights.field_visit_recommendations && officer_insights.field_visit_recommendations.length > 0 && (
            <View style={styles.visitRecommendations}>
              <Text style={styles.visitTitle}>
                {language === 'si' ? 'ක්ෂේත්‍ර චාරිකා නිර්දේශ' : 'Field Visit Recommendations'}
              </Text>
              {officer_insights.field_visit_recommendations.map((visit, index) => (
                <View key={index} style={styles.visitItem}>
                  <CheckCircle size={14} color="#16A34A" />
                  <Text style={styles.visitText}>{visit}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleNewPrediction}
          >
            <Sprout size={20} color="#16A34A" />
            <Text style={styles.secondaryButtonText}>
              {language === 'si' ? 'නව පුරෝකථනයක්' : 'New Prediction'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleBackToHome}
          >
            <Home size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 10,
  },
  yieldContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  yieldLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  yieldValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 4,
  },
  yieldCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  confidenceContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    textAlign: 'right',
  },
  harvestWindow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 20,
  },
  harvestDates: {
    marginLeft: 12,
    flex: 1,
  },
  harvestLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  harvestValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  harvestDays: {
    fontSize: 14,
    color: '#16A34A',
  },
  fertilizerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 10,
  },
  fertilizerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  npkSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  npkItem: {
    alignItems: 'center',
  },
  npkLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 4,
  },
  npkValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  applicationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationTitle: {
    flex: 1,
  },
  applicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  applicationDay: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  applicationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  adjustmentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  adjustmentText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    flex: 1,
  },
  instructions: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 6,
  },
  instructionsText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  warningsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  warningsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  impactItem: {
    marginBottom: 16,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactFactor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  impactPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  impactBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  impactFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  impactDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16A34A',
  },
  riskFactors: {
    marginBottom: 16,
  },
  riskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 13,
    color: '#991B1B',
    marginLeft: 8,
    flex: 1,
  },
  visitRecommendations: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  visitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  visitText: {
    fontSize: 13,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
