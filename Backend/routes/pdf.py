# routes/pdf.py
# PDF upload and processing endpoints

import json
import logging
import time
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from config import MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, RATE_LIMIT_UPLOADS
from services.pdf_service import extract_text_from_pdf
from services.ai_service import analyze_lab_results

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def _create_fallback_response(raw_text: str) -> dict:
    """
    Create a user-friendly fallback response when JSON parsing fails.
    """
    # Clean up the raw text - remove JSON artifacts
    cleaned_text = raw_text
    
    # Remove common JSON artifacts that might appear
    import re
    cleaned_text = re.sub(r'^[\s\{]*"?\w+"?\s*:\s*"?', '', cleaned_text)
    cleaned_text = re.sub(r'"\s*,?\s*"?\w+"?\s*:\s*"?', '\n\n', cleaned_text)
    cleaned_text = re.sub(r'"\s*\}?\s*$', '', cleaned_text)
    cleaned_text = cleaned_text.replace('\\n', '\n')
    
    return {
        "interpretacionConceptos": "⚠️ **Nota:** Hubo un problema al estructurar la respuesta. A continuación se muestra el análisis en formato de texto.",
        "resultadosSimplificados": cleaned_text.strip(),
        "resumenEjecutivo": "La respuesta de la IA no pudo ser procesada correctamente. Por favor, revisa los resultados simplificados."
    }


@router.post("/upload-pdf")
@limiter.limit(RATE_LIMIT_UPLOADS)
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    """
    Upload a PDF file and get AI-powered analysis of lab results.
    Rate limited to prevent API abuse.
    """
    start_time = time.time()
    logger.info(f"Recibiendo archivo: {file.filename}")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")
    
    # Validate content type
    if file.content_type and file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="El tipo de contenido debe ser application/pdf.")
    
    # Read PDF content
    pdf_bytes = await file.read()
    logger.info(f"✅ PDF leído: {len(pdf_bytes)} bytes")
    
    # Validate file size
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413, 
            detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE_MB}MB."
        )
    
    # Validate minimum file size (empty or corrupted files)
    if len(pdf_bytes) < 100:
        raise HTTPException(status_code=400, detail="El archivo está vacío o es inválido.")
    
    # Validate PDF magic number (PDF files start with %PDF)
    if not pdf_bytes.startswith(b'%PDF'):
        raise HTTPException(status_code=400, detail="El archivo no es un PDF válido.")
    
    try:
        # Extract text from PDF
        texto_completo, num_paginas = extract_text_from_pdf(pdf_bytes)
        
        # Generate AI analysis
        analysis_result_str = analyze_lab_results(texto_completo)
        logger.info(f"🤖 Respuesta de IA recibida: {analysis_result_str[:200]}...")
        
        # Parse JSON response with better error recovery
        try:
            analysis_result_json = json.loads(analysis_result_str)
        except json.JSONDecodeError as e:
            logger.error(f"Error al decodificar JSON de la IA: {e}")
            
            # Try to extract JSON from response (sometimes AI wraps it in markdown)
            import re
            json_match = re.search(r'\{[\s\S]*\}', analysis_result_str)
            
            if json_match:
                try:
                    analysis_result_json = json.loads(json_match.group())
                    logger.info("✅ JSON extraído exitosamente del texto")
                except json.JSONDecodeError:
                    analysis_result_json = _create_fallback_response(analysis_result_str)
            else:
                analysis_result_json = _create_fallback_response(analysis_result_str)
        
        # Check if the PDF is a valid lab exam
        if not analysis_result_json.get("isValid", True):
            error_message = analysis_result_json.get("errorMessage", "El documento no es un resultado de laboratorio válido.")
            logger.warning(f"⚠️ PDF no válido: {error_message}")
            raise HTTPException(
                status_code=400, 
                detail=error_message
            )
        
        # Calculate processing time
        end_time = time.time()
        processing_time = round(end_time - start_time, 2)
        logger.info(f"Tiempo de procesamiento: {processing_time}s")
        
        return {
            "message": "PDF procesado correctamente",
            "filename": file.filename,
            "pages": num_paginas,
            "processing_time": processing_time,
            "analysis_result": analysis_result_json
        }
        
    except Exception as e:
        logger.error(f"❌ Error procesando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")
