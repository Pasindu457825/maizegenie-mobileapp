from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import io
import re
import os
import platform

# Configure Tesseract OCR path for Windows
if platform.system() == "Windows":
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        os.environ["PATH"] += os.pathsep + r"C:\Program Files\Tesseract-OCR"
        try:
            import pytesseract
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        except ImportError:
            pass

router = APIRouter(prefix="/api/v1/soil-data", tags=["Soil Data Extraction"])

@router.post("/extract")
async def extract_soil_data(file: UploadFile = File(...)):
    """
    Extract soil test data from PDF or image (in-memory processing).
    File is NOT saved - processed in RAM only.
    
    Returns:
        dict: Extracted soil parameters (ph, nitrogen, phosphorus, potassium, fertility_index)
    """
    try:
        # Read file content into memory
        content = await file.read()
        
        # Determine file type and extract text
        if file.content_type == "application/pdf":
            text = extract_text_from_pdf(content)
        elif file.content_type and file.content_type.startswith("image/"):
            text = extract_text_from_image(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or image.")
        
        # Extract soil values using rule-based patterns
        print(f"📝 Extracted text ({len(text)} chars):")
        print(f"--- START ---\n{text[:1000]}\n--- END ---")
        
        extracted_data = extract_soil_values(text)
        
        if not extracted_data:
            raise HTTPException(
                status_code=422, 
                detail=f"Could not extract soil data from the text. Extracted text preview: '{text[:200].strip()}'. Please ensure the document contains soil test results with values for pH, Nitrogen, Phosphorus, Potassium."
            )
        
        # File content is discarded after this point (garbage collected)
        return extracted_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


def extract_text_from_pdf(content: bytes) -> str:
    """
    Extract text from PDF (text-based PDFs).
    Falls back to OCR if no text layer found.
    """
    try:
        import pdfplumber
        
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        # If no text found, try OCR on PDF pages converted to images
        if not text.strip():
            print("No text layer found in PDF, attempting OCR on page images...")
            text = extract_text_from_pdf_via_ocr(content)
        
        return text
        
    except ImportError:
        raise HTTPException(
            status_code=500, 
            detail="PDF processing library not installed. Please install pdfplumber."
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_pdf_via_ocr(content: bytes) -> str:
    """
    Convert PDF pages to images using pypdfium2, then OCR each page.
    """
    try:
        import pypdfium2 as pdfium
        import pytesseract
        from PIL import Image
        
        pdf = pdfium.PdfDocument(content)
        text = ""
        
        for i in range(len(pdf)):
            page = pdf[i]
            # Render page as image at 300 DPI for good OCR quality
            bitmap = page.render(scale=300/72)
            pil_image = bitmap.to_pil()
            
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            page_text = pytesseract.image_to_string(pil_image)
            if page_text:
                text += page_text + "\n"
            
            page.close()
        
        pdf.close()
        return text
        
    except ImportError as e:
        print(f"PDF OCR import error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="OCR libraries not available. Please install pytesseract and ensure Tesseract OCR is installed on the system."
        )
    except Exception as e:
        print(f"PDF OCR error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to OCR PDF pages: {str(e)}")


def extract_text_from_image(content: bytes) -> str:
    """
    Extract text from image using OCR (Tesseract).
    """
    try:
        import pytesseract
        from PIL import Image
        
        image = Image.open(io.BytesIO(content))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Extract text using OCR
        text = pytesseract.image_to_string(image)
        
        return text
        
    except ImportError:
        raise HTTPException(
            status_code=500, 
            detail="OCR library not installed. Please install pytesseract and Pillow."
        )
    except Exception as e:
        error_msg = str(e)
        print(f"OCR extraction error: {error_msg}")
        if "tesseract is not installed" in error_msg.lower() or "not in your path" in error_msg.lower():
            raise HTTPException(
                status_code=500, 
                detail="Tesseract OCR is not installed on this system. Please install Tesseract OCR (https://github.com/UB-Mannheim/tesseract/wiki) and add it to PATH."
            )
        raise HTTPException(status_code=500, detail=f"Failed to extract text from image: {error_msg}")


def extract_soil_values(text: str) -> dict:
    """
    Extract soil parameter values using multiple strategies:
    1. Rule-based regex patterns (for clean text)
    2. Table-row parsing with fuzzy matching (for OCR-garbled text)
    
    Args:
        text: Extracted text from PDF or image
        
    Returns:
        dict: Extracted soil parameters
    """
    # Strategy 1: Clean regex patterns
    results = _extract_with_regex(text)
    
    # Strategy 2: If regex didn't find enough, try table parsing
    if len(results) < 3:
        print(f"🔄 Regex found only {len(results)} values, trying table parser...")
        table_results = _extract_from_table(text)
        # Merge: table results fill in gaps
        for key, value in table_results.items():
            if key not in results:
                results[key] = value
    
    print(f"✅ Final extracted values: {results}")
    return results


def _extract_with_regex(text: str) -> dict:
    """Strategy 1: Extract using clean regex patterns."""
    patterns = {
        'ph': [
            r'pH\s*:?\s*(\d+\.?\d*)',
            r'Soil\s+pH\s*:?\s*(\d+\.?\d*)',
            r'pH\s+value\s*:?\s*(\d+\.?\d*)',
            r'pH\s+level\s*:?\s*(\d+\.?\d*)',
            r'pH\s*=\s*(\d+\.?\d*)',
        ],
        'nitrogen': [
            r'(?:Nitrogen|N|Available\s+N)\s*:?\s*(\d+\.?\d*)',
            r'N\s*\(ppm\)\s*:?\s*(\d+\.?\d*)',
            r'N\s*\(mg/kg\)\s*:?\s*(\d+\.?\d*)',
            r'Total\s+N\s*:?\s*(\d+\.?\d*)',
            r'Nitrogen\s+content\s*:?\s*(\d+\.?\d*)',
            r'N\s*=\s*(\d+\.?\d*)',
        ],
        'phosphorus': [
            r'(?:Phosphorus|P|Available\s+P)\s*:?\s*(\d+\.?\d*)',
            r'P\s*\(ppm\)\s*:?\s*(\d+\.?\d*)',
            r'P\s*\(mg/kg\)\s*:?\s*(\d+\.?\d*)',
            r'P2O5\s*:?\s*(\d+\.?\d*)',
            r'Phosphorus\s+content\s*:?\s*(\d+\.?\d*)',
            r'P\s*=\s*(\d+\.?\d*)',
        ],
        'potassium': [
            r'(?:Potassium|K|Available\s+K)\s*:?\s*(\d+\.?\d*)',
            r'K\s*\(ppm\)\s*:?\s*(\d+\.?\d*)',
            r'K\s*\(mg/kg\)\s*:?\s*(\d+\.?\d*)',
            r'K2O\s*:?\s*(\d+\.?\d*)',
            r'Potassium\s+content\s*:?\s*(\d+\.?\d*)',
            r'K\s*=\s*(\d+\.?\d*)',
        ],
        'fertility_index': [
            r'Fertility\s+Index\s*:?\s*(\d+\.?\d*)',
            r'Soil\s+Fertility\s*:?\s*(\d+\.?\d*)',
            r'Fertility\s+Rating\s*:?\s*(\d+\.?\d*)',
            r'FI\s*:?\s*(\d+\.?\d*)',
        ]
    }
    
    results = {}
    
    for param, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value = float(match.group(1))
                    
                    # Validate ranges
                    if param == 'ph' and (value < 0 or value > 14):
                        continue
                    elif param in ['nitrogen', 'phosphorus', 'potassium'] and (value < 0 or value > 1000):
                        continue
                    elif param == 'fertility_index' and (value < 0 or value > 1):
                        continue
                    
                    results[param] = value
                    print(f"  [regex] Extracted {param}: {value}")
                    break
                    
                except (ValueError, IndexError):
                    continue
    
    return results


def _extract_from_table(text: str) -> dict:
    """
    Strategy 2: Parse OCR table rows with fuzzy parameter matching.
    Handles garbled OCR output like: 'piece | 89 | wm | Neon'
    """
    results = {}
    
    # Fuzzy name matching: OCR commonly garbles these parameter names
    # Map partial/garbled text to parameter keys
    param_hints = {
        'ph': ['ph', 'piece', 'pice', 'piee', 'p.h', 'p h', 'pii'],
        'nitrogen': ['nitrogen', 'nitro', 'nit', 'nitr', 'n ', 'nitogen'],
        'phosphorus': ['phosphorus', 'phospho', 'phos', 'pion', 'phosp', 'phosph'],
        'potassium': ['potassium', 'potas', 'peon', 'potas', 'potass', 'pot'],
    }
    
    # Split text into lines and look for table-row patterns
    lines = text.split('\n')
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        # Split by common table delimiters: | [ ] or multiple spaces
        cells = re.split(r'[|\[\]]+', line_stripped)
        cells = [c.strip() for c in cells if c.strip()]
        
        if len(cells) < 2:
            continue
        
        # Try to identify the parameter from first cell (name column)
        first_cell = cells[0].lower().strip('()[] ')
        matched_param = None
        
        for param, hints in param_hints.items():
            for hint in hints:
                if hint in first_cell or first_cell in hint:
                    matched_param = param
                    break
                # Also check edit distance for short garbled text
                if len(first_cell) >= 2 and len(hint) >= 2:
                    if _fuzzy_match(first_cell, hint):
                        matched_param = param
                        break
            if matched_param:
                break
        
        if not matched_param:
            continue
        
        # Try to extract a numeric value from remaining cells
        for cell in cells[1:]:
            # Extract numbers from the cell
            numbers = re.findall(r'(\d+\.?\d*)', cell)
            for num_str in numbers:
                try:
                    value = float(num_str)
                    
                    # Apply smart validation and correction
                    value = _validate_and_correct(matched_param, value)
                    if value is not None:
                        results[matched_param] = value
                        print(f"  [table] Extracted {matched_param}: {value} (from cell '{cell}')")
                        break
                except ValueError:
                    continue
            if matched_param in results:
                break
    
    return results


def _fuzzy_match(text: str, target: str, threshold: int = 2) -> bool:
    """Simple fuzzy matching based on character overlap."""
    if len(text) < 2 or len(target) < 2:
        return False
    
    # Check if significant portion of characters match
    common = sum(1 for c in text if c in target)
    min_len = min(len(text), len(target))
    
    return common >= min_len - threshold


def _validate_and_correct(param: str, value: float) -> float:
    """
    Validate and potentially correct OCR-misread values.
    E.g., OCR reads '89' for pH which should be '8.9'
    """
    if param == 'ph':
        # pH must be 0-14
        if 0 <= value <= 14:
            return value
        # Common OCR error: decimal point missed (89 → 8.9, 65 → 6.5)
        if 30 <= value <= 140:
            corrected = value / 10
            if 3 <= corrected <= 10:  # Reasonable pH range for soil
                print(f"    [correction] pH {value} → {corrected} (decimal point likely missed by OCR)")
                return corrected
        return None
    
    elif param == 'nitrogen':
        # Nitrogen in ppm: typically 10-500
        if 0 <= value <= 500:
            return value
        # Possible decimal missed: 898 → 89.8
        if value > 500:
            corrected = value / 10
            if 0 <= corrected <= 500:
                return corrected
        return None
    
    elif param == 'phosphorus':
        # Phosphorus in ppm: typically 1-100
        if 0 <= value <= 100:
            return value
        # Possible decimal missed: 718 → 71.8 or 7.18
        if 100 < value <= 1000:
            corrected = value / 10
            if 0 <= corrected <= 100:
                return corrected
        if value > 1000:
            corrected = value / 100
            if 0 <= corrected <= 100:
                return corrected
        return None
    
    elif param == 'potassium':
        # Potassium in ppm: typically 10-500
        if 0 <= value <= 500:
            return value
        if value > 500:
            corrected = value / 10
            if 0 <= corrected <= 500:
                return corrected
        return None
    
    elif param == 'fertility_index':
        # Fertility index: 0-1
        if 0 <= value <= 1:
            return value
        if 1 < value <= 10:
            return value / 10
        if 10 < value <= 100:
            return value / 100
        return None
    
    return value


@router.get("/health")
async def health_check():
    """Health check endpoint for soil data extraction service"""
    try:
        import pdfplumber
        import pytesseract
        from PIL import Image
        
        return {
            "status": "healthy",
            "pdfplumber": "installed",
            "pytesseract": "installed",
            "pillow": "installed"
        }
    except ImportError as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "Some required packages are not installed"
        }
