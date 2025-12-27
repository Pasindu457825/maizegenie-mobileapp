"""
Professional PDF Report Generator for Agricultural Officers
Generates comprehensive yield prediction reports with MaizeGenie branding
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    PageBreak, Image, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from datetime import datetime
from typing import Dict, List
import io


class MaizeGenieReportCanvas(canvas.Canvas):
    """Custom canvas for adding headers and footers"""
    
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []
        
    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()
        
    def save(self):
        page_count = len(self.pages)
        for page_num, page in enumerate(self.pages, 1):
            self.__dict__.update(page)
            self.draw_page_decorations(page_num, page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)
        
    def draw_page_decorations(self, page_num, page_count):
        """Draw header and footer on each page"""
        # Header
        self.saveState()
        
        # Green header bar
        self.setFillColor(colors.HexColor("#16A34A"))
        self.rect(0, A4[1] - 50, A4[0], 50, fill=True, stroke=False)
        
        # MaizeGenie logo text
        self.setFillColor(colors.white)
        self.setFont("Helvetica-Bold", 20)
        self.drawString(30, A4[1] - 32, "MaizeGenie")
        
        # Subtitle
        self.setFont("Helvetica", 10)
        self.drawString(30, A4[1] - 45, "Agricultural Intelligence Platform")
        
        # Report type
        self.setFont("Helvetica-Bold", 12)
        self.drawRightString(A4[0] - 30, A4[1] - 32, "Yield Prediction Report")
        
        # Footer
        self.setFillColor(colors.HexColor("#6B7280"))
        self.setFont("Helvetica", 8)
        
        # Page number
        footer_text = f"Page {page_num} of {page_count}"
        self.drawCentredString(A4[0] / 2, 20, footer_text)
        
        # Generated date
        gen_date = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        self.drawString(30, 20, f"Generated: {gen_date}")
        
        # Confidential notice
        self.drawRightString(A4[0] - 30, 20, "Confidential - For Agricultural Use Only")
        
        self.restoreState()


def create_custom_styles():
    """Create custom paragraph styles for the report"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='ReportTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#16A34A"),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    # Section header
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor("#16A34A"),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold',
        borderWidth=0,
        borderColor=colors.HexColor("#16A34A"),
        borderPadding=5,
        backColor=colors.HexColor("#F0FDF4")
    ))
    
    # Subsection header
    styles.add(ParagraphStyle(
        name='SubsectionHeader',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=colors.HexColor("#065F46"),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='ReportBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor("#374151"),
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        leading=14
    ))
    
    # Highlight text
    styles.add(ParagraphStyle(
        name='Highlight',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor("#16A34A"),
        fontName='Helvetica-Bold',
        spaceAfter=6
    ))
    
    # Warning text
    styles.add(ParagraphStyle(
        name='Warning',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor("#DC2626"),
        spaceAfter=6
    ))
    
    return styles


def generate_officer_report(prediction_data: Dict) -> io.BytesIO:
    """
    Generate a professional PDF report for agricultural officers
    
    Args:
        prediction_data: Complete prediction response from officer_service
        
    Returns:
        BytesIO buffer containing the PDF
    """
    buffer = io.BytesIO()
    
    # Create document with custom canvas
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=60,
        bottomMargin=40,
        title="MaizeGenie Yield Prediction Report",
        author="MaizeGenie Agricultural Intelligence"
    )
    
    # Get custom styles
    styles = create_custom_styles()
    
    # Build story (content)
    story = []
    
    # ============================================================
    # 1. REPORT HEADER & SUMMARY
    # ============================================================
    story.append(Spacer(1, 10))
    
    # Report title
    title = Paragraph("Yield Prediction Analysis Report", styles['ReportTitle'])
    story.append(title)
    story.append(Spacer(1, 5))
    
    # Report metadata
    input_summary = prediction_data.get('input_summary', {})
    district = input_summary.get('district', 'N/A')
    variety = input_summary.get('variety', 'N/A')
    season = input_summary.get('season', 'N/A')
    planting_date = input_summary.get('planting_date', 'N/A')
    
    metadata_text = f"""
    <b>District:</b> {district} | <b>Variety:</b> {variety} | 
    <b>Season:</b> {season} | <b>Planting Date:</b> {planting_date}
    """
    story.append(Paragraph(metadata_text, styles['ReportBody']))
    story.append(Spacer(1, 15))
    
    # Executive summary box
    predicted_yield = prediction_data.get('predicted_yield', 0)
    predicted_yield_t = predicted_yield / 1000
    confidence = prediction_data.get('confidence_score', 0)
    method = prediction_data.get('prediction_method', 'N/A')
    
    summary_data = [
        ['Predicted Yield', f'{predicted_yield_t:.3f} t/ha ({predicted_yield:.0f} kg/ha)'],
        ['Confidence Level', f'{confidence:.1%}'],
        ['Prediction Method', method.replace('_', ' ').title()],
        ['Model Version', 'XGBoost v2.0' if method == 'ml_model' else 'Rule-Based System'],
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 3.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#065F46")),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor("#16A34A")),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#16A34A")),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor("#F0FDF4"), colors.white]),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 20))
    
    # ============================================================
    # 2. INPUT PARAMETERS SECTION
    # ============================================================
    story.append(Paragraph("1. Input Parameters", styles['SectionHeader']))
    story.append(Spacer(1, 8))
    
    # Soil profile
    story.append(Paragraph("Soil Profile", styles['SubsectionHeader']))
    soil_data = [
        ['Parameter', 'Value', 'Status'],
        ['Soil Type', prediction_data.get('soil_type', 'N/A'), ''],
        ['Soil Condition', prediction_data.get('soil_condition', 'N/A'), ''],
        ['Soil pH', f"{prediction_data.get('soil_ph', 0):.2f}", get_ph_status(prediction_data.get('soil_ph', 6.5))],
        ['Nitrogen (N)', f"{prediction_data.get('soil_nitrogen_n', 0):.1f} ppm", prediction_data.get('n_status_class', 'N/A')],
        ['Phosphorus (P)', f"{prediction_data.get('soil_phosphorus_p', 0):.1f} ppm", prediction_data.get('p_status_class', 'N/A')],
        ['Potassium (K)', f"{prediction_data.get('soil_potassium_k', 0):.1f} ppm", prediction_data.get('k_status_class', 'N/A')],
        ['Fertility Index', f"{prediction_data.get('soil_fertility_index', 0):.2f}", get_fertility_status(prediction_data.get('soil_fertility_index', 0.5))],
    ]
    
    soil_table = Table(soil_data, colWidths=[2*inch, 2*inch, 2*inch])
    soil_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16A34A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(soil_table)
    story.append(Spacer(1, 12))
    
    # Climate data
    story.append(Paragraph("Climate & Irrigation", styles['SubsectionHeader']))
    climate_data = [
        ['Parameter', 'Value'],
        ['Irrigation Type', prediction_data.get('irrigation_type', 'N/A')],
        ['Rainfall Condition', prediction_data.get('rainfall_condition', 'N/A')],
        ['30-Day Rainfall', f"{prediction_data.get('rainfall_30d_mm', 0):.1f} mm"],
        ['Seasonal Rainfall', f"{prediction_data.get('seasonal_rainfall_mm', 0):.1f} mm"],
        ['Average Temperature', f"{prediction_data.get('avg_temperature_c', 0):.1f}°C"],
        ['Average Humidity', f"{prediction_data.get('avg_humidity_pct', 0):.1f}%"],
    ]
    
    climate_table = Table(climate_data, colWidths=[3*inch, 3*inch])
    climate_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16A34A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(climate_table)
    story.append(Spacer(1, 20))
    
    # ============================================================
    # 3. YIELD COMPARISON SECTION
    # ============================================================
    story.append(Paragraph("2. Yield Comparison Analysis", styles['SectionHeader']))
    story.append(Spacer(1, 8))
    
    yield_comparison = prediction_data.get('analysis_data', {}).get('yield_comparison', {})
    
    comparison_text = f"""
    The predicted yield of <b>{predicted_yield_t:.3f} t/ha</b> is compared against the optimal 
    district yield of <b>{yield_comparison.get('district_optimal', 0)/1000:.3f} t/ha</b>. 
    This represents <b>{((predicted_yield / yield_comparison.get('district_optimal', 1)) * 100):.1f}%</b> 
    of the district's optimal potential.
    """
    story.append(Paragraph(comparison_text, styles['ReportBody']))
    story.append(Spacer(1, 12))
    
    comparison_data = [
        ['Metric', 'Value (t/ha)', 'Value (kg/ha)'],
        ['Predicted Yield', f"{predicted_yield_t:.3f}", f"{predicted_yield:.0f}"],
        ['District Optimal', f"{yield_comparison.get('district_optimal', 0)/1000:.3f}", f"{yield_comparison.get('district_optimal', 0):.0f}"],
        ['Gap', f"{(yield_comparison.get('district_optimal', 0) - predicted_yield)/1000:.3f}", f"{yield_comparison.get('district_optimal', 0) - predicted_yield:.0f}"],
    ]
    
    comparison_table = Table(comparison_data, colWidths=[2.5*inch, 1.75*inch, 1.75*inch])
    comparison_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16A34A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(comparison_table)
    story.append(Spacer(1, 20))
    
    # ============================================================
    # 4. SOIL HEALTH IMPROVEMENTS
    # ============================================================
    story.append(Paragraph("3. Soil Health Assessment", styles['SectionHeader']))
    story.append(Spacer(1, 8))
    
    soil_health = prediction_data.get('analysis_data', {}).get('soil_health', {})
    
    health_data = [
        ['Indicator', 'Current Status', 'Recommendation'],
        ['Overall Health', soil_health.get('overall_status', 'N/A'), soil_health.get('overall_recommendation', 'N/A')],
        ['pH Level', soil_health.get('ph_status', 'N/A'), soil_health.get('ph_recommendation', 'N/A')],
        ['Limiting Factor', soil_health.get('limiting_factor', 'N/A'), soil_health.get('limiting_recommendation', 'N/A')],
    ]
    
    health_table = Table(health_data, colWidths=[1.5*inch, 1.75*inch, 2.75*inch])
    health_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16A34A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(health_table)
    story.append(Spacer(1, 20))
    
    # ============================================================
    # 5. IMPACT FACTORS WITH SUGGESTIONS
    # ============================================================
    story.append(Paragraph("4. Impact Factors & Agronomic Suggestions", styles['SectionHeader']))
    story.append(Spacer(1, 8))
    
    impact_factors = prediction_data.get('impact_factors', [])
    
    # Sort by absolute impact
    sorted_factors = sorted(impact_factors, key=lambda x: abs(x.get('impact_percentage', 0)), reverse=True)
    
    for i, factor in enumerate(sorted_factors[:8], 1):  # Top 8 factors
        factor_name = factor.get('factor', 'N/A')
        impact_pct = factor.get('impact_percentage', 0)
        description = factor.get('description', 'N/A')
        source = factor.get('source', 'N/A')
        
        # Factor header
        impact_color = "#16A34A" if impact_pct >= 0 else "#DC2626"
        factor_header = f"""
        <b>{i}. {factor_name}</b> 
        <font color="{impact_color}">({'+' if impact_pct > 0 else ''}{impact_pct:.1f}%)</font>
        """
        story.append(Paragraph(factor_header, styles['SubsectionHeader']))
        
        # Source tag
        source_text = "ML Model" if source == "ml_model" else "Rule Multiplier" if source == "rule_multiplier" else "Agronomic Suggestion"
        source_para = f'<i>Source: {source_text}</i>'
        story.append(Paragraph(source_para, styles['ReportBody']))
        
        # Description
        story.append(Paragraph(description, styles['ReportBody']))
        
        # If suggestion exists, show it
        if factor.get('suggested_value'):
            suggestion_box = f"""
            <b>🎯 Improvement Opportunity:</b><br/>
            Current: {factor.get('value', 'N/A')} ({impact_pct:.1f}%)<br/>
            Suggested: {factor.get('suggested_value', 'N/A')} (+{factor.get('suggested_impact', 0):.1f}%)<br/>
            <font color="#16A34A"><b>Potential Improvement: +{factor.get('difference', 0):.1f}%</b></font>
            """
            story.append(Spacer(1, 4))
            story.append(Paragraph(suggestion_box, styles['Highlight']))
        
        story.append(Spacer(1, 10))
    
    story.append(Spacer(1, 10))
    
    # ============================================================
    # 6. RECOMMENDATIONS
    # ============================================================
    story.append(Paragraph("5. Agronomic Recommendations", styles['SectionHeader']))
    story.append(Spacer(1, 8))
    
    recommendations = prediction_data.get('recommendations', [])
    
    for i, rec in enumerate(recommendations[:6], 1):  # Top 6 recommendations
        priority = rec.get('priority', 'medium')
        priority_color = "#DC2626" if priority == "high" else "#F59E0B" if priority == "medium" else "#10B981"
        
        rec_text = f"""
        <b>{i}. {rec.get('title', 'N/A')}</b> 
        <font color="{priority_color}">[{priority.upper()} PRIORITY]</font><br/>
        {rec.get('description', 'N/A')}
        """
        story.append(Paragraph(rec_text, styles['ReportBody']))
        story.append(Spacer(1, 8))
    
    story.append(Spacer(1, 20))
    
    # ============================================================
    # 7. HARVEST WINDOW
    # ============================================================
    story.append(Paragraph("6. Harvest Window", styles['SectionHeader']))
    story.append(Spacer(1, 8))
    
    harvest_window = prediction_data.get('harvest_window', {})
    harvest_text = f"""
    <b>Expected Harvest Period:</b> {harvest_window.get('start', 'N/A')} to {harvest_window.get('end', 'N/A')}<br/>
    <b>Days to Harvest:</b> {harvest_window.get('days_to_harvest', 'N/A')} days from planting
    """
    story.append(Paragraph(harvest_text, styles['ReportBody']))
    story.append(Spacer(1, 20))
    
    # ============================================================
    # 8. DISCLAIMER
    # ============================================================
    story.append(Paragraph("Disclaimer", styles['SectionHeader']))
    disclaimer_text = """
    This report is generated by MaizeGenie's AI-powered yield prediction system and is intended 
    for agricultural guidance purposes only. Actual yields may vary based on weather conditions, 
    pest management, and other factors not captured in this analysis. Agricultural officers should 
    use this report in conjunction with field observations and local expertise. The agronomic 
    suggestions are based on research-validated best practices and are not derived from ML model 
    explainability techniques.
    """
    story.append(Paragraph(disclaimer_text, styles['ReportBody']))
    
    # Build PDF
    doc.build(story, canvasmaker=MaizeGenieReportCanvas)
    
    buffer.seek(0)
    return buffer


def get_ph_status(ph: float) -> str:
    """Get pH status classification"""
    if ph < 5.5:
        return "Too Acidic"
    elif ph < 6.0:
        return "Slightly Acidic"
    elif ph <= 7.0:
        return "Optimal"
    elif ph <= 7.5:
        return "Slightly Alkaline"
    else:
        return "Too Alkaline"


def get_fertility_status(index: float) -> str:
    """Get fertility status classification"""
    if index < 0.5:
        return "Poor"
    elif index < 0.7:
        return "Moderate"
    elif index < 0.85:
        return "Good"
    else:
        return "Excellent"
