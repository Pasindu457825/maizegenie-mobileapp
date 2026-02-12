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
        dict: Extracted soil parameters including values and status classifications
    """
    try:
        content = await file.read()
        
        if file.content_type == "application/pdf":
            extracted_data = extract_from_pdf(content)
        elif file.content_type and file.content_type.startswith("image/"):
            text = extract_text_from_image(content)
            print(f"📝 OCR text ({len(text)} chars):\n{text[:800]}")
            extracted_data = extract_soil_values(text)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or image.")
        
        if not extracted_data:
            raise HTTPException(
                status_code=422, 
                detail="Could not extract soil data. Please ensure the document contains a soil test report table with values for pH, Nitrogen, Phosphorus, Potassium."
            )
        
        print(f"✅ Final result: {extracted_data}")
        return extracted_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# =============================================================================
# PDF EXTRACTION (3-strategy approach)
# =============================================================================

def extract_from_pdf(content: bytes) -> dict:
    """
    Extract soil data from PDF using multiple strategies in order:
    1. pdfplumber table extraction (best for structured table PDFs)
    2. pdfplumber text extraction + regex parsing
    3. OCR fallback (for scanned/image PDFs)
    """
    
    # Strategy 1: pdfplumber TABLE extraction
    print("📊 Strategy 1: Trying pdfplumber table extraction...")
    result = _try_pdfplumber_tables(content)
    if result and len(result) >= 3:
        print(f"  ✅ Table extraction found {len(result)} fields")
        return result
    
    # Strategy 2: pdfplumber TEXT extraction + regex
    print("📝 Strategy 2: Trying pdfplumber text extraction...")
    result = _try_pdfplumber_text(content)
    if result and len(result) >= 3:
        print(f"  ✅ Text extraction found {len(result)} fields")
        return result
    
    # Strategy 3: OCR fallback
    print("🔍 Strategy 3: Falling back to OCR...")
    text = _extract_text_via_ocr(content)
    if text.strip():
        print(f"📝 OCR text ({len(text)} chars):\n{text[:800]}")
        result = extract_soil_values(text)
        if result:
            print(f"  ✅ OCR extraction found {len(result)} fields")
            return result
    
    return {}


def _try_pdfplumber_tables(content: bytes) -> dict:
    """
    Strategy 1: Use pdfplumber's table detection to extract structured tables.
    This is the most accurate method for PDFs with proper table structure.
    """
    try:
        import pdfplumber
        
        results = {}
        
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                
                if not tables:
                    continue
                
                print(f"  Found {len(tables)} table(s) on page {page_num + 1}")
                
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    
                    print(f"  Table rows: {table}")
                    
                    # Find the header row to identify column positions
                    header_row = None
                    data_start = 0
                    
                    for i, row in enumerate(table):
                        if row and any(_is_header_cell(cell) for cell in row if cell):
                            header_row = row
                            data_start = i + 1
                            break
                    
                    # Parse each data row
                    for row in table[data_start:]:
                        if not row or not row[0]:
                            continue
                        
                        param_name = str(row[0]).strip().lower()
                        
                        # Find the value (usually second column)
                        value_str = str(row[1]).strip() if len(row) > 1 and row[1] else None
                        
                        # Find the status (usually last column with text like Low/Medium/High)
                        status_str = None
                        for cell in reversed(row[1:]):
                            if cell and _is_status_value(str(cell).strip()):
                                status_str = str(cell).strip()
                                break
                        
                        # Map parameter name to field
                        field = _identify_parameter(param_name)
                        if not field or not value_str:
                            continue
                        
                        # Parse numeric value
                        try:
                            value = float(value_str)
                            results[field] = value
                            print(f"  [table] {field} = {value}")
                            
                            # Also extract status if present
                            if status_str:
                                status_key = field + "_status"
                                if field in ['nitrogen', 'phosphorus', 'potassium']:
                                    results[status_key] = _normalize_status(status_str)
                                    print(f"  [table] {status_key} = {results[status_key]}")
                        except (ValueError, TypeError):
                            print(f"  [table] Could not parse value '{value_str}' for {field}")
                            continue
        
        return results
        
    except ImportError:
        print("  pdfplumber not installed")
        return {}
    except Exception as e:
        print(f"  Table extraction error: {str(e)}")
        return {}


def _try_pdfplumber_text(content: bytes) -> dict:
    """
    Strategy 2: Extract text using pdfplumber and parse with regex.
    """
    try:
        import pdfplumber
        
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        if text.strip():
            print(f"  Text found ({len(text)} chars):\n{text[:500]}")
            return extract_soil_values(text)
        
        return {}
        
    except ImportError:
        return {}
    except Exception as e:
        print(f"  Text extraction error: {str(e)}")
        return {}


def _extract_text_via_ocr(content: bytes) -> str:
    """
    Strategy 3: Convert PDF pages to images and OCR them.
    Tries multiple preprocessing approaches and returns the best result.
    """
    try:
        import pypdfium2 as pdfium
        import pytesseract
        from PIL import Image, ImageEnhance, ImageFilter
        
        pdf = pdfium.PdfDocument(content)
        
        # Collect all page images at high DPI
        page_images = []
        for i in range(len(pdf)):
            page = pdf[i]
            bitmap = page.render(scale=400/72)  # 400 DPI for finer detail
            pil_image = bitmap.to_pil()
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            page_images.append(pil_image)
            page.close()
        pdf.close()
        
        # Try multiple OCR strategies and pick the best
        best_text = ""
        best_field_count = 0
        
        strategies = [
            ("raw", "--psm 3"),           # No preprocessing, auto page segmentation
            ("raw", "--psm 6"),           # No preprocessing, uniform text block
            ("contrast", "--psm 3"),      # Light contrast boost
            ("contrast", "--psm 6"),      # Light contrast boost, uniform block
            ("sharpen", "--psm 3"),       # Sharpen + contrast
        ]
        
        for preprocess_name, psm_config in strategies:
            text = ""
            for pil_image in page_images:
                processed = _preprocess_image(pil_image, preprocess_name)
                try:
                    page_text = pytesseract.image_to_string(processed, config=psm_config)
                    if page_text:
                        text += page_text + "\n"
                except Exception as e:
                    print(f"    OCR error with {preprocess_name}/{psm_config}: {e}")
                    continue
            
            # Count how many soil fields this strategy found
            field_count = _count_soil_fields(text)
            print(f"  [{preprocess_name}/{psm_config}] → {field_count} fields, {len(text)} chars")
            
            if field_count > best_field_count:
                best_field_count = field_count
                best_text = text
            elif field_count == best_field_count and len(text) > len(best_text):
                best_text = text
            
            # If we found all major fields, stop early
            if field_count >= 4:
                print(f"  ✅ Good enough result with {preprocess_name}/{psm_config}")
                break
        
        return best_text
        
    except ImportError as e:
        print(f"  OCR import error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="OCR libraries not available. Please install pytesseract and pypdfium2."
        )
    except Exception as e:
        print(f"  OCR error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to OCR PDF pages: {str(e)}")


def _preprocess_image(image, method: str):
    """Apply preprocessing to an image for OCR."""
    from PIL import ImageEnhance, ImageFilter
    
    if method == "raw":
        # Convert to grayscale only
        return image.convert('L')
    
    elif method == "contrast":
        # Grayscale + moderate contrast boost
        img = image.convert('L')
        enhancer = ImageEnhance.Contrast(img)
        return enhancer.enhance(1.5)
    
    elif method == "sharpen":
        # Grayscale + sharpen + contrast
        img = image.convert('L')
        img = img.filter(ImageFilter.SHARPEN)
        enhancer = ImageEnhance.Contrast(img)
        return enhancer.enhance(1.5)
    
    return image.convert('L')


def _count_soil_fields(text: str) -> int:
    """Quick count of how many soil parameters are findable in the text."""
    count = 0
    text_lower = text.lower()
    
    # Check for key parameter names
    if re.search(r'ph\s*[\|:\s]+\d', text_lower):
        count += 1
    if re.search(r'nitrogen', text_lower) and re.search(r'\d+\.?\d*\s*(?:ppm|mg)', text_lower):
        count += 1
    if re.search(r'phosphorus', text_lower) and re.search(r'\d+\.?\d*\s*(?:ppm|mg)', text_lower):
        count += 1
    if re.search(r'potassium', text_lower) and re.search(r'\d+\.?\d*\s*(?:ppm|mg)', text_lower):
        count += 1
    if re.search(r'fertility', text_lower):
        count += 1
    if re.search(r'organic\s*carbon', text_lower):
        count += 1
    
    return count




# =============================================================================
# IMAGE EXTRACTION
# =============================================================================

def extract_text_from_image(content: bytes) -> str:
    """
    Extract text from image using OCR (Tesseract).
    Tries multiple preprocessing strategies and returns the best result.
    """
    try:
        import pytesseract
        from PIL import Image, ImageEnhance
        
        image = Image.open(io.BytesIO(content))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Try multiple strategies, pick the one with the most soil fields
        best_text = ""
        best_field_count = 0
        
        strategies = [
            ("raw", "--psm 3"),
            ("raw", "--psm 6"),
            ("contrast", "--psm 3"),
            ("contrast", "--psm 6"),
            ("sharpen", "--psm 3"),
        ]
        
        for preprocess_name, psm_config in strategies:
            processed = _preprocess_image(image, preprocess_name)
            try:
                text = pytesseract.image_to_string(processed, config=psm_config)
            except Exception:
                continue
            
            field_count = _count_soil_fields(text)
            print(f"  [img {preprocess_name}/{psm_config}] → {field_count} fields, {len(text)} chars")
            
            if field_count > best_field_count:
                best_field_count = field_count
                best_text = text
            elif field_count == best_field_count and len(text) > len(best_text):
                best_text = text
            
            if field_count >= 4:
                print(f"  ✅ Good enough with {preprocess_name}/{psm_config}")
                break
        
        return best_text
        
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
                detail="Tesseract OCR is not installed. Please install Tesseract OCR and add it to PATH."
            )
        raise HTTPException(status_code=500, detail=f"Failed to extract text from image: {error_msg}")


# =============================================================================
# VALUE EXTRACTION (from text)
# =============================================================================

def extract_soil_values(text: str) -> dict:
    """
    Extract soil values from text using regex patterns.
    Handles multiple report formats including line-based and table-like text.
    """
    results = {}
    
    # Regex patterns for each parameter
    patterns = {
        'ph': [
            r'pH\s*[:\|]?\s*(\d+\.?\d*)',
            r'Soil\s+pH\s*[:\|]?\s*(\d+\.?\d*)',
            r'pH\s+value\s*[:\|]?\s*(\d+\.?\d*)',
        ],
        'nitrogen': [
            r'Nitrogen\s*\(?N?\)?\s*[:\|]?\s*(\d+\.?\d*)',
            r'(?:Available\s+)?N\s*[:\|]?\s*(\d+\.?\d*)\s*(?:ppm|mg)',
            r'Total\s+N\s*[:\|]?\s*(\d+\.?\d*)',
        ],
        'phosphorus': [
            r'Phosphorus\s*\(?P?\)?\s*[:\|]?\s*(\d+\.?\d*)',
            r'(?:Available\s+)?P\s*[:\|]?\s*(\d+\.?\d*)\s*(?:ppm|mg)',
            r'P2O5\s*[:\|]?\s*(\d+\.?\d*)',
        ],
        'potassium': [
            r'Potassium\s*\(?K?\)?\s*[:\|]?\s*(\d+\.?\d*)',
            r'(?:Available\s+)?K\s*[:\|]?\s*(\d+\.?\d*)\s*(?:ppm|mg)',
            r'K2O\s*[:\|]?\s*(\d+\.?\d*)',
        ],
        'organic_carbon': [
            r'Organic\s+Carbon\s*[:\|]?\s*(\d+\.?\d*)',
            r'OC\s*[:\|]?\s*(\d+\.?\d*)\s*%',
        ],
        'fertility_index': [
            r'Fertility\s+Index\s*[:\|]?\s*(\d+\.?\d*)',
            r'Soil\s+Fertility\s*[:\|]?\s*(\d+\.?\d*)',
            r'FI\s*[:\|]?\s*(\d+\.?\d*)',
        ]
    }
    
    # Also try to extract status values alongside numeric values
    status_patterns = {
        'nitrogen_status': [
            r'Nitrogen\s*\(?N?\)?\s*[\|\s]+[\d.]+\s*[\|\s]+\w+\s*[\|\s]+(\w+)',
        ],
        'phosphorus_status': [
            r'Phosphorus\s*\(?P?\)?\s*[\|\s]+[\d.]+\s*[\|\s]+\w+\s*[\|\s]+(\w+)',
        ],
        'potassium_status': [
            r'Potassium\s*\(?K?\)?\s*[\|\s]+[\d.]+\s*[\|\s]+\w+\s*[\|\s]+(\w+)',
        ],
    }
    
    # Extract numeric values
    for param, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value = float(match.group(1))
                    
                    # Basic range validation (no "correction" — trust the extracted value)
                    if param == 'ph' and not (0 <= value <= 14):
                        continue
                    elif param in ['nitrogen', 'phosphorus', 'potassium'] and not (0 <= value <= 1000):
                        continue
                    elif param == 'fertility_index' and not (0 <= value <= 1):
                        continue
                    elif param == 'organic_carbon' and not (0 <= value <= 20):
                        continue
                    
                    results[param] = value
                    print(f"  [regex] {param} = {value}")
                    break
                except (ValueError, IndexError):
                    continue
    
    # Extract status values
    for param, pattern_list in status_patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                status = _normalize_status(match.group(1))
                if status:
                    results[param] = status
                    print(f"  [regex] {param} = {status}")
                    break
    
    # Also try line-by-line table parsing for OCR text
    if len(results) < 3:
        print("  Trying line-by-line table parsing...")
        line_results = _parse_table_lines(text)
        for key, value in line_results.items():
            if key not in results:
                results[key] = value
    
    return results


def _parse_table_lines(text: str) -> dict:
    """
    Parse OCR text line by line, looking for table-like rows.
    Each line might look like: 'pH    6.44   -   Slightly Acidic'
    or with delimiters: 'Nitrogen (N) | 89.9 | ppm | Medium'
    """
    results = {}
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Split by table delimiters OR multiple whitespace
        cells = re.split(r'[|\[\]]+|\s{2,}', line)
        cells = [c.strip() for c in cells if c.strip()]
        
        if len(cells) < 2:
            continue
        
        # Identify parameter from first cell
        first_cell = cells[0].lower().strip()
        field = _identify_parameter(first_cell)
        
        if not field or field in results:
            continue
        
        # Find numeric value in remaining cells
        for cell in cells[1:]:
            numbers = re.findall(r'(\d+\.?\d+|\d+)', cell.strip())
            for num_str in numbers:
                try:
                    value = float(num_str)
                    # Simple validation — no correction
                    if field == 'ph' and not (0 <= value <= 14):
                        continue
                    if field in ['nitrogen', 'phosphorus', 'potassium'] and not (0 <= value <= 1000):
                        continue
                    if field == 'fertility_index' and not (0 <= value <= 1):
                        continue
                    if field == 'organic_carbon' and not (0 <= value <= 20):
                        continue
                    
                    results[field] = value
                    print(f"  [line] {field} = {value}")
                    break
                except ValueError:
                    continue
            if field in results:
                break
        
        # Find status in remaining cells
        if field in ['nitrogen', 'phosphorus', 'potassium']:
            for cell in cells[1:]:
                status = _normalize_status(cell.strip())
                if status:
                    results[field + "_status"] = status
                    print(f"  [line] {field}_status = {status}")
                    break
    
    return results


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _identify_parameter(text: str) -> Optional[str]:
    """Map parameter name text to a standard field name."""
    text = text.lower().strip()
    
    # Direct matches
    if re.match(r'^ph\b', text) or text in ['p.h', 'p h', 'ph']:
        return 'ph'
    if 'nitrogen' in text or text.startswith('n ') or text == 'n':
        return 'nitrogen'
    if 'phosphorus' in text or text.startswith('p ') or text == 'p':
        return 'phosphorus'
    if 'potassium' in text or text.startswith('k ') or text == 'k':
        return 'potassium'
    if 'organic' in text and 'carbon' in text:
        return 'organic_carbon'
    if 'fertility' in text:
        return 'fertility_index'
    
    return None


def _is_header_cell(text: str) -> bool:
    """Check if a cell is likely a table header."""
    if not text:
        return False
    t = text.strip().lower()
    return t in ['parameter', 'value', 'unit', 'status', 'result', 'level',
                 'parameters', 'values', 'units', 'results', 'levels']


def _is_status_value(text: str) -> bool:
    """Check if text looks like a soil status classification."""
    if not text:
        return False
    t = text.strip().lower()
    return t in ['low', 'medium', 'high', 'very low', 'very high', 
                 'deficient', 'sufficient', 'excessive', 'adequate',
                 'slightly acidic', 'neutral', 'acidic', 'alkaline',
                 'strongly acidic', 'moderately acidic', 'slightly alkaline']


def _normalize_status(text: str) -> Optional[str]:
    """Normalize status text to standard values."""
    if not text:
        return None
    t = text.strip().lower()
    
    if t in ['low', 'deficient', 'very low']:
        return 'Low'
    elif t in ['medium', 'moderate', 'adequate', 'sufficient', 'normal']:
        return 'Medium'
    elif t in ['high', 'excessive', 'very high']:
        return 'High'
    
    return None


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
